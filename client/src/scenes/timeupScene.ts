import k from '../kaboom'
import {getMusVol} from '../util'

export default async function () {
    const {
        add, color, go, keyPress, loadSprite, loadSound, origin, play, pos, scale, sprite, text, width, height
    } = k
    await Promise.all([
        loadSprite('timeup', 'assets/title/timeup.png'),
        loadSound('timeup', 'assets/sfx/smw_game_over.ogg'),
    ])
    const timeupMusic = play('timeup', {volume: getMusVol()})
    add([
        sprite('timeup', {noArea: true}),
        scale(2),
        origin('center'),
        pos(width()*0.5, height()*0.4 )
    ])
    add([
        text("Press spacebar to try again", 9),
        color(1, 1, 1, 1),
        origin('center'),
        pos(width()*0.5, height()*0.6 )
    ])
    const mainAction = () => {
        timeupMusic.stop()
        go('game')
    }
    keyPress('space', mainAction)
    keyPress('enter', mainAction)
    keyPress('escape', mainAction)
}