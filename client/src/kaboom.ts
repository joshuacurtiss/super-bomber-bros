import kaboom from 'kaboom'
import Network from './model/Network'

const params = new URLSearchParams(location.search)
const mp = params.get('mp')==='true' ? true : false
const debugMode = params.has('debug')

export const k = kaboom({
    clearColor: [0, 0, 0, 1],
    fullscreen: true,
    width: 320,
    height: 240,
    scale: 1.5,
    debug: debugMode,
    connect: mp ? location.protocol.replace('http', 'ws') +  "/" + "/" + location.host : null,
})

if( debugMode ) {
    k.debug.inspect = true
}

export function debug(msg: string) {
    if( debugMode ) k.debug.log(msg)
}

export const network = new Network(k)

export default k
