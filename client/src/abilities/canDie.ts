import { Vec2 } from 'kaboom'
import { CMDS } from '../model/Network'
import { k, network } from '../kaboom'

const {
    destroy,
    play,
} = k

export default function() {
    let dead=false
    return {
        isDead: ()=>dead,
        isAlive: ()=>!dead,
        die() {
            if( dead ) return
            dead=true
            play('die')
            this.trigger('died')
            network.send(CMDS.PLAYER_DIE)
            destroy(this)
        },
    }
}
