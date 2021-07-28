import k from './kaboom'
import {gameScene, loseScene, startScene} from './scenes'

const {
    loadSprite, scene, start,
} = k

loadSprite('bomberman', '../assets/bomberman.png')

scene('start', startScene)
scene('lose', loseScene)
scene('game', gameScene)

start('start')