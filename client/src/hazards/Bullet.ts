import k from '../kaboom'
import { 
    GRID_PIXEL_SIZE,
    MAP_HEIGHT_PIXELS,
} from '../types'

const {
    add,
    destroy,
    play,
    pos,
    rand,
    scale,
    sprite,
    width,
} = k

export default function() {
    play('bullet')
    const dir = rand()>0.5 ? 1 : -1
    const bullet = add([
        sprite('bullet'),
        scale(dir, 1),
        pos(dir===1 ? -GRID_PIXEL_SIZE*3 : width()+GRID_PIXEL_SIZE, Math.floor(rand(0, MAP_HEIGHT_PIXELS-GRID_PIXEL_SIZE))),
        'hazard',
        'can-hurt-player',
    ])
    bullet.action(()=>{
        bullet.move(125 * bullet.scale.x,0)
        if( bullet.scale.x>0 && bullet.pos.x > width() ) destroy(bullet)
        if( bullet.scale.x<0 && bullet.pos.x < -bullet.width ) destroy(bullet)
    })
}