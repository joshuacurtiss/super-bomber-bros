import kaboom from 'kaboom'

const k=kaboom({
    clearColor: [0, 0, 0, 1],
    fullscreen: true,
})

k.scene('start', ()=>{
    k.add([
        k.text("Hello world!", 32),
        k.color(1, 1, 1, 1),
        k.origin('center'),
        k.pos(k.width()*0.5, k.height()*0.4)
    ])

})

k.start('start')