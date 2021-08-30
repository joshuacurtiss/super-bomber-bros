import k from '../kaboom'
import {WHITE} from '../types'

export default function (level: number=1) {
    const {
        add, go, keyPress, origin, pos, play, text, width, height
    } = k
    const loop = true
    const volume = 0.25
    const music = play('menu-4', {loop, volume})
    add([
        text(`Level ${level}`, 18),
        WHITE,
        origin('center'),
        pos(width()*0.5, height()*0.3)
    ])
    add([
        text("Get Ready!", 12),
        WHITE,
        origin('center'),
        pos(width()*0.5, height()*0.4 )
    ])
    add([
        text("Press spacebar to begin", 9),
        WHITE,
        origin('center'),
        pos(width()*0.5, height()*0.6)
    ])
    keyPress('space', ()=>{
        music.stop()
        go('game', level, false)
    })
}