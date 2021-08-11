import k from '../kaboom'

export default async function () {
    const {
        add, color, go, keyPress, loadSound, origin, play, pos, text, width, height
    } = k
    await loadSound('timeup', 'assets/sfx/smw_game_over.ogg')
    const timeupMusic = play('timeup')
    add([
        text("Time up!", 16),
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
        timeupMusic.stop()
        go('game')
    })
}