import {k} from '../kaboom'
import {WHITE} from '../types'

function blowup() {
    return {
        update() {
            this.scale = Math.abs(Math.sin(k.time()) * 1.5)+1.5
        },
    }
}

export default function () {
    const {
        add, go, keyPress, origin, pos, scale, sprite, text, width, height
    } = k
    add([
        sprite('title-super'),
        pos(width()*0.5, height()*0.25),
        scale(1.8),
        blowup(),
        origin('center')
    ])
    add([
        sprite('title-bomber'),
        pos(width()*0.5 - 60, height()*0.4),
        scale(1.15),
        origin('center')
    ])
    add([
        sprite('title-bros'),
        pos(width()*0.5 + 120, height()*0.4),
        scale(1.5),
        origin('center')
    ])
    add([
        text("Press spacebar to begin!", 14),
        WHITE,
        origin('center'),
        pos(width()*0.5, height()*0.65 ),
    ])
    // Keypresses
    const mainAction = ()=>go('mainMenu')
    keyPress('space', mainAction)
    keyPress('enter', mainAction)
}