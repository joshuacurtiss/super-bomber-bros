import k from '../kaboom'
import {WHITE} from '../types'
import {getMusVol} from '../util'

export default function (playerCount: number=1, level: number=1) {
    const {
        add, color, go, keyPress, origin, pos, play, text, width, height
    } = k
    const music = play('menu-4', {loop: true, volume: getMusVol()})
    add([
        text(`Level ${level}`, 18),
        color(WHITE),
        origin('center'),
        pos(width()*0.5, height()*0.3)
    ])
    add([
        text("Get Ready!", 12),
        color(WHITE),
        origin('center'),
        pos(width()*0.5, height()*0.4 )
    ])
    add([
        text("Press spacebar to begin", 9),
        color(WHITE),
        origin('center'),
        pos(width()*0.5, height()*0.6)
    ])
    const mainAction = () => {
        music.stop()
        go('game', playerCount, level, false)
    }
    keyPress('space', mainAction)
    keyPress('enter', mainAction)
}