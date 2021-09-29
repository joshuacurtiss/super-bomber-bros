import { Color, GameObj } from 'kaboom'
import { k } from '../kaboom'

const {
    add,
    color,
    destroy,
    keyPress,
    origin,
    pos,
    text,
    readd,
    rect,
    rgba,
} = k

interface ISelectOpts {
    blurOnSelect?: boolean;
    checkboxSprite?: string;
    checkboxCheckedSprite?: string;
    emptyMessage?: string;
    fontColor?: Color;
    fontSize?: number;
    backgroundColor?: Color;
    focusColor?: Color;
    highlightColor?: Color;
    maxRows?: number;
    multiple?: boolean;
    padding?: number;
}

export interface ISelectRow {
    label: string;
    value: string;
    selected?: boolean;
}

const defaults: ISelectOpts = {
    blurOnSelect: false,
    emptyMessage: "No Data",
    fontColor: rgba(1, 1, 1, 1),
    fontSize: 12,
    backgroundColor: rgba(0.25, 0.25, 0.25, 1),
    focusColor: rgba(0.4, 0.4, 0.4, 1),
    highlightColor: rgba(0.1, 0.1, 0.1, 0.5),
    maxRows: 4,
    multiple: true,
    padding: 8,
}

function selected(selected: boolean = false, checkboxSprite?: string, checkboxCheckedSprite?: string) {
    let checkbox
    return {
        add() {
            if( checkboxSprite && checkboxCheckedSprite ) checkbox = add([
                k.sprite(selected ? checkboxCheckedSprite : checkboxSprite),
                k.pos(this.pos.sub(20, 2)),
                k.scale(0.5),
            ])
        },
        updateUI() {
            readd(this)
            if( checkbox ) readd(checkbox)
        },
        setSelected: (newval: boolean)=>{
            selected=newval
            if( checkboxSprite && checkboxCheckedSprite ) checkbox.changeSprite(selected ? checkboxCheckedSprite : checkboxSprite)
        },
        toggleSelected() {
            this.setSelected(!selected)
        },
        getSelected: ()=>selected,
        destroy() {
            if( checkbox ) destroy(checkbox)
        }
    }
}

function value(value: string = "") {
    return {
        setValue: (newval: string)=>value=newval,
        getValue: ()=>value
    }
}

export default function(
    data: ISelectRow[] = [], 
    options: ISelectOpts = {}
) {
    const opts = Object.assign(defaults, options)
    let emptyMessageLabel
    let index = data.length ? 0 : -1
    let focused = false
    let rowLabels: GameObj[] = []
    let selectedRect
    return {
        setData(newval: ISelectRow[]) {
            rowLabels.forEach(row=>row ? destroy(row) : 0)
            rowLabels = newval.map((newrow: ISelectRow, idx: number)=>{
                if( idx+1>opts.maxRows ) return
                return add([
                    text(newrow.label, opts.fontSize, {noArea: false, width: this.width-opts.padding*2-16}),
                    color(opts.fontColor),
                    pos(this.pos.add(opts.padding + 20, opts.padding + idx*(opts.fontSize+opts.padding))),
                    selected(!!newrow.selected, opts.checkboxSprite, opts.checkboxCheckedSprite),
                    value(newrow.value),
                ])
            })
            data = newval
            emptyMessageLabel.text = data.length ? '' : opts.emptyMessage
            if( index>newval.length-1 ) index=newval.length-1
            this.updateUI()
        },
        getData(): ISelectRow[] {
            return rowLabels.map(row=>{
                return {
                    label: row.text,
                    value: row.getValue(),
                    selected: row.getSelected(),
                } as ISelectRow
            })
        },
        getSelected() {
            return this.getData().filter(row=>row.selected)
        },
        getIndex: ()=>index,
        setIndex(newval: number) {
            if( newval<0 ) newval=0
            if( newval>data.length-1 ) newval=data.length-1
            if( newval>opts.maxRows-1 ) newval=opts.maxRows-1
            index = newval
            this.updateUI()
        },
        isFocused: ()=>focused,
        blur() {
            focused = false
            this.color = opts.backgroundColor
            destroy(selectedRect)
            selectedRect = null
            this.updateUI()
        },
        focus() {
            focused = true
            this.color = opts.focusColor
            selectedRect = add([
                rect(this.width-opts.padding, opts.fontSize+opts.padding, {noArea: true}),
                color(opts.highlightColor),
                pos(this.pos.x+this.area.p1.x+opts.padding/2, 0),
            ])
            if( index<0 && rowLabels.length>0 ) index=0
            this.updateUI()
        },
        updateUI() {
            if( ! selectedRect ) return
            if( index>=0 && index<rowLabels.length && focused ) {
                selectedRect.color=opts.highlightColor
                selectedRect.pos.y=rowLabels[index].pos.y-opts.padding/2
                rowLabels[index].updateUI()
            } else {
                selectedRect.color=rgba(0,0,0,0)
            }
        },
        add() {
            emptyMessageLabel = add([
                text('', opts.fontSize, {noArea: true}),
                color(opts.highlightColor),
                pos(this.pos.add(this.area.p1.add(this.area.p2).scale(0.5))),
                origin('center'),
            ])
            this.use(color(opts.backgroundColor))
            this.setData(data)
            keyPress('space', ()=>{
                if( !this.isFocused() ) return
                if( !opts.multiple ) rowLabels.forEach((row, idx)=>idx!==index && row ? row.setSelected(false) : 0)
                rowLabels[index]?.toggleSelected()
                if( rowLabels[index]?.getSelected() && opts.blurOnSelect ) this.blur()
            })
            keyPress('up', ()=>{
                if( this.isFocused() ) this.setIndex(this.getIndex()-1)
            })
            keyPress('down', ()=>{
                if( this.isFocused() ) this.setIndex(this.getIndex()+1)
            })
        },
        destroy() {
            destroy(emptyMessageLabel)
            rowLabels.forEach(row=>destroy(row))
        }
    }
}