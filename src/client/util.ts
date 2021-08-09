import {k} from './kaboom'
import {Vec2} from 'kaboom'
import {GRID_PIXEL_SIZE} from './types'

const {get, vec2} = k

/**
 * Returns any game objects at a given position.
 * @param position Position to check.
 * @param tag Only get objects of this tag.
 */
function getAtPos(position:Vec2, tag?:string) {
    const {x, y} = position
    const objects = get(tag)
    return objects.filter(obj=>{
        if( !obj.pos ) return false
        return x>=obj.pos.x && x<=obj.pos.x+obj.width && y>=obj.pos.y && y<=obj.pos.y+obj.height
    })
}

/**
 * Returns map positions of a given item.
 * @param map The map to search.
 * @param item The item to search for.
 */
function findMapItems(map: string[], item: string): Vec2[] {
    const out: Vec2[] = []
    map.forEach((row, y)=>{
        let x = -1
        do {
            x = row.indexOf(item, x+1)
            if( x>=0 ) out.push(vec2(x, y))
        } while( x>=0 );
    })
    return out
}

/**
 * Returns the first map position of a given item.
 * @param map The map to search.
 * @param item The item to search for.
 */
function findMapItem(map: string[], item: string): Vec2 | undefined {
    const found = findMapItems(map, item)
    return found.length ? found[0] : undefined
}

/**
 * Converts a map position to coordinates on the screen.
 * @param pos Map position.
 */
function convertMapPosToCoord(pos:Vec2): Vec2 {
    const {x, y} = pos
    // Multiplies by grid pixel size, and adds row for top header
    return vec2(x*GRID_PIXEL_SIZE, (y+1)*GRID_PIXEL_SIZE)
}

/**
 * Receives a position and returns that position snapped to the grid.
 * @param pos Position to adjust.
 */
 function snapToGrid(pos:Vec2) {
    let {x, y} = pos
    let modX = x % GRID_PIXEL_SIZE
    let modY = y % GRID_PIXEL_SIZE
    return vec2(
        Math.round(x - modX + (modX<=GRID_PIXEL_SIZE/2 ? 0 : GRID_PIXEL_SIZE)),
        Math.round(y - modY + (modY<=GRID_PIXEL_SIZE/2 ? 0 : GRID_PIXEL_SIZE))
    )
}

export {
    convertMapPosToCoord,
    findMapItems,
    findMapItem,
    getAtPos,
    snapToGrid,
}