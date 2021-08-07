import { Vec2 } from 'kaboom'
import { updateLanguageServiceSourceFile } from 'typescript'
import k from '../kaboom'
import { POWERUPS, WALK_SPEED } from '../types'

const {
    debug,
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
        },
        walk(direction: Vec2) {
            walking=true
            dir=direction
            this.move(dir.scale(speed*multiplier))
        },
        walkPowerup(index: number) {
            if( index===POWERUPS.SPEED ) {
                multiplier=2
                multiplierTimeout = (multiplierTimeout>0 ? multiplierTimeout : time()) + 30
                debug.log(`Greased LIGHTNING!`)
            }
        },  
        update() {
            if( multiplierTimeout===0 ) return
            if( time() > multiplierTimeout ) {
                multiplierTimeout=0
                multiplier=1
                debug.log("Back to normal speed.")
            }
        }
    }
}

export default canWalk