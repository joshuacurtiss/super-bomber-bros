import k from '../kaboom'
import canBomb from '../abilities/canBomb'
import canWalk from '../abilities/canWalk'
import brick from '../model/Brick'
import timer from '../model/Timer'
import {convertMapPosToCoord, findMapItem} from '../util'
import {GRID_PIXEL_SIZE} from '../types'

const DEFAULT_GAME_TIME = 180

const {
    add, 
    addLevel, 
    area,
    collides,
    color,
    debug,
    destroy,
    go, 
    keyDown, 
    keyPress, 
    layer,
    layers, 
    pos, 
    rect,
    scale, 
    solid,
    sprite,
    text,
    vec2, 
    wait,
} = k

const map = [
    '###############',
    '#1  OO OOOO  2#',
    '# #O###O#O### #',
    '# OOO OO#OOOO #',
    '#O###O# ###O#O#',
    '#O#OOOO OO#OOO#',
    '#O#O#O# #O#O#O#',
    '#OOO#OO OOOO#O#',
    '#O#O### #O###O#',
    '# OOO #OOO OO #',
    '# ###O#O###O# #',
    '#4  OOOO OO  3#',
    '###############',
]

const noArea = true

const mapWidth = map[0].length
const mapWidthPixels = mapWidth * GRID_PIXEL_SIZE
const mapHeight = map.length
const mapHeightPixels = mapHeight * GRID_PIXEL_SIZE

const WHITE = color(1, 1, 1)
const BLUE = color(0.39, 0.47, 0.937)
const GREEN = color(0.223, 0.517, 0)

export default function () {
    
    // Layers
    layers(['bg', 'bomb', 'obj', 'ui'], 'obj')
    
    // Level/Map
    const mapConfig = {
        width: GRID_PIXEL_SIZE,
        height: GRID_PIXEL_SIZE,
        pos: vec2(0, GRID_PIXEL_SIZE),
        scale: 2,
        '#': [sprite('block'), scale(2), solid(), 'block'],
        'O': [sprite('brick'), scale(2), solid(), brick(), 'brick'],
        any: (ch) => null,
    }
    addLevel(map, mapConfig)
    add([
        rect(mapWidthPixels, mapHeightPixels, {noArea}),
        pos(0, GRID_PIXEL_SIZE),
        GREEN,
        layer('bg'),
    ])

    // Header/Timer
    add([rect(mapWidthPixels-1, GRID_PIXEL_SIZE-1, {noArea}), WHITE])
    add([rect(mapWidthPixels-5, GRID_PIXEL_SIZE-5, {noArea}), pos(2, 2), BLUE])
    const timerLabel = add([
        text("", 16),
        pos(12, 9),
        timer(DEFAULT_GAME_TIME),
    ]);
    timerLabel.on('timer_end', ()=>{
        go('lose')
    })

    // Player
    const {x: playerX, y: playerY} = convertMapPosToCoord(findMapItem(map, '1'))
    const player = add([
        sprite('bomberman'),
        pos(playerX-7, playerY-12),
        scale(1.3),
        area(vec2(8,10), vec2(26,34)),
        canBomb(),
        canWalk(),
        'player',
    ])
    player.action(() => {
        player.resolve()
    })
    collides('explosion', 'player', (exp, player)=>{
        destroy(player)
        wait(1, ()=>{
            go('lose')
        })
    })

    // Controls
    keyPress('space', ()=>{
        timerLabel.start()
        player.spawnBomb()
    })
    keyDown('left', ()=>{
        timerLabel.start()
        player.walk(-1, 0)
    })
    keyDown('right', ()=>{
        timerLabel.start()
        player.walk(1, 0)
    })
    keyDown('up', ()=>{
        timerLabel.start()
        player.walk(0, -1)
    })
    keyDown('down', ()=>{
        timerLabel.start()
        player.walk(0, 1)
    })
}