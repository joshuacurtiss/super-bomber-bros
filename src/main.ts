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
loadSprite('brick-explode', 'assets/map/brick-explode.png')
loadSprite('space', 'assets/map/space.png')

// Scenes
scene('start', startScene)
scene('lose', loseScene)
scene('game', gameScene)

start('start')