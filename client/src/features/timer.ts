import { k, debug } from '../kaboom'
import { POWERUPS } from '../types'

const HURRY_TIME = 60

function formatTime(secs: number): string {
    const part = Math.floor(secs % 1 * 10)
    const sec = Math.floor(secs) % 60
    const min = Math.floor(secs/60)
    return `${min}:${sec<10 ? '0' : ''}${sec}.${part}`
}

export default function(maxTime: number) {
    let handleEnd=false
    let handleWarn=false
    let paused=true
    let time=0.0
    let last=''
    const isHurry = () => maxTime-time<=HURRY_TIME
    const isTimeUp = () => time>=maxTime
    const getTime = () => time
    const isStarted = () => time>0
    const isPaused = () => paused
    const pause = () => paused=true
    const unpause = () => paused=false
    return {
        isHurry,
        isTimeUp,
        isStarted,
        isPaused,
        getTime,
        pause,
        unpause,
        start() {
            if( ! isStarted() ) {
                unpause()
                time=0.01
            }
        },
        powerup(index: number) {
            if( index===POWERUPS.TIME ) {
                maxTime+=30
                debug('Sweet, you just increased game time by 30 sec!')
            }
        },
        writeTime(secs: number = maxTime) {
            const str = formatTime(secs)
            if( last!== str ) {
                this.text = str
                last = str
            }
        },
        update() {
            if( isPaused() ) return
            if( isStarted() ) {
                time += k.dt()
                this.writeTime(maxTime-time)
                if( isHurry() && !handleWarn ) {
                    handleWarn=true
                    this.trigger("hurry_up")
                } else if( isTimeUp() && !handleEnd ) {
                    handleEnd=true
                    this.trigger("time_up")
                }
            }
        }
    }
}
