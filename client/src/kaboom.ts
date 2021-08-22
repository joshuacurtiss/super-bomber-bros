import kaboom from 'kaboom'
import Network from './model/Network'

const debugMode = location.search.toLowerCase().indexOf("debug")>0

export const k = kaboom({
    clearColor: [0, 0, 0, 1],
    fullscreen: true,
    width: 320,
    height: 240,
    scale: 1.5,
    debug: debugMode,
    connect: location.protocol.replace('http', 'ws') +  "/" + "/" + location.host,
})

if( debugMode ) {
    k.debug.inspect = true
}

export function debug(msg: string) {
    if( debugMode ) k.debug.log(msg)
}

export const network = new Network(k)

export default k
