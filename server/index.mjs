import express from 'express'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readCatalog } from './catalog.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const distPath = path.join(root, 'dist')
const port = Number(process.env.PORT || 8787)

const app = express()
app.disable('x-powered-by')
app.use(express.json({ limit: '64kb' }))
app.use((_req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; worker-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'none'"
  })
  next()
})

app.get('/api/health', async (_req, res) => {
  try {
    const catalog = await readCatalog()
    res.json({ ok: true, service: 'paper-bazaar-3d', generatedAt: catalog.generatedAt, vendors: catalog.vendors.length })
  } catch (error) {
    res.status(503).json({ ok: false, service: 'paper-bazaar-3d', error: 'catalog-unavailable' })
  }
})

app.get('/api/catalog', async (_req, res) => {
  try {
    const catalog = await readCatalog()
    res.set('Cache-Control', 'no-store')
    res.json(catalog)
  } catch (error) {
    console.error('[api/catalog]', error)
    res.status(503).json({ error: 'catalog-unavailable' })
  }
})

app.use('/api', (_req, res) => res.status(404).json({ error: 'not-found' }))

try {
  await fs.access(distPath)
  app.use('/assets', express.static(path.join(distPath, 'assets'), { maxAge: '1y', immutable: true, etag: true }))
  app.use(express.static(distPath, { maxAge: '1h', etag: true, index: false }))
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next()
    res.set('Cache-Control', 'no-cache')
    return res.sendFile(path.join(distPath, 'index.html'))
  })
} catch {
  app.get('/', (_req, res) => res.type('text').send('API is running. Start Vite with npm run dev:web, or build with npm run build.'))
}

app.use((error, _req, res, _next) => {
  console.error('[server]', error)
  if (res.headersSent) return
  res.status(500).json({ error: 'internal-server-error' })
})

app.listen(port, () => console.log(`Paper Bazaar API listening on http://localhost:${port}`))
