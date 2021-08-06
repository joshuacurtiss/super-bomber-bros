import k from '../kaboom'
import {getAtPos} from '../util'
import {GRID_PIXEL_SIZE, POWERUPS} from '../types'
import {Vec2} from 'kaboom'

const {
    action,
    add,
    area,
    debug,
    destroy,
    dt,
    get,
    origin,
    play,
    pos,
    rotate,
    scale,
    sprite,
    vec2,
    wait,
} = k

/**
 * Function for attaching bomb ability to a player. Tracks their current bomb deploying abilities, 
 * like: Blast radius, bomb quantity, and other special abilities
 */
function canBomb() {
    const MAX_RADIUS = 9
    const MAX_QUANTITY = 9
    let radius = 1
    let quantity = 1
    let bombCnt = 0
    let bombKick = false
    let pbomb = false
    action("bomb", b => b.check())
    return {
        setRadius: newradius=>radius=newradius,
        getRadius: ()=>radius,
        canSpawnBomb() {
            return bombCnt<quantity && this.isAlive()
        },
        decBombCnt: ()=>--bombCnt,
        incBombCnt: ()=>++bombCnt,
        canBombKick: ()=>bombKick,
        canPBomb: ()=>pbomb,
        spawnBomb,
        bombPowerup(index: number) {
            if( index===POWERUPS.RADIUS ) {
                radius = radius<MAX_RADIUS ? radius+1 : MAX_RADIUS
                debug.log(`Sweet, your bomb radius is now ${radius}!`)
            } else if( index===POWERUPS.QUANTITY ) {
                quantity = quantity<MAX_QUANTITY ? quantity+1 : MAX_QUANTITY
                debug.log(`Sweet, you can now drop ${quantity} bombs!`)
            } else if( index===POWERUPS.KICK ) {
                bombKick=true
                debug.log(`Kickin' the can!`)
            } else if( index===POWERUPS.P_BOMB ) {
                pbomb=true
                debug.log(`Sweet, let it all out!`)
            }
        }
    }
}

