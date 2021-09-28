import {k} from '../kaboom'

function blowup() {
    return {
        update() {
            this.scale = Math.abs(Math.sin(k.time()) * 1.5)+1.5
        },
    }
}

export default function () {
    k.add([
        k.sprite('title-super', {noArea: true}),
        k.pos(k.width()*0.5, k.height()*0.25),
        k.scale(1.8),
        blowup(),
        k.origin('center')
    ])
    k.add([
        k.sprite('title-bomber', {noArea: true}),
        k.pos(k.width()*0.5 - 60, k.height()*0.4),
        k.scale(1.15),
        k.origin('center')
    ])
    k.add([
        k.sprite('title-bros', {noArea: true}),
        k.pos(k.width()*0.5 + 120, k.height()*0.4),
        k.scale(1.5),
        k.origin('center')
    ])
}