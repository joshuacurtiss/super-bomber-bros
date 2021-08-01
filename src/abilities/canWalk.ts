import k from '../kaboom'

const {
    vec2
} = k

function canWalk(speed: number = 120) {
    let walking=false
    let dir=vec2(0,1)
    return {
        isIdle: ()=>!walking,
        isWalking: ()=>walking,
        getDir: ()=>dir,
        stop() {
            walking=false
        },
        walk(x: number, y: number) {
            walking=true
            dir=vec2(x, y)
            this.move(dir.scale(speed))
        },
    }
}

export default canWalk