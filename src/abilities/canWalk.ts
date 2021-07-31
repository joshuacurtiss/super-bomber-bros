function canWalk(speed: number = 120) {
    return {
        walk(x: number, y: number) {
            this.move(x*speed, y*speed)
        },
    }
}

export default canWalk