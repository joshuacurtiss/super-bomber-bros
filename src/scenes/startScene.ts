import k from '../kaboom'

export default function () {
    const {
        add, color, go, keyPress, origin, pos, scale, sprite, text, width, height
    } = k
    add([
		sprite('title-bomberman'),
		pos(width()*0.43, height()*0.3),
        scale(1.2),
        origin('center')
	])
    add([
		sprite('title-mario'),
		pos(width()*0.57, height()*0.3),
        scale(2),
        origin('center')
	])
    add([
        text("Super Bomber Bros", 16),
        color(1, 1, 1, 1),
        origin('center'),
        pos(width()*0.5, height()*0.5 )
    ])
    add([
        text("Press spacebar to start", 9),
        color(1, 1, 1, 1),
        origin('center'),
        pos(width()*0.5, height()*0.7 )
    ])
    keyPress('space', ()=>{
        go('game')
    })
}