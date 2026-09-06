import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'
import { brand, foregroundSvg, markSvg, maskableSvg, monoSvg, ogSvg } from '../brand/mark'

const root = process.cwd()
const publicDir = join(root, 'public')
const iconsDir = join(publicDir, 'icons')
const storeDir = join(root, 'brand', 'store')
const androidRes = join(root, 'android', 'app', 'src', 'main', 'res')

const raster = (svg: string, size: number) =>
  sharp(Buffer.from(svg)).resize(size, size, { fit: 'contain' }).png({ compressionLevel: 9 }).toBuffer()

function put(dir: string, file: string, data: Buffer | string) {
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, file), data)
}

function ico(images: { size: number; png: Buffer }[]) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(images.length, 4)
  let offset = 6 + images.length * 16
  const entries: Buffer[] = []
  for (const image of images) {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(image.size >= 256 ? 0 : image.size, 0)
    entry.writeUInt8(image.size >= 256 ? 0 : image.size, 1)
    entry.writeUInt16LE(1, 4)
    entry.writeUInt16LE(32, 6)
    entry.writeUInt32LE(image.png.length, 8)
    entry.writeUInt32LE(offset, 12)
    offset += image.png.length
    entries.push(entry)
  }
  return Buffer.concat([header, ...entries, ...images.map((image) => image.png)])
}

const webSizes = [64, 128, 192, 256, 384, 512, 1024]
const appleSizes = [120, 152, 167, 180]
const densities: [string, number][] = [
  ['mdpi', 48],
  ['hdpi', 72],
  ['xhdpi', 96],
  ['xxhdpi', 144],
  ['xxxhdpi', 192],
]

async function roundIcon(size: number) {
  const square = await raster(maskableSvg(1024), size)
  const circle = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`,
  )
  return sharp(square)
    .composite([{ input: circle, blend: 'dest-in' }])
    .png({ compressionLevel: 9 })
    .toBuffer()
}

async function run() {
  put(publicDir, 'icon.svg', markSvg(512))
  put(publicDir, 'maskable.svg', maskableSvg(512))
  put(join(root, 'brand'), 'mark.svg', markSvg(512))
  put(join(root, 'brand'), 'mark-mono.svg', monoSvg(512))

  for (const size of webSizes) put(iconsDir, `icon-${size}.png`, await raster(markSvg(1024), size))
  for (const size of [192, 384, 512, 1024])
    put(iconsDir, `maskable-${size}.png`, await raster(maskableSvg(1024), size))
  for (const size of appleSizes)
    put(iconsDir, `apple-touch-icon-${size}.png`, await raster(maskableSvg(1024), size))

  put(publicDir, 'apple-touch-icon.png', await raster(maskableSvg(1024), 180))
  put(publicDir, 'og.png', await sharp(Buffer.from(ogSvg())).png({ compressionLevel: 9 }).toBuffer())

  const icoSizes = [16, 32, 48, 64]
  put(
    publicDir,
    'favicon.ico',
    ico(await Promise.all(icoSizes.map(async (size) => ({ size, png: await raster(markSvg(1024), size) })))),
  )

  put(storeDir, 'play-icon-512.png', await raster(maskableSvg(1024), 512))
  put(
    storeDir,
    'play-feature-1024x500.png',
    await sharp(Buffer.from(ogSvg(1024, 500))).png({ compressionLevel: 9 }).toBuffer(),
  )

  if (!existsSync(androidRes)) {
    console.log('ícones web gerados; android/ ainda não existe, pule ou rode npx cap add android')
    return
  }

  for (const [density, size] of densities) {
    const dir = join(androidRes, `mipmap-${density}`)
    put(dir, 'ic_launcher.png', await raster(markSvg(1024), size))
    put(dir, 'ic_launcher_round.png', await roundIcon(size))
    put(dir, 'ic_launcher_foreground.png', await raster(foregroundSvg(1024), Math.round(size * 2.25)))
  }

  const adaptive = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background" />
    <foreground android:drawable="@mipmap/ic_launcher_foreground" />
    <monochrome android:drawable="@mipmap/ic_launcher_foreground" />
</adaptive-icon>
`
  put(join(androidRes, 'mipmap-anydpi-v26'), 'ic_launcher.xml', adaptive)
  put(join(androidRes, 'mipmap-anydpi-v26'), 'ic_launcher_round.xml', adaptive)
  put(
    join(androidRes, 'values'),
    'ic_launcher_background.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">${brand.bg}</color>
</resources>
`,
  )
  put(
    join(androidRes, 'values'),
    'colors.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="colorPrimary">${brand.bg}</color>
    <color name="colorPrimaryDark">${brand.bgBottom}</color>
    <color name="colorAccent">${brand.accent}</color>
</resources>
`,
  )

  for (const [density, size] of [
    ['mdpi', 320],
    ['hdpi', 480],
    ['xhdpi', 640],
    ['xxhdpi', 960],
    ['xxxhdpi', 1280],
  ] as [string, number][]) {
    put(join(androidRes, `drawable-${density}`), 'splash.png', await raster(maskableSvg(1024), size))
  }
  put(join(androidRes, 'drawable'), 'splash.png', await raster(maskableSvg(1024), 640))

  console.log('ícones gerados: web, favicon, apple touch, loja e mipmaps android')
}

run().catch((error: Error) => {
  console.error(error.message)
  process.exit(1)
})
