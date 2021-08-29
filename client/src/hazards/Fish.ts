import k from '../kaboom'
import {getAtPos} from '../util'
import {
    GRID_PIXEL_SIZE,
    MAP_WIDTH_PIXELS,
    MAP_HEIGHT_PIXELS,
} from '../types'

const {
    add,
    body,
    destroy,
    layer,
    pos,
    rand,
    scale,
    sprite,
} = k

export default function() {
    const dir = rand()>0.5 ? 1 : -1
    const jumpForce = rand(250, 550)
    const horizForce = rand(100, 250) * dir
    const x = dir>0 ? rand(-GRID_PIXEL_SIZE*4,MAP_WIDTH_PIXELS*0.3) : rand(MAP_WIDTH_PIXELS*0.7, MAP_WIDTH_PIXELS+GRID_PIXEL_SIZE*4)
    const y = MAP_HEIGHT_PIXELS+GRID_PIXEL_SIZE
    const fish = add([
        sprite('fish'),
        scale(dir*2, 2),
        // Added to 'ui' layer so he doesn't bump into things since he has a `body()` for the jump physics
        layer('ui'),
        pos(x, y),
        body({jumpForce}),
        'hazard',
    ])
    fish.play('fish')
    fish.jump()
    fish.action(()=>{
        fish.move(horizForce,0)
        if( fish.pos.y <= y ) {
            // We have to explicitly test for collisions at the fish's position since he is placed on a separate layer
            // so that he doesn't bump into things since he has a body for jump physics.
            getAtPos(fish.pos, 'player').forEach(obj=>{
                obj.die()
                destroy(fish)
            })
        } else {
            destroy(fish)
        }
    })
}
