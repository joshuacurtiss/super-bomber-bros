import { Color } from 'kaboom'
import { k } from '../kaboom'

const {
    add,
    charInput,
    color,
    destroy,
    keyIsDown,
    keyPress,
    pos,
    text,
    time,
    rgb,
} = k

interface ITextboxOpts {
    fontColor?: Color;
    backgroundColor?: Color;
    focusColor?: Color;
    maxChars?: number;
}

const defaults: ITextboxOpts = {
    fontColor: rgb(1, 1, 1),
    backgroundColor: rgb(0.25, 0.25, 0.25),
    focusColor: rgb(0.5, 0.5, 0.5),
    maxChars: 100,
}

export default function(
    str: string = "", 
    fontSize: number = 12, 
    options: ITextboxOpts = {}
) {
    const opts = Object.assign(defaults, options)
    let textField
    let focused=false
    let showCursor=false
    return {
        keyPress: key=>{
            if( !focused ) return
            if( key==='backspace' ) {
                str = str.slice(0, -1)
            } else if( str.length<opts.maxChars ) {
                if( keyIsDown('shift') ) key = key.toUpperCase()
                str += key
            }
            textField.text = str + (showCursor && str.length<opts.maxChars ? '_' : '')
        },
        getText: ()=>str,
        setText: newval=>{
            str=newval
            textField.text=newval + (showCursor && str.length<opts.maxChars ? '_' : '')
        },
        isFocused: ()=>focused,
        blur() {
            focused = false
            this.color = opts.backgroundColor
        },
        focus() {
            focused = true
            this.color = opts.focusColor
        },
        add() {
            this.use(color(opts.backgroundColor))
            keyPress('backspace', ()=>this.keyPress('backspace'))
            charInput(ch=>this.keyPress(ch))        
            textField = add([
                text(str, fontSize, {width: this.width-6, noArea: false}),
                pos(this.pos.add(4, 6)),
                color(opts.fontColor),
            ])        
        },
        update() {
            if( !focused && !showCursor ) return
            const newval = !focused ? false : time() % 1 > 0.5
            if( showCursor===newval ) return
            showCursor=newval
            textField.text = str + (showCursor && str.length<opts.maxChars ? '_' : '')
        },
        destroy() {
            destroy(textField)
        }
    }
}