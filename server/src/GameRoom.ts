import { Context, defineTypes, MapSchema, Schema } from '@colyseus/schema'
import { Client, Room, updateLobby } from 'colyseus'
import { CHARACTERS, CMDS, GAMETYPES } from '../../shared/types'

/**
 * Create another context to avoid these types from being in the user's global `Context`
 */
const context = new Context()

class Player extends Schema {
    public connected: boolean
    public name: string
    public sessionId: string
    public owner?: boolean
    public character: CHARACTERS
    public score: number = 0
    public lives: number = 3
}
defineTypes(Player, {
    connected: 'boolean',
    name: 'string',
    sessionId: 'string',
    owner: 'boolean',
    character: 'string',
    score: 'number',
    lives: 'number',
}, context)

class State extends Schema {
    public players = new MapSchema<Player>()
    public playerCount = 0
    public level = 1
    public type: GAMETYPES = GAMETYPES.CAMPAIGN
    public roomName = ''
    public locked = false
}
defineTypes(State, {
    players: { map: Player },
    playerCount: 'number',
    level: 'number',
    type: 'string',
    roomName: 'string',
    locked: 'boolean',
}, context)

export class GameRoom extends Room<State> {

    // Default 15 sec for allow reconnection
    public allowReconnectionTime: number = 15

    private copyStateToMetadata(): void {
        const meta = this.state.toJSON() as Partial<State>
        delete meta.players
        this.setMetadata(meta)
    }

    public onCreate(options: Partial<{
        maxClients: number,
        allowReconnectionTime: number,
        roomName: string,
    }>) {
        this.setState(new State())

        // Max Clients
        if (options.maxClients) this.maxClients = options.maxClients

        // Allow reconnection time (no more than 40 sec)
        if (options.allowReconnectionTime) this.allowReconnectionTime = Math.min(options.allowReconnectionTime, 40)

        // Room name
        if (options.roomName) this.state.roomName = options.roomName
        
        // Update metadata
        this.copyStateToMetadata()

        // Client provided a room update.
        this.onMessage(CMDS.ROOM_STATE_UPDATE, (client, data: Partial<State>)=>{
            if( client.sessionId!==this.owner.sessionId ) return
            console.log("Update room:", this.roomId, data)
            Object.assign(this.state, data)
            this.copyStateToMetadata()
            updateLobby(this)
        })

        // Client provided a player update.
        this.onMessage(CMDS.PLAYER_STATE_UPDATE, (client, data: Partial<Player>)=>{
            // If you didn't provide your sessionId, abort
            if( !data.sessionId ) return
            // Player can only be edited by themselves or room owner
            if( data.sessionId!==client.sessionId && client.sessionId!==this.owner.sessionId ) return
            const player = this.state.players.get(data.sessionId)
            Object.assign(player, data)
            this.state.players.set(data.sessionId, player)
        })

        // Send a message to a specific client.
        this.onMessage(CMDS.MESSAGE_CLIENT, (_, msg)=>{
            const {cmd, sessionId, data} = msg
            this.clients.find(c=>c.sessionId===sessionId)?.send(cmd, data)
        })

        // Broadcast all other messages to room clients
        this.onMessage('*', (client: Client, type: string, message: any) => {
            this.broadcast(type, [client.sessionId, message], { except: client })
        })
    }

    public onJoin(client: Client, options: any = {}) {
        // Set up new player
        const player = new Player()
        player.connected = true
        player.sessionId = client.sessionId
        player.name = options.name || ''
        // For now, the owner does not pass their name, so that's how we know he's the owner. TODO: This should be improved.
        player.owner = ! options.hasOwnProperty('name')

        // Add the player to the room state
        this.state.players.set(client.sessionId, player)

        // Send room enter notification to owner, only if he wasn't just entering himself
        if( this.ownerClient?.sessionId !== client.sessionId ) this.ownerClient?.send(CMDS.ROOM_ENTER, [player.sessionId, {name: player.name}])
    }

    public async onLeave(client: Client, consented: boolean) {
        if (this.allowReconnectionTime > 0) {
            const player = this.state.players.get(client.sessionId);
            player.connected = false;
            try {
                if (consented) throw new Error('consented leave');
                console.log(`Client ${client.sessionId} disconnected. Allow reconnection within ${this.allowReconnectionTime}.`)
                await this.allowReconnection(client, this.allowReconnectionTime);
                player.connected = true;
            } catch (e) {
                this.state.players.delete(client.sessionId);
                // If the owner can't be found, that means it's the owner who just got deleted.
                if( !this.owner ) {
                    // If owner left, disconnect the game.
                    console.log(`Owner seems to have left. Disconnect room:`, this.roomId)
                    this.disconnect()
                } else {
                    // Otherwise, just tell the owner that this person left.
                    console.log(`Player left:`, this.roomId, client.sessionId)
                    this.ownerClient?.send(CMDS.ROOM_EXIT, [client.sessionId])
                }
            }
        }
    }

    public get owner(): Player {
        return Array.from(this.state.players.values()).find(p=>p.owner)
    }

    public get ownerClient(): Client {
        return this.clients.find(c=>c.sessionId===this.owner?.sessionId)
    }

}