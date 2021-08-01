import { Vec2 } from 'kaboom'
import k from '../kaboom'

const {
    vec2
} = k

function canWalk(speed: number = 120) {
    let walking=false
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
            this.move(dir.scale(speed))
        },
    }
}

export default canWalk