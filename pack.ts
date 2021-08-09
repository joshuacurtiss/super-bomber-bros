import * as fs from 'fs'
import * as path from 'path'
import ffmpeg from 'fluent-ffmpeg'

function findAudio(dir: string): string[] {
    const exts = ['.mp3', '.ogg', '.flac', '.m4a', '.wav']
    const files: string[] = []
    fs.readdirSync(dir).forEach(filename=>{
        const fullPath = path.resolve(dir, filename)
        const stat = fs.statSync(fullPath)
        if( stat && stat.isDirectory() ) files.push(...findAudio(fullPath))
        else if( stat && stat.isFile() && exts.includes(path.extname(filename).toLowerCase()) ) files.push(fullPath)
    })
    return files
}
function convertAudio(files: string[]) {
    files.forEach(fullpath=>{
        const ext = path.extname(fullpath)
        const name = path.basename(fullpath, ext)
        ffmpeg(fullpath)
            .output(path.resolve('static', 'assets', 'sfx', name + '.ogg'))
            // .on('end', ()=>{
                // fs.copyFileSync(fullpath, path.resolve('public', 'media', name + ext))
            // })
            .run()
    })
}
const sfx: string[] = findAudio(path.resolve(__dirname, 'resources', 'sfx'))
convertAudio(sfx)
