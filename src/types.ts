import k from './kaboom'

const { color } = k

export const GRID_PIXEL_SIZE = 32
export const MAP_WIDTH = 15
export const MAP_WIDTH_PIXELS = MAP_WIDTH * GRID_PIXEL_SIZE
export const MAP_HEIGHT = 13
export const MAP_HEIGHT_PIXELS = MAP_HEIGHT * GRID_PIXEL_SIZE

export const WHITE = color(1, 1, 1)
export const BLUE = color(0.39, 0.47, 0.937)
export const GREEN = color(0.223, 0.517, 0)

export const WALK_SPEED = 120
export const POWERUPS: Record<string, number> = {
    RADIUS: 0,
    QUANTITY: 2,
    SPEED: 3,
    // KICK: 4,
    // BRICK_SHIFT: 7,
    // SKULL: 12,
    // HEART: 13,
    TIME: 14,
    // P_BOMB: 15,
}
