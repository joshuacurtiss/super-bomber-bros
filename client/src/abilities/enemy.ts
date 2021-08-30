import { ENEMY_SPEED, IDLE, LEFT, RIGHT, UP, DOWN, GRID_PIXEL_SIZE } from '../types'
import { k } from '../kaboom'
import { getAtPos } from '../util'
import { Vec2 } from 'kaboom'

const {
    add,
    choose,
    destroy,
    pos,
    rand,
    randSeed,
    scale,
    sprite,
    vec2,
    wait,
} = k

const DIRS = [LEFT, RIGHT, UP, DOWN]

const GRID_PIXEL_SIZE_HALF = GRID_PIXEL_SIZE / 2

function randomDir():Vec2 {
    return choose(DIRS)
}

export default function (speed: number = ENEMY_SPEED) {
    randSeed(Date.now())
    let dir=randomDir()
    return {
        /**
         * Will look in the direction of the object and see if its clear for going that direction.
         */
        checkMapToMy(dir:Vec2):boolean {
            // When determining your point for grid checking, adjust for sprite boundary area and its scale
            const point = this.pos.add(this.area.p1.scale(this.scale.x, this.scale.y))
            // Check the grid spot one step over in the dir, for any solid objects
            return getAtPos(point.add(dir.scale(GRID_PIXEL_SIZE)), 'solid').length===0
        },
        /**
         * Randomizes the direction but only a direction it can actually go. If he can't move, he'll give up and sit there.
         */
        randomizeDir() {
            const attemptThreshold = 50
            let attempts = 0
            do {
                dir = randomDir()
            } while( !this.checkMapToMy(dir) && attempts++ < attemptThreshold ) ;
            if (attempts>=attemptThreshold ) dir=IDLE
        },
        die() {
            const smoke = add([
                sprite('smoke', {noArea: true}),
                scale(2),
                pos(this.pos),
            ])
            smoke.play('smoke')
            wait(0.8, ()=>destroy(smoke))
            destroy(this)
        },
        add() {
            this.collides('solid', item => {
                // When you bump into something, back up a tick so you don't keep on triggering `collides()`
                this.move(dir.scale(-speed))
                // Change your direction
                this.randomizeDir()
            })
        },
        update() {
            // If he's right at a turning point, he'll consider turning
            Array('x', 'y').some(ax=>{
                if( 
                    // If your current direction is on this axis (either -1 or 1)...
                    dir[ax] && 
                    // And you are right at the turning point (on the snap line)...
                    Math.round(this.pos[ax]) % GRID_PIXEL_SIZE===0 &&
                    // And the two directions of your opposite axis are open...
                    (this.checkMapToMy(ax==='x' ? UP : LEFT) || this.checkMapToMy(ax==='x' ? DOWN : RIGHT)) && 
                    // And some randomness...
                    rand()<0.4
                ) {
                    // Then go ahead and randomly choose another direction.
                    this.randomizeDir()
                    // By returning true, 'y' axis won't run if 'x' axis returned true, because we looped with `some()`
                    return true
                }
            })
            // Help him walk toward snap line
            let diff = vec2(0,0)
            Array('x', 'y').forEach(ax=>{
                // If he's already moving on this axis, don't make adjustments
                if( dir[ax]!==0 ) return
                // Get offset from grid, at precision of 2 decimals
                let dax = (Math.round(this.pos[ax]*100)/100) % GRID_PIXEL_SIZE
                // No offset? We're good.
                if( dax===0 ) return
                // Lean him towards whichever snap point he's closer to.
                dax = -dax + (dax>GRID_PIXEL_SIZE_HALF ? GRID_PIXEL_SIZE : 0)
                // Adjust for the fact that speed is scaled on the direction vector.
                // BUT we want him to self-adjust faster than the standard speed, so we divide it
                // by only 1/8 of the speed, so he'll walk toward the snap line quickly.
                dax /= speed/8
                diff[ax] = dax
            })
            this.move(dir.add(diff).scale(speed))
        }
    }
}
