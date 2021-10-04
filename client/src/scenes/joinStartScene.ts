import {k, network} from '../kaboom'
import {DARKGRAY, WHITE, YELLOW} from '../types'
import {getMusVol} from '../util'
import select from '../features/select'
import textbox from '../features/textbox'
import {GameRoom} from '../../../server/src/GameRoom'
import {Room} from 'colyseus.js'

function menuAction(func: Function) {
    return {
        menuAction: func
    }
}

export default function () {
    const {
        add, color, destroy, go, keyPress, origin, play, pos, rect, rand, sprite, text, width, height
    } = k
    // Data 
    let allRooms = []
    // Functions
    const changeMenuIndex = (index:number) => {
        if( playerName?.isFocused() || rooms?.isFocused() ) return
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
    const update_full_list = () => {
        rooms?.setData(allRooms.map(r=>{
            return {
                value: r.roomId,
                label: `${r.metadata.roomName} (${r.clients})`
            }
        }))
    }
    const lobbyActions = (lobby: Room) => {
        lobby.onMessage("rooms", (rooms: GameRoom[]) => {
            console.log(`Received information on ${rooms.length} rooms.`)
            allRooms = rooms.filter(room=>!room.metadata.locked);
            console.log(rooms)
            update_full_list();
        });
        lobby.onMessage("+", ([roomId, room]) => {
            const roomIndex = allRooms.findIndex((room) => room.roomId === roomId);
            if (roomIndex >= 0) {
                console.log(`Room ${roomId} was updated.`)
                allRooms[roomIndex] = room;
            } else {
                console.log(`Room ${roomId} is added.`)
                allRooms.push(room);
            }
            allRooms = allRooms.filter(room=>!room.metadata.locked)
            update_full_list();
        });
        lobby.onMessage("-", (roomId) => {
            console.log(`Room ${roomId} is gone.`)
            allRooms = allRooms.filter((room) => room.roomId !== roomId);
            update_full_list();
        });
        lobby.onLeave(async () => {
            allRooms = [];
            update_full_list();
            if( ! await network.lobby(lobbyActions) && network.enabled ) go('disconnected')
        });
    }
    // Music
    let music = play('menu-3', {loop: true, volume: getMusVol()})
    // Title
    add([
        text("Join an Online Game", 18),
        color(WHITE),
        origin('center'),
        pos(width()/2, height()*0.15)
    ])
    add([
        text("Games:", 14),
        color(WHITE),
        origin('left'),
        pos(width()/2-175, height()*0.35)
    ])
    // Menu
    let menuIndex = 0
    const menuPlayerName = add([
        text("Name:", 14),
        origin('left'),
        pos(width()/2-175, height()*0.25),
        menuAction(()=>{
            if( playerName.isFocused() ) {
                playerName.blur()
                localStorage["playerName"] = playerName.getText()
            } else {
                playerName.focus()
            }
        }),
    ])
    const menuContinue = add([
        text("Join Game!", 14),
        color(WHITE),
        origin('center'),
        pos(width()/2, height()*0.8),
        menuAction(()=>{
            const selected = rooms.getSelected()
            if( selected.length===0 ) return
            network.leave()
            const roomId = selected[0].value
            music.stop()
            destroy(rooms)
            rooms = null
            go('joinWait', roomId, playerName.getText())
        }),
    ])
    const menuBack = add([
        text("Back to Main Menu", 14),
        color(WHITE),
        origin('center'),
        pos(width()/2, height()*0.9),
        menuAction(()=>{
            music.stop()
            destroy(rooms)
            rooms = null
            network.leave()
            network.enabled = false
            go('mainMenu')
        }),
    ])
    const mushrooms = [
        add([sprite('title-mushroom'), pos(width()/2-200, height()*.3), origin('center')]),
        add([sprite('title-mushroom'), pos(width()/2+200, height()*.3), origin('center')]),
    ]
    // Data
    const playerName = add([
        rect(270, 24, {noArea: false}),
        pos(menuPlayerName.pos.x + 80, menuPlayerName.pos.y - 11),
        textbox(localStorage["playerName"] || "Player #" + Math.floor(rand(10000,99999)).toString(), 12, {
            maxChars: 22,
        }),
    ])
    let rooms = add([
        rect(350, height()*0.315),
        pos(width()/2-175, height()*0.38),
        color(DARKGRAY),
        menuAction(()=>rooms.isFocused() ? rooms.blur() : rooms.focus()),
        select([], {
            maxRows: 8,
            multiple: false,
            emptyMessage: 'Waiting for games...',
            checkboxSprite: 'checkbox', 
            checkboxCheckedSprite: 'checkbox-checked',
            blurOnSelect: true,
        }),
    ])
    const menu = [ menuPlayerName, rooms, menuContinue, menuBack ]
    // Keypresses
    keyPress('up', ()=>changeMenuIndex(menuIndex-1))
    keyPress('down', ()=>changeMenuIndex(menuIndex+1))
    keyPress('enter', mainAction)
    // Init
    changeMenuIndex(menuIndex)
    network.enabled=true
    network.connect()
    network.lobby(lobbyActions).then(res=>res ? 1 : network.enabled ? go('disconnected') : 0)
}