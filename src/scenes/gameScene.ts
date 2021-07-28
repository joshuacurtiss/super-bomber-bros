import k from '../kaboom'

export default function () {
    const GRID_SIZE = 32
    const WALK_SPEED = 120
    const {
        add, addLevel, keyDown, keyPress, layer, layers, pos, scale, sprite, height, width, go, solid,
    } = k
    layers(['bg', 'obj', 'ui'], 'obj')
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
    const mapConfig = {
        width: GRID_SIZE,
        height: GRID_SIZE,
        scale: 2,
        ' ': [sprite('space'), scale(2)],
        'X': [sprite('block'), scale(2), solid()],
        '#': [sprite('brick'), scale(2), solid()],
        any(ch) {
            return null
        },
    }
    addLevel(map, mapConfig)
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
    keyPress('space', ()=>{
        // TODO: Logic for snapping to grid is not right, but I gotta go
        let {x, y} = player.pos
        let modX = x % GRID_SIZE
        let modY = y % GRID_SIZE
        x = Math.floor(x + (modX<=GRID_SIZE/2 ? -modX : modX))
        y = Math.floor(y + (modY<=GRID_SIZE/2 ? -modY : modY))
        const bomb = add([
            sprite('bomb'),
            scale(2),
            pos(x, y)
        ])
        bomb.play('bomb')
    })
    keyDown('left', ()=>{
        player.move(-WALK_SPEED, 0)
    })
    keyDown('right', ()=>{
        player.move(WALK_SPEED, 0)
    })
    keyDown('up', ()=>{
        player.move(0, -WALK_SPEED)
    })
    keyDown('down', ()=>{
        player.move(0, WALK_SPEED)
    })
}