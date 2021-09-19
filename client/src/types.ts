import k from './kaboom'

const { color, vec2 } = k

export const GRID_PIXEL_SIZE = 32
export const MAP_WIDTH = 15
export const MAP_WIDTH_PIXELS = MAP_WIDTH * GRID_PIXEL_SIZE
export const MAP_HEIGHT = 13
export const MAP_HEIGHT_PIXELS = MAP_HEIGHT * GRID_PIXEL_SIZE

export const GRAVITY = 300
export const HEAVY_GRAVITY = 1600

export const DEFAULT_GAME_TIME = 180

export const WHITE = color(1, 1, 1)
export const BLACK = color(0, 0, 0)
export const BLUE = color(0.39, 0.47, 0.937)
export const GREEN = color(0.223, 0.517, 0)
export const YELLOW = color(1, 1, 0)

export const COLORS = {WHITE, BLUE, GREEN}

export const IDLE = vec2(0, 0)
export const LEFT = vec2(-1, 0)
export const RIGHT = vec2(1, 0)
export const UP = vec2(0, -1)
export const DOWN = vec2(0, 1)

export const DIRS = {IDLE, LEFT, RIGHT, UP, DOWN}

export const BOMB_SPEED = 175
export const WALK_SPEED = 120
export const ENEMY_SPEED = 60

export const MUSIC_HURRY_SPEED = 1.5
export const MUSIC_HURRY_DETUNE = -600

export enum LOCALSTORAGE_KEYS {
    SFX_VOL = 'sfx_vol',
    MUS_VOL = 'mus_vol',
}
export const DEFAULT_VOL = '50'

export const POWERUPS: Record<string, number> = {
    RADIUS: 0,
    QUANTITY: 2,
    SPEED: 3,
    KICK: 4,
    // BRICK_SHIFT: 7,
    // SKULL: 12,
    // HEART: 13,
    TIME: 14,
    P_BOMB: 15,
}
