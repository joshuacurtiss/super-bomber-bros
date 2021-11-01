import {getMusVol} from '../util'
import {k, network} from '../kaboom'
import {CMDS} from '../model/Network'
import {ISelectRow} from '../features/select'
import {DARKGRAY, RED, WHITE, YELLOW} from '../types'
import {GAMETYPES} from '../../../shared/types'
import {Room} from 'colyseus.js'
import autoHideText from '../features/autoHideText'
import select from '../features/select'
import textbox from '../features/textbox'

function menuAction(func: Function) {
    return {
        menuAction: func
    }
}

export default function (gameType = GAMETYPES.CAMPAIGN) {
    const {
        add, color, destroy, go, keyPress, origin, play, pos, rect, rand, sprite, text, width, height
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
        if( cnt > 4 ) cnt = roomName ? 2 : 1
        playerCount = cnt
        menu[0].text = `Number of Players: ${playerCount}`
    }
    const roomActions = (room: Room) => {
        room.onMessage(CMDS.ROOM_ENTER, ([sessionId, message])=>{
            console.log("Player enter:", sessionId, message)
            const data = roomPlayers.getData()
            data.push({label: message.name, value: sessionId})
            roomPlayers.setData(data)
        })
        room.onMessage(CMDS.ROOM_EXIT, ([sessionId, message])=>{
            console.log("Player exit:", sessionId, message)
            const data = roomPlayers.getData() as ISelectRow[]
            const idx = data.findIndex(item=>item.value===sessionId)
            if( idx<0 ) return
            data.splice(idx, 1)
            roomPlayers.setData(data)
        })
        room.onMessage('*', (type, message)=>{
            console.log(`Generic Message: ${type} - ${message}`)
        })
        room.onLeave(async () => {
            if( ! await network.reconnect(roomActions) && network.enabled ) {
                changeMenuIndex(1)
                menuOnlineAction()
                err.setText('Disconnected from game server!')
            }
        })
    }
    const menuOnlineAction = async () => {
        if( roomName ) {
            network.leave()
            network.enabled=false
            destroy(roomName)
            destroy(roomPlayers)
            destroy(menuRoomName)
            roomName = null
            roomPlayers = null
            menuOnline.text = "Online: Disabled"
            menuBack.pos.y = height() * 0.525
            menu.splice(3, 2)
        } else {
            if( playerCount===1 ) changePlayerCount(2)
            menuRoomName = add([
                text("Room:", 14),
                origin('left'),
                pos(width()/2-175, height()*0.6 - 30),
                menuAction(()=>{
                    if( roomName.isFocused() ) {
                        roomName.blur()
                        network.send(CMDS.ROOM_STATE_UPDATE, {roomName: roomName.getText()})
                    } else {
                        roomName.focus()
                    }
                }),
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
            network.enabled = true
            network.connect()
            if( ! await network.create(roomName.getText(), roomActions) && network.enabled ) {
                changeMenuIndex(1)
                menuOnlineAction()
                err.setText('Could not connect to game server.')
            }
            network.send(CMDS.ROOM_STATE_UPDATE, {
                type: gameType,
                locked: false
            })
        }
    }
    const menuContinueAction = () => {
        const nextScene = 'playerSelection'
        if( network.enabled ) {
            // Validation checks:
            if( roomPlayers.getSelected().length===0) {
                err.setText('Select at least one online player.')
                return
            }
            if( roomPlayers.getSelected().length>=playerCount ) {
                err.setText('You selected too many online players.')
                return
            }
            // Ok to proceed. Update room state.
            network.send(CMDS.ROOM_STATE_UPDATE, {
                playerCount,
                type: gameType,
                roomName: roomName.getText(),
                locked: true
            });
            // Bunt the players that weren't selected, push forward the players that were selected
            (roomPlayers.getData() as ISelectRow[]).forEach(row=>{
                if( row.selected ) network.sendToClient(CMDS.SCENE, row.value, {scene: nextScene, args: [gameType, playerCount]})
                else network.sendToClient(CMDS.ROOM_BUNT, row.value)
            })
            network.removeAllListeners()
        }
        music.stop()
        go(nextScene, gameType, playerCount)
    }
    const menuBackAction = () => {
        network.leave()
        network.enabled=false
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
    const err = add([
        text("", 9),
        color(RED),
        origin('center'),
        pos(width()/2, height()*0.225),
        autoHideText(3),
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