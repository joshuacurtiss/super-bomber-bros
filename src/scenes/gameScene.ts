import k from '../kaboom'
import bomb from '../model/Bomb'
import brick from '../model/Brick'
import timer from '../model/Timer'
import {GRID_PIXEL_SIZE} from '../types'

const WALK_SPEED = 120
const DEFAULT_GAME_TIME = 180

const {
    add, 
    addLevel, 
    area,
    collides,
    destroy,
    go, 
    height, 
    keyDown, 
    keyPress, 
    layer,
    layers, 
    pos, 
    scale, 
    solid,
    sprite,
    text,
    vec2, 
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
        '#': [sprite('block'), scale(2), solid(), 'block'],
        'O': [sprite('brick'), scale(2), solid(), brick(), 'brick'],
        any: (ch) => null,
    }
    addLevel(map, mapConfig)
    const timerLabel = add([
        text("", 18),
        pos(15, 6),
        timer(DEFAULT_GAME_TIME),
    ]);
    timerLabel.on('timer_end', ()=>{
        go('lose')
    })
    add([
        sprite('space'),
        scale(15*2, 13*2),
        layer('bg'),
    ])
    const player = add([
        sprite('bomberman'),
        pos(GRID_PIXEL_SIZE, GRID_PIXEL_SIZE),
        scale(0.92),
        area(vec2(9,5), vec2(25,32)),
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
    collides('explosion', 'player', (exp, player)=>{
        destroy(player)
        wait(1, ()=>{
            go('lose')
        })
    })
    keyPress('space', ()=>{
        if( !timerLabel.isStarted() ) timerLabel.start()
        player.spawnBomb()
    })
    keyDown('left', ()=>{
        if( !timerLabel.isStarted() ) timerLabel.start()
        player.move(-WALK_SPEED, 0)
    })
    keyDown('right', ()=>{
        if( !timerLabel.isStarted() ) timerLabel.start()
        player.move(WALK_SPEED, 0)
    })
    keyDown('up', ()=>{
        if( !timerLabel.isStarted() ) timerLabel.start()
        player.move(0, -WALK_SPEED)
    })
    keyDown('down', ()=>{
        if( !timerLabel.isStarted() ) timerLabel.start()
        player.move(0, WALK_SPEED)
    })
}