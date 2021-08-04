import { Vec2 } from 'kaboom'
import k from '../kaboom'

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
            play('die')
            this.trigger('died')
            destroy(this)
        },
    }
}
