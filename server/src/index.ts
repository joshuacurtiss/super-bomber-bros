import { GameRoom } from './GameRoom'
import { Server, LobbyRoom } from 'colyseus'
import { WebSocketTransport } from '@colyseus/ws-transport'
import { monitor } from '@colyseus/monitor'
import { createServer } from 'http'
import express from 'express'
import path from 'path'

const port = Number(process.env.port || 8000)
const app = express()
app.use(express.json())
app.use('/', express.static(path.join(__dirname, '..', '..', 'dist')))
app.use('/colyseus', monitor());

const gameServer = new Server({
    transport: new WebSocketTransport({
        server: createServer(app),
    })
})

// Define "lobby" room
gameServer.define("lobby", LobbyRoom);

// Define "game" room
gameServer.define("game", GameRoom, { maxClients: 8 }).enableRealtimeListing();

gameServer.onShutdown(function(){
    console.log(`Game server is going down.`);
});

gameServer.listen(port)
console.log(`Listening on port ${port}.`);
