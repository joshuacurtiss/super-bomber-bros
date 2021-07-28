import k from './kaboom'
import {gameScene, loseScene, startScene} from './scenes'

const {
    loadSprite, scene, start,
} = k

loadSprite('bomberman', 'assets/bomberman.png')
loadSprite('title-bomberman', 'assets/title-bomberman.png')
loadSprite('title-mario', 'assets/title-mario.png')

scene('start', startScene)
scene('lose', loseScene)
scene('game', gameScene)

start('start')