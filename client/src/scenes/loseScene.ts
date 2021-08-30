import k from '../kaboom'

export default function () {
    const {
        add, color, go, keyPress, origin, pos, scale, sprite, text, width, height
    } = k
    add([
        sprite('gameover', {noArea: true}),
        origin('center'),
        pos(width()*0.5, height()*0.4),
        scale(2),
    ])
    add([
        text("Press spacebar to try again", 9),
        color(1, 1, 1, 1),
        origin('center'),
        pos(width()*0.5, height()*0.6 )
    ])
    const mainAction = () => {
        go('mainMenu')
    }
    keyPress('space', mainAction)
    keyPress('enter', mainAction)
    keyPress('escape', mainAction)
}