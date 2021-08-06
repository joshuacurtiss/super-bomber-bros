import k from './kaboom'
import {gameScene, loseScene, startScene} from './scenes'

const {
    loadSound, loadSprite, scene, start,
} = k

// Title
loadSprite('title-bomberman', 'assets/title/title-bomberman.png')
loadSprite('title-mario', 'assets/title/title-mario.png')

// Characters
loadSprite('bomberman', 'assets/characters/bomberman.png')

// SFX
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
loadSprite('block', 'assets/map/block.png')
loadSprite('brick', 'assets/map/brick.png', {gridWidth: 16, gridHeight: 16, anims: {explode: {from: 1, to: 6}}})
loadSprite('bomb', 'assets/map/bomb.png', {gridWidth: 16, gridHeight: 16, anims: {bomb: {from: 0, to: 3}}})
loadSprite('bullet', 'assets/enemies/bullet.png')
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
loadSprite('powerups', 'assets/map/powerups.png', {gridWidth: 16, gridHeight: 16})

// Scenes
scene('start', startScene)
scene('lose', loseScene)
scene('game', gameScene)

start('start')