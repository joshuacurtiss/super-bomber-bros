import k from '../kaboom'
import {WHITE} from '../types'

export default function () {
    const {
        add, go, keyPress, origin, pos, play, text, width, height
    } = k
    const loop = true
    const volume = 0.25
    const music = play('menu-2', {loop, volume})
    add([
        text("Preferences", 18),
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
    keyPress('space', ()=>{
        music.stop()
        go('start', 2)
    })
}