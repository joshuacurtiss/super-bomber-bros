import k from '../kaboom'

export default async function () {
    const {
        add, color, go, keyPress, loadSprite, origin, pos, scale, sprite, text, width, height
    } = k
    const images = ['super', 'bomber', 'bros'].map(img=>loadSprite(`title-${img}`, `assets/title/${img}.png`))
    await Promise.all(images)
    add([
        sprite('title-super'),
        pos(width()*0.5, height()*0.3),
        scale(1.8),
        origin('center')
    ])
    add([
        sprite('title-bomber'),
        pos(width()*0.5 - 60, height()*0.45),
        scale(1.15),
        origin('center')
    ])
    add([
        sprite('title-bros'),
        pos(width()*0.5 + 120, height()*0.45),
        scale(1.5),
        origin('center')
    ])
    add([
        text("Press spacebar to start", 10),
        color(1, 1, 1, 1),
        origin('center'),
        pos(width()*0.5, height()*0.66 )
    ])
    // URL 
    const params = new URLSearchParams(location.search)
    const level = params.get('level')==null ? 1 : params.get('level')
    keyPress('space', ()=>{
        go('game', level)
    })
}