import { k } from '../kaboom'

const {area, scale, vec2} = k

export default function() {
    return {
        add() {
            this.use(scale(1.15))
            this.use(area(vec2(5,2), vec2(21,27)))
        }
    }
}
