import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port:                   Number(process.env.PORT) || 8000,
    nodeEnv:                process.env.NODE_ENV || 'development',
    serverHost:             process.env.SERVER_HOST || '0.0.0.0',
    serverDomain:           process.env.SERVER_DOMAIN || '',

    telerKey:               process.env.TELER_API_KEY || '',
    geminisApiKey:       process.env.GEMINIS_API_KEY || '',
    googleApiKey:        process.env.GOOGLE_API_KEY || '',
    geminiModel:           process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    geminiSystemMessage:      process.env.GEMINI_SYSTEM_MESSAGE || 'You are a helpful assistant that helps users to transcribe audio files into text. You will receive audio files in chunks, and you need to transcribe them into text. Please provide the transcription in a clear and concise manner.',
    geminiAudioChunkCount: Number(process.env.GEMINI_AUDIO_CHUNK_COUNT) || 5,

} as const;