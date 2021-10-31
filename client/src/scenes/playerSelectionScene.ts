import {k} from '../kaboom'
import {DARKGRAY, RED, WHITE, YELLOW} from '../types'
import {getMusVol} from '../util'
import autoHideText from '../features/autoHideText'
import playerRect from '../features/playerRect'

function menuAction(func: Function) {
    return {
        menuAction: func
    }
}

export default function (playerCount=1) {
    const {
        add, color, keyPress, origin, play, pos, rect, text, width, height
    } = k
    const deltaX = width() / (playerCount+1)
    let menuIndex = 0
    const addPlayerRect = (x: number, y: number) => add([
        rect(64, 64, {noArea: true}),
        pos(x, y),
        origin('center'),
        color(DARKGRAY),
        playerRect()
    ])
    // Title
    add([
        text("Player Selection", 18),
        color(WHITE),
        origin('center'),
        pos(width()*0.5, height()*0.06)
    ])
    const err = add([
        text('', 9),
        color(RED),
        origin('center'),
        pos(width()*0.5, height()*0.85),
        autoHideText(3),
    ])
    let music = play('menu-3', {loop: true, volume: getMusVol()})
    const players = Array(playerCount).fill(null).map((_, idx)=>addPlayerRect(deltaX*(idx+1), height()*.20));
    console.log(players)
    const menu = [
        add([
            text("Start game!", 14),
            color(WHITE),
            pos(width()*0.1, height()*0.55),
        ]),
        add([
            text("Back to Main Menu", 14),
            color(WHITE),
            pos(width()*0.1, height()*0.625),
        ]),
    ]
    // Keypresses
    const changeMenuIndex = (index:number) => {
        index = index < 0 ? 0 : index>menu.length-1 ? menu.length-1 : index
        menu[menuIndex].color = WHITE
        menu[index].color = YELLOW
        menuIndex = index
    }
    const mainAction = () => menu[menuIndex].menuAction ? menu[menuIndex].menuAction() : 0
    keyPress('up', ()=>changeMenuIndex(menuIndex-1))
    keyPress('down', ()=>changeMenuIndex(menuIndex+1))
    keyPress('space', mainAction)
    keyPress('enter', mainAction)
    // Init
    changeMenuIndex(menuIndex)
}