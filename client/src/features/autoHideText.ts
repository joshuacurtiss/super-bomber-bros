import { k } from '../kaboom'

export default function(seconds: number) {
    let hideTime=0
    return {
        setText(text: string) {
            this.text = text
            if( text.length ) hideTime = k.time() + seconds
        },
        update() {
            if( ! hideTime ) return
            if( k.time()>hideTime ) {
                this.text=''
                hideTime=0
            }
        }
    }
}
