import k from '../kaboom'
import {Vec2} from 'kaboom'

const GRID_SIZE = 32
const WALK_SPEED = 120
const {
    add, 
    addLevel, 
    debug,
    destroy,
    dt,
    get,
    go, 
    height, 
    keyDown, 
    keyPress, 
    layer,
    layers, 
    origin,
    pos, 
    rotate,
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

function bombTimer() {
    let timer = 3
    return {
        update() {
            timer-=dt()
            if( timer<0 ) this.explode()
        },
        explode() {
            const EXP_SCALE = 0.66666667
            const expPos = {x: this.pos.x + GRID_SIZE/2, y: this.pos.y + GRID_SIZE/2} as Vec2
            const expOrigin = add([
                sprite('explosion'),
                scale(EXP_SCALE),
                layer('bomb'),
                origin('center'),
                pos(expPos),
            ])
            const expEnds = [
                add([
                    sprite('explosion'),
                    origin('center'),
                    scale(EXP_SCALE),
                    layer('bomb'),
                    pos(expPos.x + GRID_SIZE, expPos.y),
                ]),
                add([
                    sprite('explosion'),
                    origin('center'),
                    scale(-EXP_SCALE, EXP_SCALE),
                    layer('bomb'),
                    pos(expPos.x - GRID_SIZE, expPos.y),
                ]),
                add([
                    sprite('explosion'),
                    origin('center'),
                    scale(EXP_SCALE, -EXP_SCALE),
                    rotate(33),
                    layer('bomb'),
                    pos(expPos.x, expPos.y + GRID_SIZE),
                ]),
                add([
                    sprite('explosion'),
                    origin('center'),
                    scale(EXP_SCALE),
                    rotate(33),
                    layer('bomb'),
                    pos(expPos.x, expPos.y - GRID_SIZE),
                ]), 
            ]
            destroy(this)
            expOrigin.play('explode-origin')
            expEnds.forEach(exp=>exp.play('explode-end'))
            wait(0.7, ()=>{
                destroy(expOrigin)
                expEnds.forEach(exp=>destroy(exp))
            })
        }
    }
}

function spawnBomb(spawnPosition:Vec2) {
    let {x, y} = spawnPosition
    // Snap the bomb to the grid size
    let modX = x % GRID_SIZE
    let modY = y % GRID_SIZE
    const bombPosition = {
        x: Math.round(x - modX + (modX<=GRID_SIZE/2 ? 0 : GRID_SIZE)),
        y: Math.round(y - modY + (modY<=GRID_SIZE/2 ? 0 : GRID_SIZE)),
    } as Vec2
    // Check if a bomb is already here, and only spawn if it is clear
    const bombs = get('bomb')
    if( bombs.length===0 || bombs.filter(bomb=>bomb.pos.eq(bombPosition)).length===0 ) {
        debug.log(`Bomb at ${bombPosition.x}, ${bombPosition.y}.`)
        const bomb = add([
            sprite('bomb'),
            scale(2),
            layer('bomb'),
            pos(bombPosition),
            bombTimer(),
            'bomb'
        ])
        bomb.play('bomb')
    }
}

export default function () {
    layers(['bg', 'bomb', 'obj', 'ui'], 'obj')
    const mapConfig = {
        width: GRID_SIZE,
        height: GRID_SIZE,
        scale: 2,
        '#': [sprite('block'), scale(2), solid()],
        'O': [sprite('brick'), scale(2), solid()],
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
        pos(GRID_SIZE, GRID_SIZE),
        scale(0.92),
    ])
    player.action(() => {
        player.resolve()
        if (
            player.pos.y >= height() - player.height ||
            player.pos.y <= 0 ||
            player.pos.x >= width() - player.width ||
            player.pos.x <= 0
        ) {
            go("lose");
        }
    });
    keyPress('space', ()=>spawnBomb(player.pos))
    keyDown('left', ()=>player.move(-WALK_SPEED, 0))
    keyDown('right', ()=>player.move(WALK_SPEED, 0))
    keyDown('up', ()=>player.move(0, -WALK_SPEED))
    keyDown('down', ()=>player.move(0, WALK_SPEED))
}