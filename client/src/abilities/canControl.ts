import { k } from '../kaboom'
import { DIRS } from '../types'

export type GamepadControlDefs = {
    id: string;
    left: number;
    right: number;
    up: number;
    down: number;
    primary: number;
    secondary: number;
}

export type KeyboardControlDefs = {
    left: string;
    right: string;
    up: string;
    down: string;
    primary: string;
    secondary: string;
}

export const keyboardDefaults: KeyboardControlDefs[] = [{
    left: 'left',
    right: 'right',
    up: 'up',
    down: 'down',
    primary: 'shift',
    secondary: '1',
}, {
    left: 'a',
    right: 'd',
    up: 'w',
    down: 's',
    primary: 'space',
    secondary: '2',
}, {
    left: 'f',
    right: 'h',
    up: 't',
    down: 'g',
    primary: 'b',
    secondary: '3',
}, {
    left: 'j',
    right: 'l',
    up: 'i',
    down: 'k',
    primary: ',',
    secondary: '4',
}]

const {
    keyDown,
    keyPress,
    keyRelease,
} = k

export default function(
    defs: KeyboardControlDefs,
    gamepad?: Gamepad
) {
    return {
        add() {
            keyPress(defs.primary, ()=>this.spawnBomb())
            keyPress(defs.secondary, ()=>console.log(this))
            Object.entries(DIRS).forEach(([key, vec])=>{
                const dir = key.toLowerCase()
                if( key==='IDLE' ) return
                keyDown(defs[dir], ()=>this.walk(vec))
                keyRelease(defs[dir], ()=>this.stop())
            })        
        },
    }
}
