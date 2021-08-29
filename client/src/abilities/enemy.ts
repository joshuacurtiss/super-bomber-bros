import { ENEMY_SPEED, IDLE, LEFT, RIGHT, UP, DOWN, GRID_PIXEL_SIZE } from '../types'
import { k } from '../kaboom'
import { getAtPos } from '../util'
import { Vec2 } from 'kaboom'

const {
    choose,
    destroy,
    randSeed,
    vec2,
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
        randomizeDir() {
            const attemptThreshold = 50
            let attempts = 0
            let nextStep
            do {
                dir = randomDir()
                // When determining your point for grid checking, adjust for sprite boundary area and its scale
                const point = this.pos.add(this.area.p1.scale(this.scale.x, this.scale.y))
                // Check the grid spot one step over in the dir, for any solid objects
                nextStep = getAtPos(point.add(dir.scale(GRID_PIXEL_SIZE)), 'solid')
            } while( nextStep.length && attempts++ < attemptThreshold ) ;
            if (attempts>=attemptThreshold ) dir=IDLE
        },
        die() {
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
