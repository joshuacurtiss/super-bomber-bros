import k from '../kaboom'
import canBomb from '../abilities/canBomb'
import canDie from '../abilities/canDie'
import canWalk from '../abilities/canWalk'
import brick from '../model/Brick'
import timer from '../model/Timer'
import {convertMapPosToCoord, findMapItem, getAtPos} from '../util'
import {GRID_PIXEL_SIZE} from '../types'

const DEFAULT_GAME_TIME = 180
const GRAVITY = 300

const {
    action,
    add, 
    addLevel, 
    area,
    body,
    color,
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
    width,
} = k

const map = [
    '###############',
    '#1  OO OOOO  2#',
    '# #O###O#O### #',
    '# OOO OO#OOOO #',
    '#O###O# ###O#O#',
    '#O#OOOO OO#OOO#',
    '#O#O#O# #O#O#O#',
    '#OOO#OO OOOO#O#',
    '#O#O### #O###O#',
    '# OOO #OOO OO #',
    '# ###O#O###O# #',
    '#4  OOOO OO  3#',
    '###############',
]

const noArea = true

const mapWidth = map[0].length
const mapWidthPixels = mapWidth * GRID_PIXEL_SIZE
const mapHeight = map.length
const mapHeightPixels = mapHeight * GRID_PIXEL_SIZE

const WHITE = color(1, 1, 1)
const BLUE = color(0.39, 0.47, 0.937)
const GREEN = color(0.223, 0.517, 0)

export default function () {

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
        rect(mapWidthPixels, mapHeightPixels, {noArea}),
        pos(0, GRID_PIXEL_SIZE),
        GREEN,
        layer('bg'),
    ])

    // Header/Timer
    add([rect(mapWidthPixels-1, GRID_PIXEL_SIZE-1, {noArea}), WHITE])
    add([rect(mapWidthPixels-5, GRID_PIXEL_SIZE-5, {noArea}), pos(2, 2), BLUE])
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
                    pos(vec2(x, y).sub(vec2(0, mapHeight)).scale(GRID_PIXEL_SIZE)),
                    { targ }
                ])
            })
        }
        // For 3 layers, drop bricks around the perimeter (T/R/B/L)
        for( let i=1 ; i<=3 ; i+=1 ) {
            y=1+i
            for( x=i ; x<mapWidth-i ; x+=1 ) handleBrick(t+=SPEED, x, y)
            x=mapWidth-i-1
            for( y=2+i ; y<mapHeight-i ; y+=1 ) handleBrick(t+=SPEED, x, y)
            y=mapHeight-i
            for( x=mapWidth-1-i ; x>=i ; x-=1 ) handleBrick(t+=SPEED, x, y)
            x=i
            for( y=mapHeight-i-1 ; y>i+1 ; y-=1 ) handleBrick(t+=SPEED, x, y)
        }
        // Randomized timeslots for hazard
        const times=[rand(3,8), rand(12,19), rand(25,35), rand(38,42), rand( 43,48), rand(49,51), rand(52,56)]
        if( rand()>0.5 ) {
            debug.log("You better run, better run, faster than my bullet...")
            times.forEach(t=>{
                wait(t, ()=>{
                    play('bullet')
                    const dir = rand()>0.5 ? 1 : -1
                    const bullet = add([
                        sprite('bullet'),
                        scale(dir, 1),
                        pos(dir===1 ? -GRID_PIXEL_SIZE*3 : width()+GRID_PIXEL_SIZE, Math.floor(rand(0, mapHeightPixels-GRID_PIXEL_SIZE))),
                        'enemy',
                    ])
                    bullet.action(()=>{
                        bullet.move(125 * bullet.scale.x,0)
                        if( bullet.scale.x>0 && bullet.pos.x > width() ) destroy(bullet)
                        if( bullet.scale.x<0 && bullet.pos.x < -bullet.width ) destroy(bullet)
                    })
                })
            })
        } else {
            debug.log("Gone fishin'...")
            times.forEach(t=>{
                wait(t, ()=>{
                    const dir = rand()>0.5 ? 1 : -1
                    const jumpForce = rand(250, 550)
                    const horizForce = rand(100, 250) * dir
                    const x = dir>0 ? rand(-GRID_PIXEL_SIZE*4,mapWidthPixels*0.3) : rand(mapWidthPixels*0.7, mapWidthPixels+GRID_PIXEL_SIZE*4)
                    const y = mapHeightPixels+GRID_PIXEL_SIZE
                    const fish = add([
                        sprite('fish'),
                        scale(dir*2, 2),
                        layer('ui'),
                        pos(x, y),
                        body({jumpForce}),
                        'enemy',
                    ])
                    fish.play('fish')
                    fish.jump()
                    fish.action(()=>{
                        fish.move(horizForce,0)
                        if( fish.pos.y <= y ) {
                            getAtPos(fish.pos, 'player').forEach(obj=>{
                                obj.die()
                                destroy(fish)
                            })
                        } else {
                            destroy(fish)
                        }
                    })
                })
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