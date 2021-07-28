import k from '../kaboom'

export default function () {
    const WALK_SPEED = 120
    const {
        add, addLevel, keyDown, layer, layers, pos, scale, sprite, height, width, go, solid,
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
        width: 32,
        height: 32,
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
        pos(32, 30),
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