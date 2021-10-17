import * as fs from 'fs'
import * as path from 'path'
import ffmpeg from 'fluent-ffmpeg'
import texturePacker from 'free-tex-packer-core'

interface Img {
    path: string;
    contents: Buffer;
}

interface KSpriteAtlas {
    x: number;
    y: number;
    width: number;
    height: number;
}

function findAudio(dir: string): string[] {
    const exts = ['.mp3', '.ogg', '.flac', '.m4a', '.wav']
    const files: string[] = []
    fs.readdirSync(dir).forEach(filename=>{
        const fullPath = path.resolve(dir, filename)
        const stat = fs.statSync(fullPath)
        if( !stat ) return
        if( stat.isDirectory() ) files.push(...findAudio(fullPath))
        else if( stat.isFile() && exts.includes(path.extname(filename).toLowerCase()) ) files.push(fullPath)
    })
    return files
}
function convertAudio(files: string[], dest: string) {
    files.forEach(fullpath=>{
        const ext = path.extname(fullpath)
        const name = path.basename(fullpath, ext)
        ffmpeg(fullpath)
            .output(path.resolve(dest, name + '.ogg'))
            .run()
    })
}
function findImages(dir: string): string[] {
    const images: string[] = []
    fs.readdirSync(dir).forEach(filename=>{
        const fullPath = path.resolve(dir, filename)
        const stat = fs.statSync(fullPath)
        if( !stat ) return
        if( stat.isDirectory() ) images.push(...findImages(fullPath))
        else if( stat.isFile() && path.extname(filename).toLowerCase()==='.png' ) images.push(fullPath)
    })
    return images
}
function packImages(images: Img[], textureName: string) {
    texturePacker(images, {
        textureName,
        allowRotation: false,
        detectIdentical: false,
        allowTrim: false,
        removeFileExtension: true,
    }, (files, error) => {
        if (error) {
            console.error("ERROR:", error);
        } else {
            for (const item of files) {
                if (item.name === textureName + ".json") {
                    const data = JSON.parse(item.buffer.toString())
                    const kdata: Record<string, KSpriteAtlas> = {}
                    for (const name in data.frames) {
                        const frame = data.frames[name].frame
                        kdata[name] = {
                            x: frame.x,
                            y: frame.y,
                            width: frame.w,
                            height: frame.h,
                        }
                    }
                    fs.writeFileSync(path.resolve(__dirname, 'static', 'assets', 'images', textureName + ".json"), JSON.stringify(kdata))
                } else {
                    fs.writeFileSync(path.resolve(__dirname, 'static', 'assets', 'images', item.name), item.buffer)
                }
            }
        }
    })
}
convertAudio(findAudio(path.resolve('resources', 'music')), path.resolve('static', 'assets', 'music'))
convertAudio(findAudio(path.resolve('resources', 'sfx')), path.resolve('static', 'assets', 'sfx'))
packImages(findImages(path.resolve(__dirname, 'resources', 'images', 'characters')).map(fullPath=>{
    return {
        path: path.basename(fullPath),
        contents: fs.readFileSync(fullPath),
    } as Img
}), 'characters')