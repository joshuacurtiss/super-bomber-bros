import { CMDS } from '../model/Network'
import { k, network } from '../kaboom'
import { getSfxVol } from '../util'
import {
    GRAVITY,
    HEAVY_GRAVITY,
} from '../types'

const {
    body,
    destroy,
    gravity,
    play,
    vec2,
    wait,
} = k

export default function() {
    let dead=false
    return {
        isDead: ()=>dead,
        isAlive: ()=>!dead,
        die() {
            if( dead ) return
            dead=true
            this.layer='ui'
            this.solid=false
            this.scale = this.scale.scale(2)
            this.pos=this.pos.sub(vec2(this.width, this.height))
            play('die', {volume: getSfxVol()})
            this.trigger('died')
            network.send(CMDS.PLAYER_DIE)
            wait(0.8, ()=>{
                this.use(body({jumpForce: 900, maxVel: 5000}))
                this.jump()
                gravity(HEAVY_GRAVITY)
            })
            wait(3, ()=>{
                destroy(this)
                gravity(GRAVITY)
            })
        },
    }
}
