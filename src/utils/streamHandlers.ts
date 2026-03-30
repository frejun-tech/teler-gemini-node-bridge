import { StreamHandlerResult, StreamOP } from "@frejun/teler";

export const callStreamHandler = async (message: string): Promise<StreamHandlerResult> => {
    try {
        const data = JSON.parse(message);
        if(data["type"] === "audio") {
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
                // Receiving Audio
                if (serverContent.modelTurn?.parts) {
                    for (const part of serverContent.modelTurn.parts) {
                        if (part.inlineData) {
                            const audioData = part.inlineData.data; // Base64 encoded string
                            // Process or play audioData
                            messageBuffer.push(Buffer.from(audioData, 'base64'));
                            console.log(`Received audio data (base64 len: ${audioData.length})`);
                        }
                    }
                    const audioData = Buffer.concat(messageBuffer).toString('base64');
                    const payload = JSON.stringify({
                        "type": "audio",
                        "audio_b64": audioData,
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