import {k} from '../kaboom'
import {WHITE, YELLOW} from '../types'

function blowup() {
    return {
        update() {
            this.scale = Math.abs(Math.sin(k.time()) * 1.5)+1.5
        },
    }
}

export default function (menuIndex=0) {
    const {
        add, go, keyPress, origin, play, pos, scale, sprite, text, width, height
    } = k
    const loop = true
    const volume = 0.25
    let music = play('menu-1', {loop, volume})
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
    const menu = [
        add([
            text("Start a Campaign", 14),
            WHITE,
            origin('center'),
            pos(width()*0.5, height()*0.55 ),
        ]),
        add([
            text("Play Battle Round", 14),
            WHITE,
            origin('center'),
            pos(width()*0.5, height()*0.65 ),
        ]),
        add([
            text("Preferences", 14),
            WHITE,
            origin('center'),
            pos(width()*0.5, height()*0.75 ),
        ]),
    ]
    const mushrooms = [
        add([sprite('title-mushroom'), pos(width()*.5-170,height()*.55), origin('center')]),
        add([sprite('title-mushroom'), pos(width()*.5+170,height()*.55), origin('center')]),
    ]
    // Keypresses
    const changeMenuIndex = (index:number) => {
        const {y} = menu[index].pos
        menu[menuIndex].color = WHITE.color
        menu[index].color = YELLOW.color
        mushrooms.forEach(m=>m.pos.y=y)
        menuIndex = index
    }
    keyPress('up', ()=>{
        changeMenuIndex(menuIndex===0 ? 0 : menuIndex-1)
    })
    keyPress('down', ()=>{
        changeMenuIndex(menuIndex===menu.length-1 ? menu.length-1 : menuIndex+1)
    })
    const mainAction = () => {
        music.stop()
        if( menuIndex===0 ) go('startCampaign')
        if( menuIndex===1 ) go('startBattle')
        if( menuIndex===2 ) go('pref')
    }
    keyPress('space', mainAction)
    keyPress('enter', mainAction)
    // Init
    changeMenuIndex(menuIndex)
}