export function resolveAssetUrl(url: string) {
  if (/^(?:https?:|blob:|data:)/i.test(url)) return url

  const base = import.meta.env.BASE_URL || '/'
  const normalizedBase = base.endsWith('/') ? base : `${base}/`
  return `${normalizedBase}${url.replace(/^\/+/, '')}`
}
