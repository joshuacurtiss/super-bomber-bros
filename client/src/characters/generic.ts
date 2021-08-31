import { k } from '../kaboom'

const {area, scale, vec2} = k

export default function() {
    return {
        add() {
            this.use(scale(2))
            this.use(area(vec2(2,2), vec2(14,16)))
        }
    }
}
