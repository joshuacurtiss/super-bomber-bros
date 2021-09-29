import {k} from '../kaboom'
import {LIGHTGRAY, DARKGRAY, RED, WHITE, YELLOW} from '../types'
import {getMusVol} from '../util'
import playerRect from '../features/playerRect'
import textbox from '../features/textbox'

export default function (playerCount = 1, nextScene = 'startCampaign') {
    const {
        add, charInput, color, destroy, go, keyPress, origin, play, pos, rect, rand, text, width, height
    } = k
    let menuIndex = 0
    const addPlayerRect = () => add([
        rect(64, 64, {noArea: true}),
        pos(width()*0.5, height()*0.20),
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
        text('', 11),
        color(RED),
        origin('center'),
        pos(width()*0.5, height()*0.85),
    ])
    let music = play('menu-3', {loop: true, volume: getMusVol()})
    const players = [ addPlayerRect() ]
    const changePlayerCount = (cnt: number = 1) => {
        if( cnt < 1 ) cnt = 4
        if( cnt > 4 ) cnt = 1
        while( players.length > cnt ) destroy(players.pop())
        while( players.length < cnt ) players.push(addPlayerRect())
        const deltaX = width() / (cnt+1)
        players.forEach((r, idx)=>r.reposition(deltaX*(idx+1), r.pos.y))
        menu[0].text = `Number of Players: ${players.length}`

    }
    const actions = [
        key => {}, 
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
            go(nextScene, players.length)
        },
        key => {
            music.stop()
            go('mainMenu')
        }
    ]
    const menu = [
        add([
            text("Number of Players", 14),
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
    keyPress('left', ()=>{
        if( menuIndex===0 ) changePlayerCount(players.length-1)
    })
    keyPress('right', ()=>{
        if( menuIndex===0 ) changePlayerCount(players.length+1)
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
    changePlayerCount()
}