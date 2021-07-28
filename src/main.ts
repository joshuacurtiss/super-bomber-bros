import kaboom from 'kaboom'

const k=kaboom({
    clearColor: [0, 0, 0, 1],
    fullscreen: true,
    scale: 2,
    debug: true,
})

const {
    add, body, color, go, height, keyPress, origin, pos, text, scene, sprite, start, width, loadSprite,
} = k

loadSprite('bomberman', 'assets/bomberman.png')

scene('start', ()=>{
    add([
        text("Hello world!", 16),
        color(1, 1, 1, 1),
        origin('center'),
        pos(width()*0.5, height()*0.4 )
    ])
    add([
        text("Press spacebar to start", 9),
        color(1, 1, 1, 1),
        origin('center'),
        pos(width()*0.5, height()*0.6 )
    ])
    keyPress('space', ()=>{
        go('game')
    })
})

scene('game', ()=>{
    const player = add([
		sprite('bomberman'),
		pos(80, 80),
	]);
})

start('start')