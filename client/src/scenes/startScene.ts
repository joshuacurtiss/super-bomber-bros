import createTitle from './createTitle'
import {k} from '../kaboom'
import {WHITE} from '../types'

export default function () {
    const {
        add, go, keyPress, origin, pos, text, width, height
    } = k
    createTitle()
    add([
        text("Press spacebar to begin!", 14, {noArea: true}),
        WHITE,
        origin('center'),
        pos(width()*0.5, height()*0.65 ),
    ])
    // Keypresses
    const mainAction = ()=>go('mainMenu')
    keyPress('space', mainAction)
    keyPress('enter', mainAction)
}