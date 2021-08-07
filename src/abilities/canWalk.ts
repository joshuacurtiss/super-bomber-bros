import { Vec2 } from 'kaboom'
import k from '../kaboom'
import { POWERUPS, WALK_SPEED } from '../types'

const {
    debug,
    vec2,
    wait,
} = k

function canWalk(speed: number = WALK_SPEED) {
    let walking=false
    let multiplier=1
    let dir=vec2(0,1)
    return {
        isIdle: ()=>!walking,
        isWalking: ()=>walking,
        getDir: ()=>dir,
        stop() {
            walking=false
        },
        walk(direction: Vec2) {
            walking=true
            dir=direction
            this.move(dir.scale(speed*multiplier))
        },
        walkPowerup(index: number) {
            if( index===POWERUPS.SPEED ) {
                multiplier=2
                wait(30, ()=>multiplier=1)
                debug.log(`Greased LIGHTNING!`)
            }
        }
    }
}

export default canWalk