import { GameObj } from 'kaboom'
import { k, debug } from '../kaboom'
import { POWERUPS } from '../types'

const {time} = k

const HURRY_TIME = 60

function formatTime(secs: number): string {
    const part = Math.floor(secs % 1 * 10)
    const sec = Math.floor(secs) % 60
    const min = Math.floor(secs/60)
    return `${min}:${sec<10 ? '0' : ''}${sec}.${part}`
}

export default function(maxTime: number) {
    let handleEnd=false
    let handleInit=false
    let handleWarn=false
    let paused=true
    let start=0
    let last=''
    const getTime = () => {
        const t = start + maxTime - time()
        return t>0 ? t : 0
    }
    const isHurry = (t=getTime()) => t<=HURRY_TIME
    const isTimeUp = (t=getTime()) => t===0
    return {
        isHurry,
        isTimeUp,
        getTime,
        pause() {
            paused=true
        },
        unpause() {
            paused=false
        },
        start() {
            if( !start ) {
                paused=false
                start=time()
            }
        },
        started() {
            return start>0
        },
        powerup(index: number) {
            if( index===POWERUPS.TIME ) {
                maxTime+=30
                debug('Sweet, you just increased game time by 30 sec!')
            }
        },
        writeTime(secs: number) {
            const str = formatTime(secs)
            if( last!== str ) {
                this.text = str
                last = str
            }
        },
        update() {
            if( start && !paused ) {
                const t = getTime()
                this.writeTime(t)
                if( isHurry(t) && !handleWarn ) {
                    handleWarn=true
                    this.trigger("hurry_up")
                } else if( isTimeUp(t) && !handleEnd ) {
                    handleEnd=true
                    this.trigger("time_up")
                }
            } else if( !handleInit ) {
                handleInit=true
                this.writeTime(maxTime)
            }
        }
    }
}
