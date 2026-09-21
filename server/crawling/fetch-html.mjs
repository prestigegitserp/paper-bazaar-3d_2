export async function fetchHtml(url, { timeoutMs = 15000 } = {}) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'PaperBazaar3D/0.3 (+catalog refresh; low-frequency demo crawler)',
      'accept-language': 'fa-IR,fa;q=0.9,en;q=0.6'
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(timeoutMs)
  })

  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('text/html')) throw new Error(`Unsupported content-type: ${contentType || 'unknown'}`)
  return response.text()
}
