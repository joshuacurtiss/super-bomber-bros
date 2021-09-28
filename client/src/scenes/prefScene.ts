import k from '../kaboom'
import {LOCALSTORAGE_KEYS, WHITE, YELLOW} from '../types'
import slider from '../features/slider'

const {SFX_VOL, MUS_VOL} = LOCALSTORAGE_KEYS

export default function () {
    const {
        add, color, go, keyPress, origin, pos, play, rect, sprite, text, width, height
    } = k
    const VOL_DELTA_AMT = 5
    const keys = [SFX_VOL, MUS_VOL]
    const music = play('menu-2', {loop: true})
    music.pause()
    let menuIndex = 0
    // Title
    add([
        text("Preferences", 18),
        color(WHITE),
        origin('center'),
        pos(width()*0.5, height()*0.15 )
    ])
    // Icons
    const icons = [
        add([
            sprite('audio-speaker'),
            pos(width()*0.25, height()*0.3),
        ]),
        add([
            sprite('music-note'),
            pos(width()*0.25, height()*0.45),
        ])
    ]
    // Menu sliders, which are based on y pos of icons
    const menu = icons.map((item, idx)=>add([
        rect(width()*0.32, 16),
        pos(width()*0.35, item.pos.y + 8),
        slider(parseInt(localStorage.getItem(keys[idx]) ?? '50'), {valueSuffix: "%"}),
    ]))
    // Finally, add a "Back to main menu" menu option
    menu.push(add([
        text("Back to main menu", 12),
        origin('center'),
        pos(width()*0.5, height()*0.7 ),
        color(WHITE),
    ]))
    const changeMenuIndex = (index:number) => {
        if( index<0 ) index=0
        if( index>menu.length-1 ) index=menu.length-1
        menu[menuIndex].color = WHITE
        menu[index].color = YELLOW
        menuIndex = index
    }
    const changeLevel = (index:number, delta:number) => {
        if( index>=menu.length-1 ) return
        menu[index].inc(delta);
        const newval = menu[index].getValue()
        localStorage.setItem(keys[index], newval.toString())
        if( keys[index]===MUS_VOL ) music.volume(newval / 100)
        if( !delta ) return
        if( keys[index]===SFX_VOL ) play('laybomb', {volume: newval / 100})
    }
    const mainAction = () => {
        if( menuIndex===menu.length-1 ) {
            music.stop()
            go('mainMenu', 2)
        }
    }
    keyPress('up', ()=>changeMenuIndex(menuIndex-1))
    keyPress('down', ()=>changeMenuIndex(menuIndex+1))
    keyPress('left', ()=>changeLevel(menuIndex, -VOL_DELTA_AMT))
    keyPress('right', ()=>changeLevel(menuIndex, VOL_DELTA_AMT))
    keyPress('space', mainAction)
    keyPress('enter', mainAction)
    keyPress('escape', mainAction)
    // Init
    changeMenuIndex(menuIndex)
    Array(0, 1).forEach(index=>changeLevel(index, 0))
    music.play()
}