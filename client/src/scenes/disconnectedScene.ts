import {k, network} from '../kaboom'
import {getSfxVol} from '../util'

export default function () {
    const {
        add, color, go, keyPress, origin, play, pos, scale, sprite, text, width, height
    } = k
    const sound = play('disconnected', {volume: getSfxVol()})
    add([
        sprite('bowser'),
        scale(2),
        origin('center'),
        pos(width()*0.5, height()*0.3 )
    ])
    add([
        text("Oh no! You lost your connection!", 14),
        color(1, 1, 1, 1),
        origin('center'),
        pos(width()*0.5, height()*0.5 )
    ])
    add([
        text("Press spacebar to start over", 9),
        color(1, 1, 1, 1),
        origin('center'),
        pos(width()*0.5, height()*0.6 )
    ])
    const mainAction = () => {
        sound.stop()
        go('mainMenu')
    }
    keyPress('space', mainAction)
    keyPress('enter', mainAction)
    keyPress('escape', mainAction)
    network.enabled=false
}