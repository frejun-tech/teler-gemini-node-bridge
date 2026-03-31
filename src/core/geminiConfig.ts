import { config } from "./config";

export const configMessage = JSON.stringify({
    setup: {
        model: `models/${config.geminiModel}`,
        generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: {
                        voiceName: 'Aoede'
                    }
                }
            }
        },
        systemInstruction: {
            parts: [{ text: 'You are a helpful assistant.' }]
        }
    }
});