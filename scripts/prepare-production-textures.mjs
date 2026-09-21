import { access, cp, mkdir, writeFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

const basisSource = resolve('node_modules/three/examples/jsm/libs/basis')
const basisTarget = resolve('public/basis')
const textureDir = resolve('public/textures/production')
const png = resolve(textureDir, 'market-material-atlas.png')
const ktx2 = resolve(textureDir, 'market-material-atlas.ktx2')

await mkdir(basisTarget, { recursive: true })
await cp(basisSource, basisTarget, { recursive: true, force: true })

const probe = spawnSync('toktx', ['--version'], { encoding: 'utf8' })
let compressed = false

if (probe.status === 0) {
  const run = spawnSync('toktx', [
    '--t2',
    '--encode', 'etc1s',
    '--clevel', '4',
    '--qlevel', '220',
    '--genmipmap',
    ktx2,
    png
  ], { stdio: 'inherit' })
  compressed = run.status === 0
} else {
  process.stdout.write('toktx not found; PNG fallback remains active for local development.\n')
}

if (compressed) {
  await access(ktx2, constants.R_OK)
  process.stdout.write('Generated KTX2 production atlas with BasisLZ mipmaps.\n')
}

await writeFile(resolve(textureDir, 'runtime-textures.json'), JSON.stringify({
  version: 1,
  materialAtlas: {
    ktx2: 'textures/production/market-material-atlas.ktx2',
    fallback: 'textures/production/market-material-atlas.png',
    compressed
  },
  basisTranscoderPath: 'basis/'
}, null, 2))
