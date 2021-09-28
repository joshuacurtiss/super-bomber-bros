import createTitle from './createTitle'
import {k} from '../kaboom'
import {WHITE, YELLOW} from '../types'
import {getMusVol} from '../util'

export default function (menuIndex=0) {
    const {
        add, go, keyPress, origin, play, pos, sprite, text, width, height
    } = k
    let music = play('menu-1', {loop: true, volume: getMusVol()})
    createTitle()
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
        if( menuIndex===0 ) go('playerSelection', 'startCampaign')
        if( menuIndex===1 ) go('playerSelection', 'startBattle')
        if( menuIndex===2 ) go('pref')
    }
    keyPress('space', mainAction)
    keyPress('enter', mainAction)
    // Init
    changeMenuIndex(menuIndex)
}