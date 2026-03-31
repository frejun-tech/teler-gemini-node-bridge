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

export let remoteWsURL: WebSocket;
wss.on('connection', async (callWs: WebSocket) => {
    console.log('Teler connected to WebSocket');
    remoteWsURL = await connector.bridgeStream(callWs as any);
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