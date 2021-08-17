import * as http from 'http';
import * as WebSocket from 'ws';
import { AddressInfo } from 'net';
import express from 'express';
import path from 'path';

const port = Number(process.env.PORT || 8000) + Number(process.env.NODE_APP_INSTANCE || 0);
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use('/', express.static(path.join(__dirname, '..', '..', 'dist')));

wss.on('connection', (ws: WebSocket) => {
    ws.on('message', function message(msg) {
        console.log(`Received message ${msg}`);
    });
})

server.listen(port), ()=>{
    console.log(`Listening on port ${(server.address() as AddressInfo).port}`);
};