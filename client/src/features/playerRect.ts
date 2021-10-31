import { GameObj } from 'kaboom'
import { k } from '../kaboom'
import { DARKGRAY, LIGHTGRAY, GREEN } from '../types'

const {
    add,
    color,
    destroy,
    origin,
    pos,
    sprite,
    text,
    vec2,
} = k

export enum ControllerType {
    Keyboard,
    Gamepad,
    Online,
}

type ControllerId = number | string

export default function() {
    let character = ''
    let controllerType: ControllerType
    let controllerId: number | string
    let done = false
    let focused = false
    let playerSprite: GameObj
    let playerText: GameObj
    return {
        blur() {
            focused = false
            this.updateUI()
        },
        focus() {
            focused = true
            this.updateUI()
        },
        toggleDone() {
            done = !done
            this.updateUI()
        },
        getDone() {
            return done
        },
        getCharacter() {
            return character
        },
        setCharacter(name: string) {
            character = name
            playerSprite.use(sprite(name))
        },
        clearController() {
            controllerType = null
            controllerId = null
            this.updateUI()
        },
        setController(t: ControllerType, id: ControllerId) {
            controllerType=t
            controllerId=id
            this.updateUI()
        },
        reposition(x: number, y: number) {
            this.pos = vec2(x, y)
            this.updateUI()
        },
        updateUI() {
            this.color = done ? GREEN : focused ? LIGHTGRAY : DARKGRAY
            playerSprite.pos = this.pos
            playerText.pos = vec2(this.pos.add(0, this.height/2+16))
            if( controllerType===ControllerType.Keyboard && typeof controllerId==="number" ) {
                playerText.text = "Kybd #" + (controllerId+1).toString()
            } else if( controllerType===ControllerType.Gamepad && typeof controllerId==="number" ) {
                playerText.text = "Gamepad #" + (controllerId+1).toString()
            } else if( controllerType===ControllerType.Online ) {
                playerText.text = controllerId
            } else {
                playerText.text = "Unselected"
            }
        },
        add() {
            this.use(color(DARKGRAY))
            playerText = add([
                text('', 9),
                origin('center'),
                pos(this.pos),
                color(DARKGRAY),
            ])
            playerSprite = add([
                pos(this.pos),
                origin('center'),
            ])
            this.updateUI()
        },
        destroy() {
            destroy(playerSprite)
            destroy(playerText)
        }
    }
}