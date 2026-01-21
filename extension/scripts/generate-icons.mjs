import sharp from 'sharp'
import { mkdir } from 'fs/promises'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const assetsDir = join(__dirname, '..', 'assets')

const svg = `<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="128" rx="28" fill="#8B5CF6"/>
  <path d="M64 28V100M84 42H52C42.059 42 34 50.059 34 60C34 69.941 42.059 78 52 78H76C85.941 78 94 86.059 94 96C94 105.941 85.941 114 76 114H44" stroke="white" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const sizes = [16, 32, 48, 64, 128]

async function generateIcons() {
  await mkdir(assetsDir, { recursive: true })

  for (const size of sizes) {
    await sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toFile(join(assetsDir, `icon${size}.png`))

    console.log(`Generated icon${size}.png`)
  }

  console.log('All icons generated!')
}

generateIcons().catch(console.error)
