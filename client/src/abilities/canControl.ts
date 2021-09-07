import { k } from '../kaboom'
import { DIRS } from '../types'

enum ControlActions {
    left = 'left',
    right = 'right',
    up = 'up',
    down = 'down',
    primary = 'primary',
    secondary = 'secondary',
}

type IGamepadControlDefs = {
    id: string;
    left: number;
    right: number;
    up: number;
    down: number;
    primary: number;
    secondary: number;
}
export class GamepadControlDefs {
    id: string;
    left: number;
    right: number;
    up: number;
    down: number;
    primary: number;
    secondary: number;
    constructor(defs: IGamepadControlDefs) {
        Object.assign(this, defs)
    }
}

type IKeyboardControlDefs = {
    left: string;
    right: string;
    up: string;
    down: string;
    primary: string;
    secondary: string;
}

export class KeyboardControlDefs {
    left: string;
    right: string;
    up: string;
    down: string;
    primary: string;
    secondary: string;
    constructor(defs:IKeyboardControlDefs) {
        Object.assign(this, defs)
    }
    on(action: ControlActions, callback: ()=>void, releaseCallback?: ()=>void) {
        const handler = action===ControlActions.primary || action===ControlActions.secondary ? keyPress : keyDown
        handler(this[action], callback)
        if( releaseCallback ) keyRelease(this[action], releaseCallback)
    }
}

export const keyboardDefaults: KeyboardControlDefs[] = [
    new KeyboardControlDefs({
        left: 'left',
        right: 'right',
        up: 'up',
        down: 'down',
        primary: 'shift',
        secondary: '1',
    }), 
    new KeyboardControlDefs({
        left: 'a',
        right: 'd',
        up: 'w',
        down: 's',
        primary: 'space',
        secondary: '2',
    }), 
    new KeyboardControlDefs({
        left: 'f',
        right: 'h',
        up: 't',
        down: 'g',
        primary: 'b',
        secondary: '3',
    }), 
    new KeyboardControlDefs({
        left: 'j',
        right: 'l',
        up: 'i',
        down: 'k',
        primary: ',',
        secondary: '4',
    })
]

export const gamepadDefaults: GamepadControlDefs[] = [
    new GamepadControlDefs({
        id: 'Logitech Dual Action (STANDARD GAMEPAD Vendor: 046d Product: c216)',
        left: 1,
        right: 2,
        up: 3,
        down: 4,
        primary: 5,
        secondary: 6,
    })
]

const {
    keyDown,
    keyPress,
    keyRelease,
} = k

export default function(
    defs: GamepadControlDefs | KeyboardControlDefs,
    gamepad?: Gamepad
) {
    return {
        add() {
            if( defs instanceof GamepadControlDefs ) {
                console.log("Add gamepad")
            } else if( defs instanceof KeyboardControlDefs ) {
                defs.on(ControlActions.primary, ()=>this.spawnBomb())
                defs.on(ControlActions.secondary, ()=>console.log(this))
                defs.on(ControlActions.up, ()=>this.walk(DIRS.UP))
                defs.on(ControlActions.down, ()=>this.walk(DIRS.DOWN))
                defs.on(ControlActions.left, ()=>this.walk(DIRS.LEFT))
                defs.on(ControlActions.right, ()=>this.walk(DIRS.RIGHT))
            } else {
                console.log("Unknown def type.")
            }
        },
    }
}
