import {k} from '../kaboom'
import {DARKGRAY, WHITE, YELLOW} from '../types'
import {getMusVol} from '../util'
import select from '../features/select'
import textbox from '../features/textbox'

function menuAction(func) {
    return {
        menuAction: func
    }
}

export default function (goalScene = 'startCampaign') {
    const {
        add, charInput, color, destroy, go, keyPress, origin, play, pos, rect, rand, sprite, text, width, height
    } = k
    // Data
    let playerCount = 0
    let roomName
    let roomPlayers
    // Functions
    const changeMenuIndex = (index:number) => {
        if( roomName?.isFocused() || roomPlayers?.isFocused() ) return
        if( index<0 ) index=0
        if( index>menu.length-1 ) index=menu.length-1
        const newItem = menu[index]
        const prevItem = menu[menuIndex]
        const {y} = newItem.pos.add(newItem.area.p2.add(newItem.area.p1).scale(0.5))
        if( prevItem.text ) prevItem.color = WHITE
        if( newItem.text ) newItem.color = YELLOW
        mushrooms.forEach(m=>m.pos.y=y)
        menuIndex = index
    }
    const mainAction = () => menu[menuIndex].menuAction ? menu[menuIndex].menuAction() : 0
    const changePlayerCount = (cnt: number = playerCount+1) => {
        if( cnt < 1 ) cnt = 4
        if( cnt > 4 ) cnt = 1
        playerCount = cnt
        menu[0].text = `Number of Players: ${playerCount}`
    }
    const menuOnlineAction = () => {
        if( roomName ) {
            destroy(roomName)
            destroy(roomPlayers)
            destroy(menuRoomName)
            roomName = null
            roomPlayers = null
            menuOnline.text = "Online: Disabled"
            menuBack.pos.y = height() * 0.525
            menu.splice(3, 2)
        } else {
            menuRoomName = add([
                text("Room:", 14),
                origin('left'),
                pos(width()/2-175, height()*0.6 - 30),
                menuAction(()=>roomName.isFocused() ? roomName.blur() : roomName.focus()),
            ])
            roomName = add([
                rect(270, 24, {noArea: false}),
                pos(menuRoomName.pos.x + 80, menuRoomName.pos.y - 11),
                textbox("My great room #" + Math.floor(rand(10000,99999)).toString(), 12, {
                    maxChars: 22,
                }),
            ])
            roomPlayers = add([
                rect(350, height()-height()*0.6-65),
                pos(width()/2-175, height()-height()*0.6+95),
                color(DARKGRAY),
                menuAction(()=>roomPlayers.isFocused() ? roomPlayers.blur() : roomPlayers.focus()),
                select([], {
                    maxRows: 6,
                    emptyMessage: 'Waiting for players...',
                    checkboxSprite: 'checkbox', 
                    checkboxCheckedSprite: 'checkbox-checked',
                }),
            ])
            menuOnline.text = "Online: Enabled"
            menuBack.pos.y = height() - 40
            menu.pop()
            menu.push(menuRoomName, roomPlayers, menuBack)
        }
    }
    const menuContinueAction = () => {
        music.stop()
        go(goalScene, playerCount)
    }
    const menuBackAction = () => {
        music.stop()
        go('mainMenu')
    }
    // Music
    let music = play('menu-3', {loop: true, volume: getMusVol()})
    // Title
    add([
        text("Game Setup", 18),
        color(WHITE),
        origin('center'),
        pos(width()/2, height()*0.15)
    ])
    // Menu
    let menuIndex = 0
    let menuRoomName
    const menuNumPlayers = add([
        text("Number of Players", 14),
        color(WHITE),
        origin('center'),
        pos(width()/2, height()*0.3),
        menuAction(changePlayerCount),
    ])
    const menuOnline = add([
        text("Online: Off", 14),
        color(WHITE),
        origin('center'),
        pos(width()/2, height()*0.375),
        menuAction(menuOnlineAction),
    ])
    const menuContinue = add([
        text("Continue!", 14),
        color(WHITE),
        origin('center'),
        pos(width()/2, height()*0.45),
        menuAction(menuContinueAction),
    ])
    const menuBack = add([
        text("Back to Main Menu", 14),
        color(WHITE),
        origin('center'),
        pos(width()/2, height()*0.525),
        menuAction(menuBackAction),
    ])
    const menu = [ menuNumPlayers, menuOnline, menuContinue, menuBack ]
    const mushrooms = [
        add([sprite('title-mushroom'), pos(width()/2-200, height()*.3), origin('center')]),
        add([sprite('title-mushroom'), pos(width()/2+200, height()*.3), origin('center')]),
    ]
    // Keypresses
    keyPress('up', ()=>changeMenuIndex(menuIndex-1))
    keyPress('down', ()=>changeMenuIndex(menuIndex+1))
    keyPress('enter', mainAction)
    // Init
    changeMenuIndex(menuIndex)
    changePlayerCount()
}