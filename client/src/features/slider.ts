import { Color, GameObj } from 'kaboom'
import { k } from '../kaboom'

const {
    add,
    color,
    destroy,
    origin,
    pos,
    rect,
    rgb,
    text,
} = k

interface ISliderOpts {
    border?: number;
    fontColor?: Color;
    fontSize?: number;
    showValue?: boolean;
    valuePrefix?: string;
    valueSuffix?: string;
    color?: Color;
    focusColor?: Color;
    min?: number;
    max?: number;
}

const defaults: ISliderOpts = {
    border: 2,
    fontColor: rgb(1, 1, 1),
    fontSize: 12,
    showValue: true,
    color: rgb(1, 1, 1),
    focusColor: rgb(1, 1, 0),
    min: 0,
    max: 100,
}

export default function(
    value: number = 0, 
    options: ISliderOpts = {}
) {
    const opts = Object.assign(defaults, options)
    let levelRect: GameObj
    let levelText: GameObj
    return {
        inc(delta: number) {
            this.setValue(value+delta)
        },
        getValue: ()=>value,
        setValue(newval: number) {
            if( newval<opts.min ) newval=opts.min
            if( newval>opts.max ) newval=opts.max
            value=newval
            this.updateUI()
        },
        updateUI() {
            if( levelText ) levelText.text = (opts.valuePrefix ?? '') + value.toLocaleString() + (opts.valueSuffix ?? '')
            levelRect.width = (this.width-opts.border*2) * (opts.max-value) / opts.max
        },
        add() {
            this.use(color(opts.color))
            if( opts.showValue ) levelText = add([
                text('', opts.fontSize),
                origin('left'),
                pos(this.pos.x+this.width+20, this.pos.y+this.height/2),
                color(opts.fontColor),        
            ])
            levelRect = add([
                rect(0, this.height-opts.border*2),
                pos(this.pos.x+this.width-opts.border, this.pos.y + opts.border),
                origin('topright'),
                color(0, 0, 0),
            ])
        },
        destroy() {
            destroy(levelRect)
            destroy(levelText)
        }
    }
}