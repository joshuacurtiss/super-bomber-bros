import { KaboomCtx, MsgHandler } from 'kaboom'

export enum CMDS {
    PLAYER_DIE = 'D',
    PLAYER_MOVE = 'M',
    PLAYER_STOP = 'S',
    BOMB_SPAWN = 'B',
    BOMB_EXPLODE = 'X'
}

const THROTTLE = 0.1

export default class {

    lastUpdate = -10

    constructor(public k: KaboomCtx, public enabled=false) {
        return this
    }
    
    send(cmd: string, data={}) {
        // Stop if not enabled
        if( !this.enabled ) return
        // Throttling for moves
        if( cmd === CMDS.PLAYER_MOVE ) {
            const now = this.k.time()
            if( now-this.lastUpdate < THROTTLE) return
            this.lastUpdate = now
        }
        // Made it this far? Send!
        this.k.send(cmd, data)
    }

    on(cmd: string, func: MsgHandler) {
        // Stop if not enabled
        if( !this.enabled ) return
        // Listen
        this.k.recv(cmd, func)
    }

}
