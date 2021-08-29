import k from './kaboom'
import {gameScene, loseScene, startScene, timeupScene} from './scenes'

const {
    loadSound, loadSprite, scene, start,
} = k

// Characters
for( const name of ['bomberman-tiny', 'daisy', 'luigi', 'mario', 'peach', 'toad', 'wario'] ) {
    loadSprite(name, `assets/characters/${name}.png`)
}

// SFX
loadSound('coin', 'assets/sfx/smw2_coin.ogg')
loadSound('hurryup', 'assets/sfx/smb3_hurry_up.ogg')
loadSound('die', 'assets/sfx/smb3_player_down.ogg')
loadSound('bullet', 'assets/sfx/smb3_thwomp.ogg')
loadSound('breakbrick', 'assets/sfx/smw_break_block.ogg')
loadSound('laybomb', 'assets/sfx/smw_fireball.ogg')
loadSound('powerupappears', 'assets/sfx/smw_power-up_appears.ogg')
loadSound('powerup', 'assets/sfx/smw_power-up.ogg')
loadSound('explosion', 'assets/sfx/smw2_explosion.ogg')
loadSound('thud', 'assets/sfx/smw_thud.ogg')

// Map
loadSprite('gameover', 'assets/title/gameover.png')
loadSprite('block', 'assets/map/block.png')
loadSprite('brick', 'assets/map/brick.png', {gridWidth: 16, gridHeight: 16, anims: {explode: {from: 1, to: 6}}})
loadSprite('bomb', 'assets/map/bomb.png', {gridWidth: 16, gridHeight: 16, anims: {bomb: {from: 0, to: 3}}})
loadSprite('bullet', 'assets/enemies/bullet.png')
loadSprite('coin', 'assets/map/coin.png', {
    gridWidth: 32,
    gridHeight: 32,
    anims: {
        'coin-10': {from:0, to: 3},
        'coin-30': {from:4, to: 7},
        'coin-50': {from:8, to: 11},
    },
})
loadSprite('explosion', 'assets/map/explosion.png', {
    gridWidth: 48,
    gridHeight: 48,
    anims: {
        'explode-origin': {from:0, to: 6},
        'explode-mid': {from:7, to: 13},
        'explode-end': {from:14, to: 20},
    },
})
loadSprite('fish', 'assets/enemies/fish.png', {gridWidth: 21, gridHeight: 18, anims: {fish: {from: 0, to: 1}}})
loadSprite('goomba', 'assets/enemies/goomba.png', {gridWidth: 16, gridHeight: 16, anims: {walk: {from: 0, to: 1}}})
loadSprite('powerups', 'assets/map/powerups.png', {gridWidth: 16, gridHeight: 16})

// Scenes
scene('start', startScene)
scene('lose', loseScene)
scene('game', gameScene)
scene('timeup', timeupScene)

start('start')