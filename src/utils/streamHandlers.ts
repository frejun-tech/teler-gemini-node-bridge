import { StreamHandlerResult, StreamOP } from "@frejun/teler";
import { remoteWsURL } from "./wsServer";
import { WebSocket } from "ws";
import { AudioProcessor } from "./audioProcessor";
import { configMessage } from "../core/geminiConfig";

const audioProcessor = new AudioProcessor();
let isConfSent = false;

export const callStreamHandler = async (message: string): Promise<StreamHandlerResult> => {
    try {
        const data = JSON.parse(message);
        if(remoteWsURL.readyState === WebSocket.OPEN && data["type"] === "audio") {
            const wsPayload = {
                realtimeInput: {
                    audio: {
                        data: data["data"]["audio_b64"],
                        mimeType: 'audio/pcm;rate=16000'
                    }
                }
            };
            const payload: string = JSON.stringify(wsPayload);
            return [payload, StreamOP.RELAY];
        } else if(!isConfSent) {
            console.log('Configuration sent');
            isConfSent = true;
            return [configMessage, StreamOP.RELAY];
        }

        return ['', StreamOP.PASS];
    } catch(err) {
        console.log("Error in call stream handler", err);
        return ['', StreamOP.PASS];
    }
}

export const remoteStreamHandler = () => {
    let chunk_id = 1
    const messageBuffer: Buffer[] = [];

    const handler = async(message: string): Promise<StreamHandlerResult> => {
        try {
            const data = JSON.parse(message); 
            if (data.serverContent) {
                const serverContent = data.serverContent;

                if (serverContent?.modelTurn?.parts) {
                    const turnBuffer: Buffer[] = [];  

                    for (const part of serverContent.modelTurn.parts) {
                        if (part.inlineData) {
                            const audioData = part.inlineData.data;
                            turnBuffer.push(Buffer.from(audioData, 'base64'));
                        }
                    }

                    if (turnBuffer.length === 0) return ["", StreamOP.PASS]; 

                    const audioData = Buffer.concat(turnBuffer);
                    const float32Data = audioProcessor.convertFloat32Data(audioData);
                    const downsampled = audioProcessor.downsampleBuffer(float32Data, 24000, 8000);
                    const audio8kBase64 = Buffer.from(audioProcessor.convertFloat32ToInt16(downsampled)).toString('base64');

                        const payload = JSON.stringify({
                            "type": "audio",
                            "audio_b64": audio8kBase64,
                            "chunk_id": chunk_id++,
                        })
                        messageBuffer.length = 0;
                        console.log("Relaying to Teler...");
                        return [payload, StreamOP.RELAY];
                    }
            } else if (data["type"] == "interruption") {
                const payload = JSON.stringify({"type": "clear"});
                return [payload, StreamOP.RELAY];
            } 

            return ['', StreamOP.PASS];
        } catch (err) {
            console.log("Error in remote stream handler", err);
            return ['', StreamOP.PASS];
        }
    }

    return handler;
}