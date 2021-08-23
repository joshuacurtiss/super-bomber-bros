export default function(score = 0) {
    return {
        getScore() {
            return score
        },
        decScore(amt) {
            score-=amt
            this.trigger('score_changed')
        },
        incScore(amt) {
            score+=amt
            this.trigger('score_changed')
        },
    }
}
