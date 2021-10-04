import { Room } from 'colyseus.js'
import { k, network } from '../kaboom'
import { CMDS } from '../model/Network'
import {WHITE} from '../types'
import {getMusVol} from '../util'

export default function (playerCount: number=1, level: number=1) {
    const {
        add, color, go, keyPress, origin, pos, play, text, width, height
    } = k
    const music = play('menu-4', {loop: true, volume: getMusVol()})
    add([
        text(`Level ${level}`, 18),
        color(WHITE),
        origin('center'),
        pos(width()*0.5, height()*0.3)
    ])
    add([
        text("Get Ready!", 12),
        color(WHITE),
        origin('center'),
        pos(width()*0.5, height()*0.4 )
    ])
    const mainAction = () => {
        music.stop()
        network.removeAllListeners()
        network.send(CMDS.SCENE, 'game')
        go('game')
    }
    const roomActions = (room: Room) => {
        room.onLeave(async ()=>{
            if( !await network.reconnect(roomActions) && network.enabled ) {
                music.stop()
                network.removeAllListeners()
                go('disconnected')
            }
        })
        room.onMessage(CMDS.SCENE, ([_, scene]) => {
            music.stop()
            network.removeAllListeners()
            go(scene)
        })
    }
    if( network.enabled===false || network.owner ) {
        add([
            text("Press spacebar to begin", 9),
            color(WHITE),
            origin('center'),
            pos(width()*0.5, height()*0.6)
        ])
        keyPress('space', mainAction)
        keyPress('enter', mainAction)
    }
    if( network.enabled ) {
        roomActions(network.room)
    }
}