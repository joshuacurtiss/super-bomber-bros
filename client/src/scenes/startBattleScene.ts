import k from '../kaboom'
import {WHITE} from '../types'
import {getMusVol} from '../util'

export default function () {
    const {
        add, go, keyPress, origin, pos, play, text, width, height
    } = k
    const music = play('menu-3', {loop: true, volume: getMusVol()})
    add([
        text("Battle Round", 18),
        WHITE,
        origin('center'),
        pos(width()*0.5, height()*0.25 )
    ])
    add([
        text("Not available yet!", 12),
        WHITE,
        origin('center'),
        pos(width()*0.5, height()*0.4 )
    ])
    add([
        text("Press spacebar to go back", 9),
        WHITE,
        origin('center'),
        pos(width()*0.5, height()*0.6 )
    ])
    const mainAction = () => {
        music.stop()
        go('mainMenu', 1)
    }
    keyPress('space', mainAction)
    keyPress('enter', mainAction)
    keyPress('escape', mainAction)
}