/**
 * Timer function for bombs. Handles the countdown and initiating the explosion afterward.
 * On `update`, it counts the timer down, and when timer is below zero, it runs `explode`
 * then destroys it after it is done (0.7 sec).
 * @param player The player who owns the bomb, so their bomb count can be decremented.
 */
 function bombTimer(player) {
    let timer = 3
    return {
        update() {
            timer-=dt()
            if( timer<0 ) {
                play('explosion')
                this.explode()
            }
        },
        check() {
            if( this.solid ) return
            const playerCenter = player.pos.add(player.area.p1.add(player.area.p2).scale(0.5))
            const bombCenter = this.pos.add(this.area.p1.add(this.area.p2).scale(0.5))
            this.solid = playerCenter.dist(bombCenter) > 30
        },
        remove() {
            destroy(this)
            player.decBombCnt()
        },
        explode() {
            destroy(this)
            const EXP_SCALE = 0.6666666
            const AREA_SCALE = 1/EXP_SCALE
            const area1 = vec2(-14,-14)
            const area2 = vec2(14,14)
            const expPos = {x: this.pos.x + GRID_PIXEL_SIZE/2, y: this.pos.y + GRID_PIXEL_SIZE/2} as Vec2
            const expOrigin = add([
                sprite('explosion'),
                scale(EXP_SCALE),
                origin('center'),
                area(area1, area2),
                pos(expPos),
                'explosion',
            ])
            const expMids = []
            const expEnds = []
            const {x, y} = expPos
            const radius = player.getRadius()
            const detectItems = (itemPos): boolean => {
                if( getAtPos(itemPos, 'block').length ) return true
                const bricks=getAtPos(itemPos, 'brick')
                if( bricks.length ) {
                    bricks.forEach(brick=>brick.explode())
                    return true
                }
                const powerups=getAtPos(itemPos, 'powerup')
                if( powerups.length ) {
                    powerups.forEach(item=>destroy(item))
                    return true
                }
                const bombs=getAtPos(itemPos, 'bomb')
                if( bombs.length ) {
                    bombs.forEach(bomb=>bomb.explode())
                    return true
                }
                return false
            };
            // Right
            for( let i=1, hit=false ; i<=radius && !hit ; i++ ) {
                const newPos = {x: x + GRID_PIXEL_SIZE*i,  y} as Vec2
                hit = detectItems(newPos)
                if( ! hit ) {
                    (i===radius ? expEnds : expMids).push(add([
                        sprite('explosion'),
                        origin('center'), 
                        scale(EXP_SCALE), 
                        area(area1, area2),
                        pos(newPos), 
                        'explosion',
                    ]))
                }
            }
            // Left
            for( let i=1, hit=false ; i<=radius && !hit ; i++ ) {
                const newPos = {x: x - GRID_PIXEL_SIZE*i,  y} as Vec2
                hit = detectItems(newPos)
                if( ! hit ) {
                    (i===radius ? expEnds : expMids).push(add([
                        sprite('explosion'),
                        origin('center'), 
                        scale(-EXP_SCALE, EXP_SCALE), 
                        area(area1, area2),
                        pos(newPos), 
                        'explosion',
                    ]))
                }
            }
            // Down
            for( let i=1, hit=false ; i<=radius && !hit ; i++ ) {
                const newPos = {x,  y: y + GRID_PIXEL_SIZE*i} as Vec2
                hit = detectItems(newPos)
                if( ! hit ) {
                    (i===radius ? expEnds : expMids).push(add([
                        sprite('explosion'),
                        origin('center'), 
                        scale(EXP_SCALE, -EXP_SCALE), 
                        area(area1, area2),
                        rotate(33), 
                        pos(x, y + GRID_PIXEL_SIZE*i), 
                        'explosion',
                    ]))
                }
            }
            // Up
            for( let i=1, hit=false ; i<=radius && !hit ; i++ ) {
                const newPos = {x,  y: y - GRID_PIXEL_SIZE*i} as Vec2
                hit = detectItems(newPos)
                if( ! hit ) {
                    (i===radius ? expEnds : expMids).push(add([
                        sprite('explosion'),
                        origin('center'), 
                        scale(EXP_SCALE), 
                        area(area1, area2),
                        rotate(33), 
                        pos(x, y - GRID_PIXEL_SIZE*i), 
                        'explosion',
                    ]))
                }
            }
            player.decBombCnt()
            expOrigin.play('explode-origin')
            expMids.forEach(exp=>exp.play('explode-mid'))
            expEnds.forEach(exp=>exp.play('explode-end'))
            wait(0.7, ()=>{
                [expOrigin, ...expMids, ...expEnds].forEach(exp=>destroy(exp))
            })
        }
    }
}

/**
 * Spawns a new bomb at the player's position. It snaps the position to the grid so the bomb fits cleanly on the grid.
 * If a bomb already exists at the location, it will not spawn another one.
 */
function spawnBomb() {
    // Do not spawn if you have no more left
    if( ! this.canSpawnBomb() ) return
    // Snap the bomb to the grid size
    // We use player's area instead of sprite position to be a little more accurate to what the player expects. 
    // Also, we add a couple pixels vertically so the placement favors the feet over the head.
    let {x, y} = this.pos.add(this.area.p1).add(vec2(0, 2))
    let modX = x % GRID_PIXEL_SIZE
    let modY = y % GRID_PIXEL_SIZE
    const bombPosition = {
        x: Math.round(x - modX + (modX<=GRID_PIXEL_SIZE/2 ? 0 : GRID_PIXEL_SIZE)),
        y: Math.round(y - modY + (modY<=GRID_PIXEL_SIZE/2 ? 0 : GRID_PIXEL_SIZE)),
    } as Vec2
    // Check if a bomb is already here, and only spawn if it is clear
    const bombs = get('bomb')
    if( bombs.length===0 || bombs.filter(bomb=>bomb.pos.eq(bombPosition)).length===0 ) {
        play('laybomb')
        const bomb = add([
            sprite('bomb'),
            scale(2),
            area(vec2(2,4), vec2(14,16)),
            pos(bombPosition),
            bombTimer(this),
            'bomb',
        ])
        bomb.play('bomb')
        this.incBombCnt()
    }
}

export default canBomb