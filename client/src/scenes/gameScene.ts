import {k, debug, network} from '../kaboom'
import canBomb from '../abilities/canBomb'
import canDie from '../abilities/canDie'
import canScore from '../abilities/canScore'
import canWalk from '../abilities/canWalk'
import enemy from '../abilities/enemy'
import bullet from '../hazards/Bullet'
import fish from '../hazards/Fish'
import brickFeature from '../features/brick'
import timerFeature from '../features/timer'
import maps from '../maps/campaign.json'

import {convertMapPosToCoord, findMapItem, findMapItems, getAtPos} from '../util'
import {
    DIRS,
    GRID_PIXEL_SIZE,
    MAP_WIDTH,
    MAP_WIDTH_PIXELS,
    MAP_HEIGHT,
    MAP_HEIGHT_PIXELS,
    MUSIC_HURRY_DETUNE,
    MUSIC_HURRY_SPEED,
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
    choose,
    destroy,
    every,
    go, 
    gravity,
    keyDown, 
    keyPress, 
    keyRelease,
    layer,
    layers, 
    loadSound,
    origin,
    overlaps,
    play,
    pos, 
    rand,
    rect,
    scale, 
    solid,
    sprite,
    text,
    time,
    vec2, 
    wait,
} = k

export default async function (mapId=1, mp=false) {

    const map=maps[mapId]
    const volume=0.25
    let music

    // Networking
    network.enabled = mp

    // Music
    const musicPrefix = choose(['mb', 'mp'])
    await loadSound('music-intro', `assets/music/${musicPrefix}i.ogg`)
    await loadSound('music', `assets/music/${musicPrefix}.ogg`)

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
        '#': [sprite('block'), scale(2), solid(), 'solid', 'block'],
        'O': [sprite('brick'), scale(2), solid(), brickFeature(), 'solid', 'brick'],
        any: (ch) => null,
    }
    addLevel(map, mapConfig)
    add([
        rect(MAP_WIDTH_PIXELS, MAP_HEIGHT_PIXELS, {noArea}),
        pos(0, GRID_PIXEL_SIZE),
        GREEN,
        layer('bg'),
    ])

    // Coins
    const coins = [
        ...findMapItems(map, '¢').map(coin=>add([sprite('coin', {animSpeed: 0.2, frame: 0}), pos(convertMapPosToCoord(coin)), area(vec2(4,4), vec2(28,28)), 'coin', 'coin-10'])),
        ...findMapItems(map, '$').map(coin=>add([sprite('coin', {animSpeed: 0.2, frame: 4}), pos(convertMapPosToCoord(coin)), area(vec2(4,4), vec2(28,28)), 'coin', 'coin-30'])),
        ...findMapItems(map, '£').map(coin=>add([sprite('coin', {animSpeed: 0.2, frame: 8}), pos(convertMapPosToCoord(coin)), area(vec2(4,4), vec2(28,28)), 'coin', 'coin-50'])),
    ]
    coins.forEach(coin=>{
        const coinAmts = ['coin-10', 'coin-30', 'coin-50']
        const which = coinAmts.find(tag=>coin.is(tag))
        coin.paused=true
        if( which ) coin.play(which)
    })

    // Enemies
    const enemies = [
        ...findMapItems(map, 'g').map(e=>add([sprite('goomba', {animSpeed: 0.5}), enemy(), scale(2), pos(convertMapPosToCoord(e)), area(vec2(2,2), vec2(14,14)), 'can-get-hurt', 'can-hurt-player', 'enemy'])),
    ]
    enemies.forEach(enemy=>{
        enemy.play('walk')
        enemy.paused=true
    })

    // Header/Score/Timer
    add([rect(MAP_WIDTH_PIXELS-1, GRID_PIXEL_SIZE-1, {noArea}), WHITE])
    add([rect(MAP_WIDTH_PIXELS-5, GRID_PIXEL_SIZE-5, {noArea}), pos(2, 2), BLUE])
    const timer = add([
        text("", 16, {noArea}),
        pos(12, 9),
        timerFeature(DEFAULT_GAME_TIME),
    ]);
    const score = add([
        text('', 16, {noArea}),
        pos(MAP_WIDTH_PIXELS-10, 9),
        origin('topright'),
    ])
    timer.on('hurry_up', ()=>{
        debug("Time's running out!")
        music.pause()
        play('hurryup')
        wait(3.3, ()=>{
            if( player.isAlive() ) {
                music.speed(MUSIC_HURRY_SPEED)
                music.detune(MUSIC_HURRY_DETUNE)
                music.play()
            }
        })
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
            debug("You better run, better run, faster than my bullet...")
            times.forEach(t=>{
                wait(t, bullet)
            })
        } else {
            debug("Gone fishin'...")
            times.forEach(t=>{
                wait(t, fish)
            })
        }
    })
    timer.on('time_up', ()=>{
        music.stop()
        go('timeup')
    })

    const startGame = () => {
        if( !timer.started() ) {
            timer.start()
            music = play('music-intro', {
                volume,
                detune: timer.isHurry() ? MUSIC_HURRY_DETUNE : 0, 
                speed: timer.isHurry() ? MUSIC_HURRY_SPEED : 1
            })
            Array(...coins, ...enemies).forEach(item=>item.paused=false)
            wait(2.4, ()=>{
                if( !music.paused() && player.isAlive() ) {
                    music = play('music', {
                        volume, 
                        loop: true, 
                        detune: timer.isHurry() ? MUSIC_HURRY_DETUNE : 0,
                        speed: timer.isHurry() ? MUSIC_HURRY_SPEED : 1
                    })
                }
            })
        }
    }

    // Player
    const {x: playerX, y: playerY} = convertMapPosToCoord(findMapItem(map, '1'))
    const player = add([
        sprite(choose(['bomberman-tiny', 'daisy', 'luigi', 'mario', 'peach', 'toad', 'wario'])),
        pos(playerX, playerY),
        scale(2),
        area(vec2(2,2), vec2(14,16)),
        canBomb(),
        canDie(),
        canScore(),
        canWalk(),
        'can-get-hurt',
        'player',
    ])
    player.action(() => {
        player.resolve()
    })
    player.on('died', ()=>{
        music.stop()
        timer.pause()
        wait(2, ()=>{
            go('lose')
        })
    })
    const updateHeaderScore = () => {
        score.text = `Score: ${player.getScore().toLocaleString()}`
    }
    updateHeaderScore()
    player.on('score_changed', updateHeaderScore)
    overlaps('bomb', 'player', (bomb, player)=>{
        if( bomb.solid ) player.kickBomb(bomb)
    })
    overlaps('explosion', 'can-get-hurt', (_, obj)=>{
        obj.die()
    })
    overlaps('can-hurt-player', 'player', (_, player)=>{
        player.die()
    })
    overlaps('coin', 'player', (coin, player)=>{
        play('coin')
        if( coin.is('coin-10') ) player.incScore(10)
        else if( coin.is('coin-30') ) player.incScore(30)
        else if( coin.is('coin-50') ) player.incScore(50)
        destroy(coin)
    })
    overlaps('powerup', 'player', (powerup, player)=>{
        play('powerup')
        player.bombPowerup(powerup.frame)
        player.walkPowerup(powerup.frame)
        timer.powerup(powerup.frame)
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
            // Find everything under the block. Kill players/enemies, remove bombs, just destroy everything else that is tagged
            getAtPos(b.targ).forEach(obj=>{
                if( obj.is("can-get-hurt") ) obj.die()
                else if( obj.is("bomb") ) obj.explode()
                else if( obj._tags.length ) destroy(obj)
            })
            // Finally, make the block solid so can't walk thru
            b.use(solid())
            b.use('block')
            b.use('solid')
        }
    })

    // Controls
    let lastSpaceTime=0
    let lastSpacePos=vec2(0, 0)
    // Space and Double-space for bombs and P-Bombs
    keyPress('space', ()=>{
        startGame()
        const t = time()
        const p = player.pos.clone()
        // If double-tap spacebar (within .3 sec) without moving, spawn P-Bomb
        if( t-lastSpaceTime<0.3 && p.eq(lastSpacePos) ) {
            player.spawnPBomb()
            lastSpaceTime=0
        } else {
            player.spawnBomb()
            lastSpaceTime=t
            lastSpacePos=p
        }
    })
    Object.entries(DIRS).forEach(([dir, vec])=>{
        keyDown(dir.toLowerCase(), ()=>{
            startGame()
            player.walk(vec)
        })
        keyRelease(dir, player.stop)
    })

    // Debugging
    k.debug.clearLog()
}