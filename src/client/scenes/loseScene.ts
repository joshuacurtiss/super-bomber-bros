import k from '../kaboom'

export default function () {
    const {
        add, color, go, keyPress, origin, pos, text, width, height
    } = k
    add([
        text("Game Over!", 16),
        color(1, 1, 1, 1),
        origin('center'),
        pos(width()*0.5, height()*0.4 )
    ])
    add([
        text("Press spacebar to try again", 9),
        color(1, 1, 1, 1),
        origin('center'),
        pos(width()*0.5, height()*0.6 )
    ])
    keyPress('space', ()=>{
        go('game')
    })
}