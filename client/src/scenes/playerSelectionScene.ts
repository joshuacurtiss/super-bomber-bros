import {k} from '../kaboom'
import {LIGHTGRAY, DARKGRAY, RED, WHITE, YELLOW} from '../types'
import {getMusVol} from '../util'
import textbox from '../features/textbox'

export default function (nextScene = 'startCampaign') {
    const {
        add, charInput, color, destroy, go, keyPress, origin, play, pos, rect, rand, text, width, height
    } = k
    let menuIndex = 0
    let playerCount = 1
    const playersMenuItemLabel = () => `Number of Players: ${playerCount}`
    const addPlayerRect = () => add([
        rect(64, 64, {noArea: true}),
        pos(width()*0.5, height()*0.20),
        origin('center'),
        color(DARKGRAY),
    ])
    const addPlayerTitle = () => add([
        text('', 9),
        pos(width()*0.5, height()*0.2+48),
        origin('center'),
        color(LIGHTGRAY),
    ])
    // Title
    add([
        text("Player Selection", 18),
        color(WHITE),
        origin('center'),
        pos(width()*0.5, height()*0.06)
    ])
    const err = add([
        text('', 11),
        color(RED),
        origin('center'),
        pos(width()*0.5, height()*0.85),
    ])
    let music = play('menu-3', {loop: true, volume: getMusVol()})
    const playerRects = [ addPlayerRect() ]
    const playerTitles = [ addPlayerTitle() ]
    const actions = [
        key => {
            if( ++playerCount > 4 ) playerCount=1
            while( playerRects.length > playerCount ) destroy(playerRects.pop())
            while( playerRects.length < playerCount ) playerRects.push(addPlayerRect())
            while( playerTitles.length > playerCount ) destroy(playerTitles.pop())
            while( playerTitles.length < playerCount ) playerTitles.push(addPlayerTitle())
            const deltaX = width() / (playerCount+1)
            playerRects.forEach((r, idx)=>r.pos.x = deltaX*(idx+1))
            playerTitles.forEach((t, idx)=>t.pos.x = deltaX*(idx+1))
            menu[0].text = playersMenuItemLabel()
        }, 
        key => {
            if( roomName && key==='space' ) return
            if( roomName ) {
                destroy(roomName)
                roomName = null
                menu[1].text = "Online: Off"
                err.text = ''
            } else {
                menu[1].text = "Online room:"
                err.text = 'Sorry, online mode isn\'t available yet!'
                roomName = createRoomNameField()
                roomName.focus()
            }
        },
        key => {
            music.stop()
            go(nextScene, playerCount)
        },
        key => {
            music.stop()
            go('mainMenu')
        }
    ]
    const menu = [
        add([
            text(playersMenuItemLabel(), 14),
            color(WHITE),
            pos(width()*0.1, height()*0.4),
        ]),
        add([
            text("Online: Off", 14),
            color(WHITE),
            pos(width()*0.1, height()*0.475),
        ]),
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
    const createRoomNameField = () => add([
        rect(250, 24, {noArea: false}),
        pos(width()*0.1 + menu[1].width + 20, menu[1].pos.y - 6),
        textbox("My great room " + Math.floor(rand(10000,99999)).toString(), 12, {
            maxChars: 20,
        }),
    ])
    let roomName
    // Keypresses
    const changeMenuIndex = (index:number) => {
        if( menuIndex===1 ) roomName?.blur()
        if( index===1 ) roomName?.focus()
        menu[menuIndex].color = WHITE
        menu[index].color = YELLOW
        menuIndex = index
    }
    keyPress('up', ()=>{
        changeMenuIndex(menuIndex===0 ? 0 : menuIndex-1)
    })
    keyPress('down', ()=>{
        changeMenuIndex(menuIndex===menu.length-1 ? menu.length-1 : menuIndex+1)
    })
    const mainAction = (key) => {
        actions[menuIndex](key)
    }

    keyPress('space', () => mainAction('space'))
    keyPress('enter', () => mainAction('enter'))
    keyPress('backspace', ()=>{
        if( menuIndex!==1 ) return
        roomName?.keyPress('backspace')
    })
    charInput(ch=>{
        roomName?.keyPress(ch)
    })
    // Init
    changeMenuIndex(menuIndex)
}