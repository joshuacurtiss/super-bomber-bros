import k from '../kaboom'
import canBomb from '../abilities/canBomb'
import canDie from '../abilities/canDie'
import canWalk from '../abilities/canWalk'
import bullet from '../hazards/Bullet'
import fish from '../hazards/Fish'
import brick from '../model/Brick'
import timer from '../model/Timer'
import maps from '../maps.json'

import {convertMapPosToCoord, findMapItem, getAtPos} from '../util'
import {
    GRID_PIXEL_SIZE,
    MAP_WIDTH,
    MAP_WIDTH_PIXELS,
    MAP_HEIGHT,
    MAP_HEIGHT_PIXELS,
    BLUE,
    GREEN,
    WHITE,
} from '../types'

const DEFAULT_GAME_TIME = 180
const GRAVITY = 300

const noArea = true

const {
    action,
    add, 
    addLevel, 
    area,
    body,
    debug,
    destroy,
    go, 
    gravity,
    keyDown, 
    keyPress, 
    keyRelease,
    layer,
    layers, 
    overlaps,
    play,
    pos, 
    rand,
    rect,
    scale, 
    solid,
    sprite,
    text,
    vec2, 
    wait,
} = k

export default function (mapId=0) {

    const map=maps[mapId]

    // Debugging
    if( location.search.toLowerCase().indexOf("debug")>0 ) {
        debug.inspect = true
    }
    
    // Layers
    layers(['bg', 'obj', 'ui'], 'obj')
    
    // Gravity
    gravity(GRAVITY)
    
    // Level/Map
    const mapConfig = {
        width: GRID_PIXEL_SIZE,
        height: GRID_PIXEL_SIZE,
        pos: vec2(0, GRID_PIXEL_SIZE),
        scale: 2,
        '#': [sprite('block'), scale(2), solid(), 'block'],
        'O': [sprite('brick'), scale(2), solid(), brick(), 'brick'],
        any: (ch) => null,
    }
    addLevel(map, mapConfig)
    add([
        rect(MAP_WIDTH_PIXELS, MAP_HEIGHT_PIXELS, {noArea}),
        pos(0, GRID_PIXEL_SIZE),
        GREEN,
        layer('bg'),
    ])

    // Header/Timer
    add([rect(MAP_WIDTH_PIXELS-1, GRID_PIXEL_SIZE-1, {noArea}), WHITE])
    add([rect(MAP_WIDTH_PIXELS-5, GRID_PIXEL_SIZE-5, {noArea}), pos(2, 2), BLUE])
    const timerLabel = add([
        text("", 16, {noArea}),
        pos(12, 9),
        timer(DEFAULT_GAME_TIME),
    ]);
    timerLabel.on('timer_warning', ()=>{
        debug.log("Time's running out!")
        play('hurryup')
        // Falling blocks shrink the board
        const SPEED=0.5
        let x
        let y
        let t=1
        // This function handles a brick falling to its target at a given time.
        const handleBrick = (t: number, x:number, y:number) => {
            wait(t, ()=>{
                const targ=vec2(x, y).scale(GRID_PIXEL_SIZE)
                add([
                    sprite('block'),
                    scale(2),
                    'fallingblock',
                    pos(vec2(x, y).sub(vec2(0, MAP_HEIGHT)).scale(GRID_PIXEL_SIZE)),
                    { targ }
                ])
            })
        }
        // For 3 layers, drop bricks around the perimeter (T/R/B/L)
        for( let i=1 ; i<=3 ; i+=1 ) {
            y=1+i
            for( x=i ; x<MAP_WIDTH-i ; x+=1 ) handleBrick(t+=SPEED, x, y)
            x=MAP_WIDTH-i-1
            for( y=2+i ; y<MAP_HEIGHT-i ; y+=1 ) handleBrick(t+=SPEED, x, y)
            y=MAP_HEIGHT-i
            for( x=MAP_WIDTH-1-i ; x>=i ; x-=1 ) handleBrick(t+=SPEED, x, y)
            x=i
            for( y=MAP_HEIGHT-i-1 ; y>i+1 ; y-=1 ) handleBrick(t+=SPEED, x, y)
        }
        // Randomized timeslots for hazard
        const times=[rand(3,8), rand(12,19), rand(25,35), rand(38,42), rand( 43,48), rand(49,51), rand(52,56)]
        if( rand()>0.5 ) {
            debug.log("You better run, better run, faster than my bullet...")
            times.forEach(t=>{
                wait(t, bullet)
            })
        } else {
            debug.log("Gone fishin'...")
            times.forEach(t=>{
                wait(t, fish)
            })
        }
    })
    timerLabel.on('timer_end', ()=>{
        go('lose')
    })

    // Player
    const {x: playerX, y: playerY} = convertMapPosToCoord(findMapItem(map, '1'))
    const player = add([
        sprite('bomberman'),
        pos(playerX-7, playerY-12),
        scale(1.3),
        area(vec2(8,10), vec2(26,34)),
        canBomb(),
        canDie(),
        canWalk(),
        'player',
    ])
    player.action(() => {
        player.resolve()
    })
    player.on('died', ()=>{
        wait(2, ()=>{
            go('lose')
        })
    })
    overlaps('explosion', 'player', (exp, player)=>{
        player.die()
    })
    overlaps('enemy', 'player', (enemy, player)=>{
        player.die()
        destroy(enemy)
    })
    overlaps('powerup', 'player', (powerup, player)=>{
        play('powerup')
        player.bombPowerup(powerup.frame)
        player.walkPowerup(powerup.frame)
        timerLabel.powerup(powerup.frame)
        destroy(powerup)
    })

    // Other events
    action('fallingblock', b=>{
        b.move(0, 250)
        // When the falling block is close to its target, snap it into place.
        const distance = b.pos.dist(b.targ)
        if( distance<GRID_PIXEL_SIZE/5 ) {
            play('thud')
            b.pos=b.targ
            // Remove the 'fallingblock' tag so it will stop falling.
            b.rmTag('fallingblock')
            // Find everything under the block. Kill players, remove bombs, just destroy everything else that is tagged
            getAtPos(b.targ).forEach(obj=>{
                if( obj.is("player") ) obj.die()
                else if( obj.is("bomb") ) obj.remove()
                else if( obj._tags.length ) destroy(obj)
            })
            // Finally, make the block solid so can't walk thru
            b.solid=true
        }
    })

    // Controls
    keyPress('space', ()=>{
        timerLabel.start()
        player.spawnBomb()
    })
    const dirs = {
        "left": vec2(-1, 0),
        "right": vec2(1, 0),
        "up": vec2(0, -1),
        "down": vec2(0, 1),
    }
    Object.entries(dirs).forEach(([dir, vec])=>{
        keyDown(dir, ()=>{
            timerLabel.start()
            player.walk(vec)
        })
        keyRelease(dir, player.stop)
    })
}