import k from './kaboom'
import {gameScene, loseScene, startScene} from './scenes'

const {
    loadSprite, scene, start,
} = k

// Title
loadSprite('title-bomberman', 'assets/title/title-bomberman.png')
loadSprite('title-mario', 'assets/title/title-mario.png')

// Characters
loadSprite('bomberman', 'assets/characters/bomberman.png')

// Map
loadSprite('block', 'assets/map/block.png')
loadSprite('brick', 'assets/map/brick.png')
loadSprite('brick-explode', 'assets/map/brick-explode.png', {gridWidth: 16, gridHeight: 16, anims: {explode: {from: 0, to: 5}}})
loadSprite('bomb', 'assets/map/bomb.png', {gridWidth: 16, gridHeight: 16, anims: {bomb: {from: 0, to: 3}}})
loadSprite('explosion', 'assets/map/explosion.png', {
    gridWidth: 48,
    gridHeight: 48,
    anims: {
        'explode-origin': {from:0, to: 6},
        'explode-mid': {from:7, to: 13},
        'explode-end': {from:14, to: 20},
    },
})

// Scenes
scene('start', startScene)
scene('lose', loseScene)
scene('game', gameScene)

start('start')