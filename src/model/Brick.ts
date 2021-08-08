import k from '../kaboom'
import {POWERUPS} from '../types'

const {
    add,
    area,
    destroy,
    play,
    pos,
    rand,
    randSeed,
    scale,
    sprite,
    vec2,
    wait,
} = k

function randomPowerup():number {
    const validIndices = Object.values(POWERUPS)
    const index = Math.floor(rand(0, 30))
    return validIndices.includes(index) ? index : -1
}

export default function() {
    randSeed(Date.now());
    return {
        explode() {
            play('breakbrick')
            destroy(this)
            const explodingBrick = add([
                sprite('brick'),
                scale(2),
                pos(this.pos),
            ])
            explodingBrick.play('explode')
            wait(0.5, ()=>{
                const frame = randomPowerup()
                if( frame>=0 ) {
                    play('powerupappears')
                    add([
                        sprite('powerups', {frame}),
                        scale(2),
                        area(vec2(4,4), vec2(12,12)),
                        pos(explodingBrick.pos),
                        'powerup',
                    ])
                }
                destroy(explodingBrick)
            })
        }
    }
}
