import kaboom from 'kaboom'

const debugMode = location.search.toLowerCase().indexOf("debug")>0

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

export default k
