import { genericHtmlAdapter } from './generic-html-adapter.mjs'

// Put hostname-specific adapters before the fallback adapter as the project grows.
// Example: { id: 'vendor-x', supports: (url) => url.hostname === 'example.com', extractPrice(...) { ... } }
const adapters = [genericHtmlAdapter]

export function getSourceAdapter(sourceUrl) {
  const url = new URL(sourceUrl)
  const adapter = adapters.find((candidate) => candidate.supports(url))
  if (!adapter) throw new Error(`No source adapter for ${url.hostname}`)
  return adapter
}

export function listSourceAdapters() {
  return adapters.map((adapter) => adapter.id)
}
