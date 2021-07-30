import {k} from './kaboom'
import {Vec2} from 'kaboom'

const {get} = k

/**
 * Returns any game objects at a given position.
 * @param position Position to check.
 * @param tag Only get objects of this tag.
 */
function getAtPos(position:Vec2, tag?:string) {
    const {x, y} = position
    const objects = get(tag)
    return objects.filter(obj=>x>=obj.pos.x && x<=obj.pos.x+obj.width && y>=obj.pos.y && y<=obj.pos.y+obj.height)
}

export {
     getAtPos,
 }