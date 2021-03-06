import { CMDS } from '../model/Network'
import {k, debug, network} from '../kaboom'
import {getAtPos, getOverlapped, getSfxVol, snapToGrid} from '../util'
import {LEFT, RIGHT, UP, DOWN, IDLE, GRID_PIXEL_SIZE, POWERUPS, BOMB_SPEED} from '../types'
import {Vec2} from 'kaboom'

const {
    add,
    area,
    destroy,
    dt,
    get,
    origin,
    play,
    pos,
    rotate,
    scale,
    sprite,
    time,
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
    let lastBombTime = 0
    let lastBombPos = vec2(0, 0)

    /**
     * Spawns a new bomb at the player's position. If you double-tapped bomb,
     * it will trigger the P-Bomb.
     */
    function spawnBomb(): boolean {
        if( this.isDead() ) return
        const t = time()
        const p = this.pos.clone()
        if( t-lastBombTime<0.3 && p.eq(lastBombPos) ) {
            // If double-tap bomb (within .3 sec) without moving, spawn P-Bomb
            this.spawnPBomb()
            lastBombTime = 0
        } else {
            lastBombTime = t
            lastBombPos = p
            // Use player's area instead of sprite position to be a little more accurate
            // to what player expects. Also, we add a couple pixels vertically so the 
            // placement favors the feet over the head.
            const success = this.spawnBombAtPos(this.pos.add(this.area.p1).add(vec2(0, 2)))
            if (success) k.readd(this)
            return success
        }
    }

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
        spawnBombAtPos,
        spawnPBomb,
        bombPowerup(index: number) {
            if( index===POWERUPS.RADIUS ) {
                radius = radius<MAX_RADIUS ? radius+1 : MAX_RADIUS
                debug(`Sweet, your bomb radius is now ${radius}!`)
            } else if( index===POWERUPS.QUANTITY ) {
                quantity = quantity<MAX_QUANTITY ? quantity+1 : MAX_QUANTITY
                debug(`Sweet, you can now drop ${quantity} bombs!`)
            } else if( index===POWERUPS.KICK ) {
                bombKick=true
                debug(`Kickin' the can!`)
            } else if( index===POWERUPS.P_BOMB ) {
                pbomb=true
                debug(`Sweet, let it all out!`)
            }
        },
        kickBomb(bomb) {
            if( ! this.canBombKick() ) return
            const chunk = GRID_PIXEL_SIZE*0.4
            const diff = bomb.pos.sub(this.pos)
            bomb.moving = diff.x > chunk ? RIGHT :
                diff.x < -chunk ? LEFT : 
                diff.y > chunk ? DOWN : 
                diff.y < -chunk ? UP : IDLE
            debug(`Kick bomb: ${bomb.moving.x},${bomb.moving.y}`)
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
            if( this.paused ) return
            timer-=dt()
            if( timer<0 ) {
                // Bomb should explode when timer passes zero
                play('explosion', {volume: getSfxVol()})
                this.explode()
            } else if( timer<=1 && (!this.moving || this.moving.eq(IDLE)) ) {
                // If less than 1 sec and no motion, shake the bomb ever so slightly
                const diff = Math.floor((timer % 1) * 10) % 2 === 0
                this.scale = 2 + (diff ? 0.05 : 0)
            }
            // Move bomb
            if( this.moving && !this.moving.eq(IDLE) ) {
                const {x, y} = this.moving
                const chkPosOffset = x+y<0 ? 0.5 : 1.1 
                const items=getAtPos(this.pos.add(this.moving.scale(GRID_PIXEL_SIZE*chkPosOffset)))
                const hasBlocker = items.some(item=>{
                    if( item.is('solid') ) return true
                    if( item.is('player') ) return true
                    if( item.is('enemy') ) return true
                    // If bomb slides over a powerup, just destroy it
                    if( item.is('powerup') ) destroy(item)
                })
                if( hasBlocker ) {
                    this.pos = snapToGrid(this.pos)
                    this.moving = IDLE
                } else {
                    this.move(this.moving.scale(BOMB_SPEED))
                }
            }
            // Check if bomb should be made solid
            if( !this.solid ) {
                const items = getOverlapped(this, 'player')
                if( !items.length ) {
                    this.solid = true
                    this.use('solid')
                }
            }
        },
        remove() {
            destroy(this)
            player.decBombCnt()
        },
        explode() {
            destroy(this)
            const EXP_SCALE = 0.6666666
            const area1 = vec2(-14,-14)
            const area2 = vec2(14,14)
            const expPos = snapToGrid(this.pos).add(vec2(GRID_PIXEL_SIZE/2, GRID_PIXEL_SIZE/2))
            network.send(CMDS.BOMB_EXPLODE, expPos)
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
 * Spawns a new bomb at the provided position. It snaps the position to the grid so the bomb fits cleanly on the grid.
 * If a bomb/brick/block already exists at the location, it will not spawn.
 */
function spawnBombAtPos(position: Vec2): boolean {
    // Do not spawn if paused
    if( this.paused ) return false
    // Do not spawn if you have no more left
    if( ! this.canSpawnBomb() ) return false
    // Snap position to grid. 
    const snappedPosition = snapToGrid(position)
    // Check if bomb/block/brick is already here, and only spawn if it is clear
    const objs = get().filter(obj=>{
        if( !obj.pos?.eq(snappedPosition) ) return false 
        return obj.is('bomb') || obj.is('block') || obj.is('brick') || obj.is('powerup')
    })
    if( objs.length ) return false
    // All good? Spawn the bomb.
    play('laybomb', {volume: getSfxVol()})
    const bomb = add([
        sprite('bomb'),
        scale(2),
        area(vec2(2,4), vec2(14,16)),
        pos(snappedPosition),
        bombTimer(this),
        'bomb',
    ])
    bomb.play('bomb')
    this.incBombCnt()
    network.send(CMDS.BOMB_SPAWN, snappedPosition)
    return true
}

/**
 * Spawns P-Bomb at the player's position.
 */
function spawnPBomb() {
    // Do not allow P-Bomb unless you have that ability
    if( ! this.canPBomb() ) return 
    let i=0
    let success=true
    // Just keep spawning bombs until you get back a failure. It may be because you ran out of bombs or
    // because something got in the way. Either way, it works.
    while( success ) {
        i+=1
        // Use player's area instead of sprite position to be a little more accurate to what player expects. 
        // Also, we add a couple pixels vertically so the placement favors the feet over the head. Then we
        // go `i` grid positions from the player.
        const p = this.pos.add(this.area.p1).add(vec2(0, 2)).add(this.getDir().scale(i*GRID_PIXEL_SIZE))
        success = this.spawnBombAtPos(p)
    }
}

export default canBomb