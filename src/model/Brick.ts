import k from '../kaboom'

const {
    add,
    destroy,
    pos,
    scale,
    sprite,
    wait,
} = k

function brick() {
    return {
        explode() {
            destroy(this)
            const explodingBrick = add([
                sprite('brick-explode'),
                scale(2),
                pos(this.pos),
                'brick',
            ])
            explodingBrick.play('explode')
            wait(0.5, ()=>destroy(explodingBrick))
        }
    }
}

export default brick