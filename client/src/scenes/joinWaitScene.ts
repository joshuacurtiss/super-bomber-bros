import {k, network} from '../kaboom'
import {WHITE, YELLOW} from '../types'
import {getMusVol} from '../util'
import {Room} from 'colyseus.js'
import { CMDS } from '../model/Network'

function menuAction(func: Function) {
    return {
        menuAction: func
    }
}

export default async function (roomId: string, playerName: string) {
    const {
        add, color, destroy, go, keyPress, origin, play, pos, rect, rand, sprite, text, width, height
    } = k
    // Functions
    const changeMenuIndex = (index:number) => {
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
    const backToLobby = () => {
        console.log("Back to lobby.")
        music.stop()
        network.send(CMDS.ROOM_EXIT)
        network.leave()
        network.enabled = false
        go('joinStart')
    }
    const mainAction = () => menu[menuIndex].menuAction ? menu[menuIndex].menuAction() : 0
    const roomActions = (room: Room) => {
        room.onLeave(backToLobby)
        room.onMessage(CMDS.SCENE, ({scene, args}) => go(scene, ...args));
        room.onMessage(CMDS.ROOM_BUNT, backToLobby);
        room.onMessage('*', (type, message)=>{
            console.log(`Generic Message: ${type} - ${message}`)
        })
    }
    // Music
    let music = play('menu-3', {loop: true, volume: getMusVol()})
    // Title
    add([
        text("Waiting to Start...", 18),
        color(WHITE),
        origin('center'),
        pos(width()/2, height()*0.35)
    ])
    // Menu
    let menuIndex = 0
    const menuBack = add([
        text("Go Back", 14),
        color(WHITE),
        origin('center'),
        pos(width()/2, height()*0.66),
        menuAction(backToLobby),
    ])
    const mushrooms = [
        add([sprite('title-mushroom'), pos(width()/2-150, height()*.66), origin('center')]),
        add([sprite('title-mushroom'), pos(width()/2+150, height()*.66), origin('center')]),
    ]
    const menu = [ menuBack ]
    // Keypresses
    keyPress('up', ()=>changeMenuIndex(menuIndex-1))
    keyPress('down', ()=>changeMenuIndex(menuIndex+1))
    keyPress('enter', mainAction)
    // Init
    changeMenuIndex(menuIndex)
    network.join(roomId, playerName, roomActions)
}