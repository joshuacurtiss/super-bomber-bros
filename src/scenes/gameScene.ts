import k from '../kaboom'
import bomb from '../model/Bomb'
import {GRID_PIXEL_SIZE} from '../types'

const WALK_SPEED = 120
const {
    add, 
    addLevel, 
    destroy,
    go, 
    height, 
    keyDown, 
    keyPress, 
    layer,
    layers, 
    overlaps,
    pos, 
    scale, 
    solid,
    sprite, 
    wait,
    width, 
} = k

const map = [
    '###############',
    '#   OO OOOO   #',
    '# #O###O#O### #',
    '# OOO OO#OOOO #',
    '#O###O# ###O#O#',
    '#O#OOOO OO#OOO#',
    '#O#O#O# #O#O#O#',
    '#OOO#OO OOOO#O#',
    '#O#O### #O###O#',
    '# OOO #OOO OO #',
    '# ###O#O###O# #',
    '#   OOOO OO   #',
    '###############',
]

export default function () {
    layers(['bg', 'bomb', 'obj', 'ui'], 'obj')
    const mapConfig = {
        width: GRID_PIXEL_SIZE,
        height: GRID_PIXEL_SIZE,
        scale: 2,
        '#': [sprite('block'), scale(2), solid()],
        'O': [sprite('brick'), scale(2), solid(), 'brick'],
        any: (ch) => null,
    }
    addLevel(map, mapConfig)
    add([
        sprite('space'),
        scale(15*2, 13*2),
        layer('bg'),
    ])
    const player = add([
        sprite('bomberman'),
        pos(GRID_PIXEL_SIZE, GRID_PIXEL_SIZE),
        scale(0.92),
        bomb(),
        'player',
    ])
    player.action(() => {
        player.resolve()
        if (
            player.pos.y >= height() - player.height ||
            player.pos.y <= 0 ||
            player.pos.x >= width() - player.width ||
            player.pos.x <= 0
        ) {
            go("lose")
        }
    })
    overlaps('explosion', 'player', (exp, player)=>{
        destroy(player)
        wait(1, ()=>{
            go('lose')
        })
    })
    keyPress('space', ()=>player.spawnBomb())
    keyDown('left', ()=>player.move(-WALK_SPEED, 0))
    keyDown('right', ()=>player.move(WALK_SPEED, 0))
    keyDown('up', ()=>player.move(0, -WALK_SPEED))
    keyDown('down', ()=>player.move(0, WALK_SPEED))
}