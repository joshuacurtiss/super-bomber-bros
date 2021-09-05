import { Vec2 } from 'kaboom'
import { CMDS } from '../model/Network'
import { POWERUPS, WALK_SPEED } from '../types'
import { vec2floor } from '../util'
import { k, debug, network } from '../kaboom'

const {
    time,
    vec2,
} = k

function canWalk(speed: number = WALK_SPEED) {
    let walking=false
    let multiplier=1
    let multiplierTimeout=0
    let dir=vec2(0,1)
    return {
        isIdle: ()=>!walking,
        isWalking: ()=>walking,
        getDir: ()=>dir,
        stop() {
            walking=false
            network.send(CMDS.PLAYER_STOP)
        },
        walk(direction: Vec2) {
            if( this.isDead() ) return
            walking=true
            dir=direction
            this.move(dir.scale(speed*multiplier))
            const roundedPos = vec2floor(this.pos)
            network.send(CMDS.PLAYER_MOVE, [
                roundedPos.x,
                roundedPos.y,
                dir.x,
                dir.y,
                walking,
            ])
        },
        walkPowerup(index: number) {
            if( index===POWERUPS.SPEED ) {
                multiplier=2
                multiplierTimeout = (multiplierTimeout>0 ? multiplierTimeout : time()) + 30
                debug(`Greased LIGHTNING!`)
            }
        },  
        update() {
            this.resolve()
            if( multiplierTimeout===0 ) return
            if( time() > multiplierTimeout ) {
                multiplierTimeout=0
                multiplier=1
                debug("Back to normal speed.")
            }
        }
    }
}

export default canWalk