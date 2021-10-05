import { Client, Room } from "colyseus.js";
import { Schema } from "@colyseus/schema";
import { CMDS } from '../../../shared/types'

const THROTTLE = 100
const RETRY_MAX = 14
const RETRY_DELAY = 1000

function delay(time:number) {
    return new Promise(resolve => {
        setTimeout(()=>resolve(2), time);
    });
}

export default class {

    client: Client
    room: Room
    lastUpdate: number = 0
    owner = false

    constructor(
        public id,
        public wsuri='',
        public enabled=false
    ) {
        if( !this.wsuri.length ) {
            const host = location.host.replace(/:.*/, '')
            this.wsuri = location.protocol.replace('http', 'ws') + '/' + '/' + host + (location.port ? ':'+location.port : '')
            // TODO: Don't keep this in here forever
            if( host==='www.curtiss.me' ) this.wsuri = 'wss://bomberbros.curtiss.me' + (location.port ? ':'+location.port : '')
        }
        return this
    }

    connect(newuri?: string) {
        if( !this.enabled) return
        if( newuri ) this.wsuri=newuri
        this.client = new Client(this.wsuri)
    }

    async create(roomName: string, cb?: (Room)=>void): Promise<boolean> {
        this.room = null
        for (let attempt=0 ; attempt < RETRY_MAX && !this.room && this.enabled ; attempt++) {
            try {
                console.log(`Trying to create room "${roomName}"...`, attempt)
                if( attempt ) await delay(RETRY_DELAY)
                this.room = await this.client.create('game', {roomName}) as Room
            } catch (err) {
                console.error(err)
            }
        }
        if( this.room ) {
            this.owner = true
            if( cb ) cb(this.room)
            console.log(`Created "${roomName}" room.`)
        }
        return !!this.room
    }

    async join(roomId: string, name?: string, cb?: (Room)=>void): Promise<boolean> {
        this.room = null
        for (let attempt=0 ; attempt < RETRY_MAX && !this.room && this.enabled ; attempt++) {
            try {
                console.log(`Trying to join room ${roomId}...`, attempt)
                if( attempt ) await delay(RETRY_DELAY)
                this.room = await this.client.joinById(roomId, {name}) as Room
            } catch (err) {
                console.error(err)
            }
        }
        if( this.room ) {
            if( cb ) cb(this.room)
            console.log(`Joined room ${roomId}!`)
        }
        return !!this.room
    }

    async reconnect(cb?: (Room)=>void): Promise<boolean> {
        const {id, sessionId} = this.room
        this.room = null
        for (let attempt=0 ; attempt < RETRY_MAX && !this.room && this.enabled ; attempt++) {
            try {
                console.log("Trying to reconnect...", attempt)
                await delay(RETRY_DELAY)
                this.room = await this.client.reconnect(id, sessionId) as Room
            } catch (err) {
                console.error(err)
            }
        }
        if( this.room ) {
            if( cb ) cb(this.room)
            console.log(`Reconnected room ${this.room.id}!`)
        } else {
            console.log("Never could reconnect.")
        }
        return !!this.room
    }

    async lobby(cb?: (Room)=>void): Promise<boolean> {
        this.room = null
        for (let attempt=0 ; attempt < RETRY_MAX && !this.room && this.enabled ; attempt++) {
            try {
                console.log("Connecting to lobby...", attempt)
                if( attempt ) await delay(RETRY_DELAY)
                this.room = await this.client.joinOrCreate('lobby') as Room
            } catch (err) {
                console.error(err)
            }
        }
        if( this.room ) {
            if( cb ) cb(this.room)
            console.log(`Welcome to the lobby!`)
        }
        return !!this.room
    }

    leave(consented?: boolean) {
        if( !this.enabled ) return
        if( !this.room ) return
        this.room.removeAllListeners()
        this.room.leave(consented)
    }
    
    send(cmd: string, data={}) {
        // Stop if not enabled
        if( !this.enabled ) return
        if( !this.room ) return
        // Throttling for moves
        if( cmd === CMDS.PLAYER_MOVE ) {
            const now = Date.now()
            if( now-this.lastUpdate < THROTTLE) return
            this.lastUpdate = now
        }
        // Made it this far? Send!
        this.room.send(cmd, data)
    }

    sendToClient(cmd: string, sessionId: string, data={}) {
        // Stop if not enabled
        if( !this.enabled ) return
        if( !this.room ) return
        // Made it this far? Send!
        this.room.send(CMDS.MESSAGE_CLIENT, {cmd, sessionId, data})
    }

    on(cmd: string, func: (any)=>void) {
        // Stop if not enabled
        if( !this.enabled ) return
        // Listen
        this.room.onMessage(cmd, func)
    }

    onWildcard(func: (type: string | number | Schema, message: any) => void) {
        // Stop if not enabled
        if( !this.enabled ) return
        // List
        this.room.onMessage('*', func)
    }

    removeAllListeners(): void {
        this.room?.removeAllListeners()
    }

}
 export {
     CMDS,
 }