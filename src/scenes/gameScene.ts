import k from '../kaboom'

export default function () {
    const WALK_SPEED = 120
    const {
        add, keyDown, pos, sprite, height, width, go,
    } = k
    const player = add([
		sprite('bomberman'),
		pos(80, 80),
	])
    player.action(() => {
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