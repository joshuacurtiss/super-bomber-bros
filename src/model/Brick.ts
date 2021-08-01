import k from '../kaboom'

const {
    add,
    destroy,
    pos,
    scale,
    sprite,
    wait,
} = k

export default function() {
    return {
        explode() {
            destroy(this)
            const explodingBrick = add([
                sprite('brick'),
                scale(2),
                pos(this.pos),
            ])
            explodingBrick.play('explode')
            wait(0.5, ()=>destroy(explodingBrick))
        }
    }
}
