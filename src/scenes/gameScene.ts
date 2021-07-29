import k from '../kaboom'
import {Vec2} from 'kaboom'

const GRID_SIZE = 32
const WALK_SPEED = 120
const {
    add, 
    addLevel, 
    debug,
    get,
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
    width, 
} = k

const map = [
    'XXXXXXXXXXXXXXX',
    'X   ## ####   X',
    'X X#XXX#X#XXX X',
    'X ### ##X#### X',
    'X#XXX#X XXX#X#X',
    'X#X#### ##X###X',
    'X#X#X#X X#X#X#X',
    'X###X## ####X#X',
    'X#X#XXX X#XXX#X',
    'X  ## X### ## X',
    'X XXX#X#XXX#X X',
    'X   #### ##   X',
    'XXXXXXXXXXXXXXX',
]

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
        'X': [sprite('block'), scale(2), solid()],
        '#': [sprite('brick'), scale(2), solid()],
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