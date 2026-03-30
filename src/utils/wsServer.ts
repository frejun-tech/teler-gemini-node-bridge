import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { Socket } from 'net';
import { StreamConnector } from '@frejun/teler';
import { StreamType }      from '@frejun/teler';
import { callStreamHandler, remoteStreamHandler } from './streamHandlers';
import { config as cfg} from '../core/config';

export const wss = new WebSocketServer({ noServer: true });

const connector = new StreamConnector(
    `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${cfg.googleApiKey}`,
    StreamType.BIDIRECTIONAL,
    callStreamHandler,
    remoteStreamHandler()
);


wss.on('connection', async (callWs: WebSocket) => {
    console.log('Teler connected to WebSocket');
    const remoteWsURL = await connector.bridgeStream(callWs as any);
    remoteWsURL.onopen = () => {
        console.log('WebSocket Connected');

        const configMessage = {
            config: {
                model: `models/${cfg.geminiModel}`,
                responseModalities: ['AUDIO'],
                systemInstruction: {
                    parts: [{ text: 'You are a helpful assistant.' }]
                }
            }
        };
        remoteWsURL.send(JSON.stringify(configMessage));
        console.log('Configuration sent');
    };
});


export const handleUpgrade = (request: IncomingMessage, socket: Socket, head: Buffer) => {
    if (request.url === '/api/v1/media-stream') {
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws);
        });
    } else {
        socket.destroy();
    }
};