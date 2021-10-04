import createTitle from './createTitle'
import {k} from '../kaboom'
import {WHITE, YELLOW} from '../types'
import {getMusVol} from '../util'
import {GAMETYPES} from '../../../shared/types'

function menuAction(func: Function) {
    return {
        menuAction: func
    }
}

export default function (menuIndex=0) {
    const {
        add, color, go, keyPress, origin, play, pos, sprite, text, width, height
    } = k
    let music = play('menu-1', {loop: true, volume: getMusVol()})
    createTitle()
    const menu = [
        add([
            text("Start a Campaign", 14),
            color(WHITE),
            origin('center'),
            pos(width()*0.5, height()*0.55 ),
            menuAction(()=>go('gameSetup', GAMETYPES.CAMPAIGN)),
        ]),
        add([
            text("Play Battle Round", 14),
            color(WHITE),
            origin('center'),
            pos(width()*0.5, height()*0.65 ),
            menuAction(()=>go('gameSetup', GAMETYPES.BATTLE)),
        ]),
        add([
            text("Join an Online Game", 14),
            color(WHITE),
            origin('center'),
            pos(width()*0.5, height()*0.75 ),
            menuAction(()=>go('joinStart')),
        ]),
        add([
            text("Preferences", 14),
            color(WHITE),
            origin('center'),
            pos(width()*0.5, height()*0.85 ),
            menuAction(()=>go('pref')),
        ]),
    ]
    const mushrooms = [
        add([sprite('title-mushroom'), pos(width()*.5-170,height()*.55), origin('center')]),
        add([sprite('title-mushroom'), pos(width()*.5+170,height()*.55), origin('center')]),
    ]
    // Keypresses
    const changeMenuIndex = (index:number) => {
        const {y} = menu[index].pos
        menu[menuIndex].color = WHITE
        menu[index].color = YELLOW
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
        if( !menu[menuIndex].menuAction ) return
        menu[menuIndex].menuAction()
        music.stop()
    }
    keyPress('space', mainAction)
    keyPress('enter', mainAction)
    // Init
    changeMenuIndex(menuIndex)
}