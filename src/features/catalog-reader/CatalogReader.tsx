import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import type { CatalogPage } from '../../domain/document'
import { useAppStore } from '../../store'

function PageContent({
  page,
  vendorId
}: {
  page: CatalogPage | undefined
  vendorId: string
}) {
  const catalog = useAppStore((state) => state.catalog)
  const vendor = catalog.vendors.find((candidate) => candidate.id === vendorId)

  if (!page) {
    return <div className="catalog-page catalog-page--blank" aria-hidden="true" />
  }

  if (page.kind === 'cover') {
    return (
      <article className="catalog-page catalog-page--cover">
        <div className="catalog-page__grain" />
        <span className="catalog-page__eyebrow">{page.eyebrow}</span>
        <div className="catalog-page__cover-mark">PAPER<br />BAZAAR</div>
        <h2>{page.title}</h2>
        <p>{page.body}</p>
        {page.callout && <strong>{page.callout}</strong>}
      </article>
    )
  }

  if (page.kind === 'products') {
    const products = (page.productIds ?? [])
      .map((id) => vendor?.products.find((product) => product.id === id))
      .filter(Boolean)

    return (
      <article className="catalog-page catalog-page--products">
        <span className="catalog-page__eyebrow">{page.eyebrow}</span>
        <h2>{page.title}</h2>
        <p>{page.body}</p>
        <div className="catalog-product-grid">
          {products.map((product) => product && (
            <a key={product.id} href={product.sourceUrl} target="_blank" rel="noreferrer" className="catalog-product-card">
              <span>WHOLESALE PAPER</span>
              <strong>{product.name}</strong>
              <small>{product.unit}</small>
              <b>{product.priceText}</b>
            </a>
          ))}
        </div>
      </article>
    )
  }

  if (page.kind === 'samples') {
    return (
      <article className="catalog-page catalog-page--samples">
        <span className="catalog-page__eyebrow">{page.eyebrow}</span>
        <h2>{page.title}</h2>
        <p>{page.body}</p>
        <div className="catalog-swatches">
          {(page.swatches ?? []).map((swatch) => (
            <div className="catalog-swatch" key={swatch.id}>
              <i style={{ background: swatch.color }} />
              <div><strong>{swatch.name}</strong><small>{swatch.description}</small></div>
            </div>
          ))}
        </div>
      </article>
    )
  }

  return (
    <article className={`catalog-page catalog-page--${page.kind}`}>
      <span className="catalog-page__eyebrow">{page.eyebrow}</span>
      <h2>{page.title}</h2>
      {page.body && <p>{page.body}</p>}
      {page.bullets && (
        <ul>
          {page.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
        </ul>
      )}
      {page.callout && <div className="catalog-callout">{page.callout}</div>}
      {page.kind === 'contact' && vendor && (
        <a className="catalog-contact-link" href={vendor.website} target="_blank" rel="noreferrer">
          باز کردن وب‌سایت فروشنده ↗
        </a>
      )}
    </article>
  )
}

export default function CatalogReader() {
  const selected = useAppStore((state) => state.selected)
  const setSelected = useAppStore((state) => state.setSelected)
  const documents = useAppStore((state) => state.documents)
  const [spread, setSpread] = useState(0)
  const [turn, setTurn] = useState<'next' | 'prev' | null>(null)
  const [singlePage, setSinglePage] = useState(false)

  const document = useMemo(() => {
    if (selected?.kind !== 'document') return null
    return documents.find((item) => item.id === selected.documentId) ?? null
  }, [documents, selected])

  useEffect(() => {
    setSpread(0)
    setTurn(null)
  }, [document?.id])

  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)')
    const sync = () => setSinglePage(media.matches)
    sync()
    media.addEventListener?.('change', sync)
    return () => media.removeEventListener?.('change', sync)
  }, [])

  const pageStep = singlePage ? 1 : 2

  useEffect(() => {
    if (!document) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Escape') setSelected(null)
      if (event.code === 'ArrowLeft') {
        event.preventDefault()
        setTurn('next')
        setSpread((value) => Math.min(value + pageStep, Math.max(0, document.pages.length - 1)))
      }
      if (event.code === 'ArrowRight') {
        event.preventDefault()
        setTurn('prev')
        setSpread((value) => Math.max(0, value - pageStep))
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [document, pageStep, setSelected])

  if (!document || selected?.kind !== 'document') return null

  const canPrev = spread > 0
  const canNext = spread + pageStep < document.pages.length
  const leftPage = document.pages[spread]
  const rightPage = singlePage ? undefined : document.pages[spread + 1]

  const move = (direction: 'next' | 'prev') => {
    if (direction === 'next' && !canNext) return
    if (direction === 'prev' && !canPrev) return
    setTurn(direction)
    setSpread((value) => direction === 'next'
      ? Math.min(value + pageStep, document.pages.length - 1)
      : Math.max(0, value - pageStep))
  }

  return (
    <div className="catalog-reader" dir="rtl" role="dialog" aria-modal="true" aria-label={document.title}>
      <button className="catalog-reader__scrim" aria-label="بستن کاتالوگ" onClick={() => setSelected(null)} />
      <div className="catalog-reader__toolbar">
        <div>
          <span>{document.edition}</span>
          <strong>{document.title}</strong>
          <small>{document.subtitle}</small>
        </div>
        <button type="button" onClick={() => setSelected(null)} aria-label="بستن">×</button>
      </div>

      <div
        className={`catalog-book ${turn ? `catalog-book--turn-${turn}` : ''}`}
        style={{
          '--catalog-accent': document.accent,
          '--catalog-secondary': document.secondary
        } as CSSProperties}
        onAnimationEnd={() => setTurn(null)}
      >
        <div className="catalog-book__spine" />
        <PageContent page={leftPage} vendorId={document.vendorId} />
        <PageContent page={rightPage} vendorId={document.vendorId} />
      </div>

      <div className="catalog-reader__nav">
        <button type="button" disabled={!canPrev} onClick={() => move('prev')}>→ قبلی</button>
        <span>{singlePage ? `${spread + 1} / ${document.pages.length}` : `${Math.min(spread + 1, document.pages.length)}–${Math.min(spread + 2, document.pages.length)} / ${document.pages.length}`}</span>
        <button type="button" disabled={!canNext} onClick={() => move('next')}>بعدی ←</button>
      </div>

      <div className="catalog-reader__hint">کلیدهای ← → برای ورق زدن · Esc برای بستن</div>
    </div>
  )
}
