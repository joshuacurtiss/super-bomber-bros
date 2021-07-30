import k from '../kaboom'
import {GRID_PIXEL_SIZE, POWERUPS} from '../types'
import {Vec2} from 'kaboom'

const {
    add,
    destroy,
    dt,
    get,
    layer,
    origin,
    pos,
    rotate,
    scale,
    sprite,
    wait,
} = k

/**
 * Function for attaching bomb ability to a player. Tracks their current bomb deploying abilities, 
 * like: Blast radius, bomb quantity, and other special abilities
 */
function bomb() {
    const MAX_RADIUS = 9
    const MAX_QUANTITY = 9
    let radius = 1
    let quantity = 1
    let bombCnt = 0
    return {
        getRadius: ()=>radius,
        canSpawnBomb: ()=>bombCnt<quantity,
        decBombCnt: ()=>--bombCnt,
        incBombCnt: ()=>++bombCnt,
        spawnBomb,
        powerup(name: POWERUPS) {
            if( name===POWERUPS.RADIUS_INC ) radius = radius<MAX_RADIUS ? radius+1 : MAX_RADIUS
            else if( name===POWERUPS.RADIUS_DEC ) radius = radius>1 ? radius-1 : 1
            else if( name===POWERUPS.RADIUS_MAX ) radius = MAX_RADIUS
            else if( name===POWERUPS.QUANTITY_INC ) quantity = quantity<MAX_QUANTITY ? quantity+1 : MAX_QUANTITY
            else if( name===POWERUPS.QUANTITY_DEC ) quantity = quantity>1 ? quantity-1 : 1
            else if( name===POWERUPS.QUANTITY_MAX ) quantity = MAX_QUANTITY
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
            if( timer<0 ) this.explode()
        },
        explode() {
            const EXP_SCALE = 0.66666667
            const expPos = {x: this.pos.x + GRID_PIXEL_SIZE/2, y: this.pos.y + GRID_PIXEL_SIZE/2} as Vec2
            const expOrigin = add([
                sprite('explosion'),
                scale(EXP_SCALE),
                origin('center'),
                pos(expPos),
                layer('bomb'),
                'explosion',
            ])
            const expMids = []
            const expEnds = []
            const {x, y} = expPos
            for( let i=1 ; i<=player.getRadius() ; i++ ) {
                const targ = i===player.getRadius() ? expEnds : expMids
                targ.push(add([
                    sprite('explosion'),
                    origin('center'),
                    layer('bomb'), 
                    scale(EXP_SCALE), 
                    pos(x + GRID_PIXEL_SIZE*i, y), 
                    'explosion',
                ]))
                targ.push(add([
                    sprite('explosion'),
                    origin('center'),
                    layer('bomb'), 
                    scale(-EXP_SCALE, EXP_SCALE), 
                    pos(x - GRID_PIXEL_SIZE*i, y), 
                    'explosion',
                ]))
                targ.push(add([
                    sprite('explosion'),
                    origin('center'),
                    layer('bomb'), 
                    scale(EXP_SCALE, -EXP_SCALE), 
                    rotate(33), 
                    pos(x, y + GRID_PIXEL_SIZE*i), 
                    'explosion',
                ]))
                targ.push(add([
                    sprite('explosion'),
                    origin('center'),
                    layer('bomb'), 
                    scale(EXP_SCALE), 
                    rotate(33), 
                    pos(x, y - GRID_PIXEL_SIZE*i), 
                    'explosion',
                ]))
            }
            player.decBombCnt()
            destroy(this)
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
    let {x, y} = this.pos as Vec2
    let modX = x % GRID_PIXEL_SIZE
    let modY = y % GRID_PIXEL_SIZE
    const bombPosition = {
        x: Math.round(x - modX + (modX<=GRID_PIXEL_SIZE/2 ? 0 : GRID_PIXEL_SIZE)),
        y: Math.round(y - modY + (modY<=GRID_PIXEL_SIZE/2 ? 0 : GRID_PIXEL_SIZE)),
    } as Vec2
    // Check if a bomb is already here, and only spawn if it is clear
    const bombs = get('bomb')
    if( bombs.length===0 || bombs.filter(bomb=>bomb.pos.eq(bombPosition)).length===0 ) {
        const bomb = add([
            sprite('bomb'),
            scale(2),
            layer('bomb'),
            pos(bombPosition),
            bombTimer(this),
            'bomb'
        ])
        bomb.play('bomb')
        this.incBombCnt()
    }
}

export default bomb