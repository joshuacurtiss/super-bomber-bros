import kaboom from 'kaboom'
import Network from './model/Network'
import { v4 as uuidv4 } from 'uuid'

const params = new URLSearchParams(location.search)
const debugMode = params.has('debug')

export const id = uuidv4()

export const k = kaboom({
    clearColor: [0, 0, 0, 1],
    fullscreen: true,
    width: 320,
    height: 240,
    scale: 1.5,
    debug: debugMode,
})

if( debugMode ) {
    k.debug.inspect = true
}

export function debug(msg: string) {
    if( debugMode ) k.debug.log(msg)
}

export const network = new Network(id)

export default k
