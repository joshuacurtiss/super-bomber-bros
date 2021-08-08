import { GameObj } from 'kaboom'
import { k, debug } from '../kaboom'
import { POWERUPS } from '../types'

const {time} = k

const WARN_TIME = 60

function formatTime(secs: number): string {
    const part = Math.floor(secs % 1 * 10)
    const sec = Math.floor(secs) % 60
    const min = Math.floor(secs/60)
    return `${min}:${sec<10 ? '0' : ''}${sec}.${part}`
}

function timer(maxTime: number) {
    let handleEnd=false
    let handleInit=false
    let handleWarn=false
    let start=0
    let last=''
    const writeTime=(secs: number, lbl: GameObj) => {
        const str = formatTime(secs)
        if( last!== str ) {
            lbl.text = str
            last = str
        }
    }
    return {
        start() {
            if( !start ) {
                start=time()
            }
        },
        powerup(index: number) {
            if( index===POWERUPS.TIME ) {
                maxTime+=30
                debug('Sweet, you just increased game time by 30 sec!')
            }
        },
        update() {
            if( start ) {
                let t = start + maxTime - time()
                if( t<0 ) t=0
                writeTime(t, this)
                if( t<=WARN_TIME && !handleWarn ) {
                    handleWarn=true
                    this.trigger("timer_warning")
                } else if( t===0 && !handleEnd ) {
                    handleEnd=true
                    this.trigger("timer_end")
                }
            } else if( !handleInit ) {
                handleInit=true
                writeTime(maxTime, this)
            }
        }
    }
}

export default timer