import { useProgress } from '@react-three/drei'
import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useAppStore } from '../store'
import type { CrawlStatus, Product, Vendor } from '../domain/catalog'
import type { Interaction } from '../domain/interaction'
import { roomEntryPoint, roomEntryYaw } from '../world/spatial'
import type { RoomDefinition, WorldDefinition } from '../world/types'
import MobileControls from './MobileControls'

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      dateStyle: 'medium',
      timeStyle: value.includes('T') ? 'short' : undefined
    }).format(new Date(value))
  } catch {
    return value
  }
}

function crawlStatusLabel(status?: CrawlStatus) {
  if (status === 'updated') return 'به‌روزرسانی خودکار'
  if (status === 'seed-fallback') return 'قیمت seed؛ قیمت تازه پیدا نشد'
  if (status === 'fetch-failed') return 'خطای دریافت؛ قیمت seed نمایش داده می‌شود'
  return null
}

function VendorPanel({ vendor, selected }: { vendor: Vendor; selected: Interaction }) {
  const product: Product | undefined = selected.kind === 'product' ? vendor.products.find((item) => item.id === selected.productId) : undefined
  const world = useAppStore((state) => state.world)
  const room = world.rooms.find((candidate) => candidate.vendorId === vendor.id)
  const accent = room?.theme.accent ?? '#c99a55'
  const setSelected = useAppStore((state) => state.setSelected)
  const collectSample = useAppStore((state) => state.collectSample)
  const toggleFavoriteProduct = useAppStore((state) => state.toggleFavoriteProduct)
  const sampledProductIds = useAppStore((state) => state.sampledProductIds)
  const favoriteProductIds = useAppStore((state) => state.favoriteProductIds)
  const quoteItems = useAppStore((state) => state.quoteItems)
  const toggleQuoteProduct = useAppStore((state) => state.toggleQuoteProduct)

  const inspectProducts = () => setSelected({
    kind: 'products',
    vendorId: vendor.id,
    label: 'کالاها و قیمت‌های فروشگاه'
  })

  const openCatalog = () => {
    const documentId = room?.experience?.catalogDocumentId
    if (!documentId) return
    setSelected({
      kind: 'document',
      vendorId: vendor.id,
      documentId,
      label: 'کاتالوگ دیجیتال فروشگاه'
    })
  }

  return (
    <div className="detail-body">
      <div className="detail-brand" style={{ '--brand': accent } as CSSProperties}>
        <span>{vendor.shortName}</span>
        <h2>{vendor.name}</h2>
        <p>{vendor.tagline}</p>
      </div>

      {selected.kind === 'vendor' && (
        <>
          <div className="info-card">
            <span className="kicker">وب‌سایت مغازه</span>
            <strong dir="ltr">{vendor.sourceLabel}</strong>
            <p>میز فروش می‌تواند بعداً به CRM، چت فروش، تقویم جلسه یا پنل اختصاصی فروشنده متصل شود.</p>
          </div>
          <div className="detail-actions">
            <button type="button" className="primary-action" onClick={inspectProducts}>دیدن کالاهای داخل بازار</button>
            {room?.experience?.catalogDocumentId && (
              <button type="button" className="secondary-action" onClick={openCatalog}>ورق‌زدن کاتالوگ</button>
            )}
            <a className="secondary-action" href={vendor.website} target="_blank" rel="noreferrer">سایت فروشنده ↗</a>
          </div>
        </>
      )}

      {selected.kind === 'products' && (
        <div className="product-list">
          {vendor.products.map((item) => {
            const status = crawlStatusLabel(item.crawlStatus)
            return (
              <button
                key={item.id}
                type="button"
                className="product-row product-row--inspect"
                onClick={() => setSelected({
                  kind: 'product',
                  vendorId: vendor.id,
                  productId: item.id,
                  label: item.name
                })}
              >
                <div>
                  <strong>{item.name}</strong>
                  <small>{item.unit}</small>
                  {status && <small className={`crawl-status ${item.crawlStatus ?? ''}`}>{status}</small>}
                </div>
                <span>{item.priceText}</span>
                <em>بررسی کالا ←</em>
              </button>
            )
          })}
        </div>
      )}

      {product && (
        <>
          <div className="product-focus">
            <span className="kicker">کالای انتخاب‌شده</span>
            <h3>{product.name}</h3>
            <div className="big-price">{product.priceText}</div>
            <p>{product.unit}</p>
            <small>مشاهده قیمت: {formatDate(product.observedAt)}</small>
            {crawlStatusLabel(product.crawlStatus) && (
              <small className={`crawl-status ${product.crawlStatus ?? ''}`}>{crawlStatusLabel(product.crawlStatus)}</small>
            )}
            {product.note && <small>{product.note}</small>}
          </div>
          <div className="detail-actions detail-actions--product">
            <button
              type="button"
              className={`sample-action ${sampledProductIds.includes(product.id) ? 'done' : ''}`}
              onClick={() => collectSample(product.id)}
            >
              {sampledProductIds.includes(product.id) ? '✓ نمونه در کیف شماست' : 'برداشت نمونه کاغذ · +25'}
            </button>
            <button
              type="button"
              className={`favorite-action ${favoriteProductIds.includes(product.id) ? 'active' : ''}`}
              onClick={() => toggleFavoriteProduct(product.id)}
            >
              {favoriteProductIds.includes(product.id) ? '★ ذخیره‌شده' : '☆ ذخیره برای مقایسه'}
            </button>
            <button
              type="button"
              className={`quote-action ${quoteItems.some((item) => item.vendorId === vendor.id && item.productId === product.id) ? 'active' : ''}`}
              onClick={() => toggleQuoteProduct(vendor.id, product.id)}
            >
              {quoteItems.some((item) => item.vendorId === vendor.id && item.productId === product.id)
                ? '✓ داخل سبد استعلام'
                : '+ افزودن به استعلام قیمت'}
            </button>
            <a className="secondary-action" href={product.sourceUrl} target="_blank" rel="noreferrer">مشاهده منبع ↗</a>
          </div>
        </>
      )}

      <div className="source-note">قیمت‌ها برای دمو از صفحات عمومی وب برداشت شده‌اند و قیمت قطعی معامله نیستند.</div>
    </div>
  )
}

function nextGuideRoom(
  world: WorldDefinition,
  visitedRoomIds: string[],
  player: { x: number; z: number }
) {
  const unvisited = world.rooms.filter((room) => !visitedRoomIds.includes(room.id))
  if (!unvisited.length) return null

  return [...unvisited].sort((a, b) => {
    const adx = a.position[0] - player.x
    const adz = a.position[2] - player.z
    const bdx = b.position[0] - player.x
    const bdz = b.position[2] - player.z
    return adx * adx + adz * adz - (bdx * bdx + bdz * bdz)
  })[0]
}

function InteractionPrompt({ interaction }: { interaction: Interaction }) {
  const performQuickAction = useAppStore((state) => state.performQuickAction)
  const isProduct = interaction.kind === 'product'

  return (
    <div className="interaction-prompt interaction-prompt--rich">
      <span>تعامل نزدیک</span>
      <strong>{interaction.label}</strong>
      <div className="interaction-quick-actions">
        <button type="button" onClick={() => performQuickAction(interaction, 'primary')}>
          بررسی <kbd>E</kbd>
        </button>
        {isProduct && (
          <>
            <button type="button" onClick={() => performQuickAction(interaction, 'sample')}>
              نمونه <kbd>F</kbd>
            </button>
            <button type="button" onClick={() => performQuickAction(interaction, 'quote')}>
              استعلام <kbd>C</kbd>
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function QuoteTray() {
  const catalog = useAppStore((state) => state.catalog)
  const quoteItems = useAppStore((state) => state.quoteItems)
  const toggleQuoteProduct = useAppStore((state) => state.toggleQuoteProduct)
  const clearQuote = useAppStore((state) => state.clearQuote)
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const resolved = useMemo(() => quoteItems.flatMap((item) => {
    const vendor = catalog.vendors.find((candidate) => candidate.id === item.vendorId)
    const product = vendor?.products.find((candidate) => candidate.id === item.productId)
    return vendor && product ? [{ vendor, product }] : []
  }), [catalog.vendors, quoteItems])

  const copyQuote = async () => {
    const text = [
      'Paper Bazaar 3D — پیش‌نویس استعلام',
      ...resolved.map(({ vendor, product }) => `${vendor.name} | ${product.name} | ${product.priceText} | ${product.unit}`)
    ].join('\n')

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <>
      <button type="button" className="quote-toggle" onClick={() => setOpen((value) => !value)}>
        استعلام <b>{quoteItems.length}</b>
      </button>
      {open && (
        <div className="quote-tray">
          <div className="quote-tray__head">
            <div>
              <span>سبد استعلام چندفروشنده</span>
              <strong>{resolved.length} کالا برای مقایسه</strong>
            </div>
            <button type="button" onClick={() => setOpen(false)}>×</button>
          </div>

          <div className="quote-compare-grid">
            {resolved.length ? resolved.map(({ vendor, product }) => (
              <article key={`${vendor.id}:${product.id}`}>
                <small>{vendor.shortName}</small>
                <strong>{product.name}</strong>
                <b>{product.priceText}</b>
                <span>{product.unit}</span>
                <button type="button" onClick={() => toggleQuoteProduct(vendor.id, product.id)}>حذف</button>
              </article>
            )) : (
              <div className="quote-empty">با <kbd>C</kbd> یا دکمه «استعلام» کالا اضافه کن.</div>
            )}
          </div>

          <div className="quote-tray__actions">
            <button type="button" onClick={copyQuote} disabled={!resolved.length}>{copied ? '✓ کپی شد' : 'کپی پیش‌نویس استعلام'}</button>
            <button type="button" onClick={clearQuote} disabled={!resolved.length}>پاک کردن</button>
          </div>
          <small className="quote-disclaimer">این بخش فقط پیش‌نویس مقایسه است؛ قیمت قطعی معامله نیست.</small>
        </div>
      )}
    </>
  )
}

function MiniMap({
  open,
  onToggle,
  onNavigate,
  activeRoomId
}: {
  open: boolean
  onToggle: () => void
  onNavigate: (room: RoomDefinition) => void
  activeRoomId: string | null
}) {
  const player = useAppStore((state) => state.player)
  const vendors = useAppStore((state) => state.catalog.vendors)
  const world = useAppStore((state) => state.world)
  const vendorsById = useMemo(() => new Map(vendors.map((vendor) => [vendor.id, vendor])), [vendors])
  const { bounds } = world
  const px = ((player.x - bounds.minX) / (bounds.maxX - bounds.minX)) * 100
  const py = ((bounds.maxZ - player.z) / (bounds.maxZ - bounds.minZ)) * 100

  if (!open) {
    return <button className="minimap-reopen" onClick={onToggle}>نقشه <kbd>M</kbd></button>
  }

  return (
    <div className="minimap-shell">
      <div className="minimap-title">
        <span>نقشه راسته · لمس/کلیک برای رفتن</span>
        <button type="button" onClick={onToggle} aria-label="بستن نقشه"><kbd>M</kbd></button>
      </div>
      <div className="minimap">
        <div className="minimap-aisle" />
        {world.rooms.map((room, index) => {
          const vendor = room.vendorId ? vendorsById.get(room.vendorId) : undefined
          const label = vendor?.name ?? room.label
          const x = ((room.position[0] - bounds.minX) / (bounds.maxX - bounds.minX)) * 100 - 11
          const y = ((bounds.maxZ - room.position[2]) / (bounds.maxZ - bounds.minZ)) * 100 - 7
          return (
            <button
              key={room.id}
              type="button"
              className={`minimap-booth ${activeRoomId === room.id ? 'active' : ''}`}
              style={{ left: `${x}%`, top: `${y}%`, borderColor: room.theme.accent }}
              title={`رفتن سریع به ${label}`}
              onClick={() => onNavigate(room)}
            >
              <span>{label.replace('انتشارات ملت / کیمیا تجارت', 'ملت')}</span>
              <b>{index + 1}</b>
            </button>
          )
        })}
        <div className="minimap-entry">ورودی</div>
        <div className="minimap-player" style={{ left: `${px}%`, top: `${py}%` }} />
      </div>
      <small className="minimap-help">دسکتاپ: Esc سپس کلیک روی غرفه · موبایل: مستقیم لمس کن.</small>
    </div>
  )
}

function DebugPanel() {
  const player = useAppStore((state) => state.player)
  const diagnostics = useAppStore((state) => state.diagnostics)
  const quality = useAppStore((state) => state.quality)
  const activeRoomId = useAppStore((state) => state.activeRoomId)
  const world = useAppStore((state) => state.world)
  const visitedRoomIds = useAppStore((state) => state.visitedRoomIds)
  const assetErrors = useAppStore((state) => state.assetErrors)

  return (
    <div className="debug-panel" dir="ltr">
      <strong>Runtime diagnostics · F3</strong>
      <div><span>position</span><b>{player.x.toFixed(2)}, {player.z.toFixed(2)}</b></div>
      <div><span>room</span><b>{activeRoomId ?? 'alley'}</b></div>
      <div><span>quality</span><b>{quality}</b></div>
      <div><span>draw calls</span><b>{diagnostics.calls}</b></div>
      <div><span>triangles</span><b>{diagnostics.triangles.toLocaleString()}</b></div>
      <div><span>geometries</span><b>{diagnostics.geometries}</b></div>
      <div><span>textures</span><b>{diagnostics.textures}</b></div>
      <div><span>fps</span><b>{diagnostics.fps.toFixed(1)}</b></div>
      <div><span>frame ms</span><b>{diagnostics.frameMs.toFixed(1)}</b></div>
      <div><span>target scans/s</span><b>{diagnostics.raycastsPerSecond.toFixed(1)}</b></div>
      <div><span>occlusion scans/s</span><b>{diagnostics.occlusionRaycastsPerSecond.toFixed(1)}</b></div>
      <div><span>interaction targets</span><b>{diagnostics.interactionTargets}</b></div>
      <div><span>pixel ratio</span><b>{diagnostics.pixelRatio.toFixed(2)}</b></div>
      <div><span>room budget</span><b>{diagnostics.proxyRooms}P · {diagnostics.detailedRooms}D · {diagnostics.fileRooms}F</b></div>
      <div><span>visited</span><b>{visitedRoomIds.length}/{world.rooms.length}</b></div>
      <div><span>asset errors</span><b>{Object.keys(assetErrors).length}</b></div>
    </div>
  )
}

function MarketMission() {
  const score = useAppStore((state) => state.marketScore)
  const visitedRoomIds = useAppStore((state) => state.visitedRoomIds)
  const visited = visitedRoomIds.length
  const products = useAppStore((state) => state.discoveredProductIds.length)
  const samples = useAppStore((state) => state.sampledProductIds.length)
  const world = useAppStore((state) => state.world)
  const player = useAppStore((state) => state.player)
  const requestNavigation = useAppStore((state) => state.requestNavigation)
  const setSelected = useAppStore((state) => state.setSelected)
  const setStarted = useAppStore((state) => state.setStarted)
  const nextRoom = nextGuideRoom(world, visitedRoomIds, player)

  const guideNext = () => {
    if (!nextRoom) return
    if (document.pointerLockElement) document.exitPointerLock()
    setSelected(null)
    setStarted(true)
    requestNavigation({
      target: roomEntryPoint(nextRoom),
      yaw: roomEntryYaw(nextRoom),
      label: nextRoom.label
    })
  }

  const visitGoal = 4
  const productGoal = 5
  const sampleGoal = 3
  const completed = Math.min(visitGoal, visited) + Math.min(productGoal, products) + Math.min(sampleGoal, samples)
  const total = visitGoal + productGoal + sampleGoal
  const percent = Math.round((completed / total) * 100)

  return (
    <div className="market-mission">
      <div className="market-mission__head">
        <div>
          <span>ماموریت بازارگرد</span>
          <strong>{score} امتیاز</strong>
        </div>
        <b>{percent}%</b>
      </div>
      <i><span style={{ width: `${percent}%` }} /></i>
      <div className="market-mission__tasks">
        <span className={visited >= visitGoal ? 'done' : ''}>غرفه‌ها {Math.min(visited, visitGoal)}/{visitGoal}</span>
        <span className={products >= productGoal ? 'done' : ''}>کالاها {Math.min(products, productGoal)}/{productGoal}</span>
        <span className={samples >= sampleGoal ? 'done' : ''}>نمونه‌ها {Math.min(samples, sampleGoal)}/{sampleGoal}</span>
      </div>
      <button type="button" className="market-guide" onClick={guideNext} disabled={!nextRoom}>
        {nextRoom ? `راهنما: ${nextRoom.label}` : 'همه غرفه‌ها کشف شدند'} <kbd>G</kbd>
      </button>
    </div>
  )
}

export default function HUD() {
  const catalog = useAppStore((state) => state.catalog)
  const catalogMode = useAppStore((state) => state.catalogMode)
  const catalogError = useAppStore((state) => state.catalogError)
  const selected = useAppStore((state) => state.selected)
  const nearby = useAppStore((state) => state.nearby)
  const started = useAppStore((state) => state.started)
  const quality = useAppStore((state) => state.quality)
  const activeRoomId = useAppStore((state) => state.activeRoomId)
  const world = useAppStore((state) => state.world)
  const setSelected = useAppStore((state) => state.setSelected)
  const setStarted = useAppStore((state) => state.setStarted)
  const setQuality = useAppStore((state) => state.setQuality)
  const requestNavigation = useAppStore((state) => state.requestNavigation)
  const diagnosticsEnabled = useAppStore((state) => state.diagnosticsEnabled)
  const setDiagnosticsEnabled = useAppStore((state) => state.setDiagnosticsEnabled)
  const actionFeedback = useAppStore((state) => state.actionFeedback)
  const clearActionFeedback = useAppStore((state) => state.clearActionFeedback)
  const { active: loadingAssets, progress } = useProgress()
  const [mapOpen, setMapOpen] = useState(true)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return
      if (event.code === 'KeyM') setMapOpen((value) => !value)
      if (event.code === 'F3') {
        event.preventDefault()
        setDiagnosticsEnabled(!useAppStore.getState().diagnosticsEnabled)
      }
      if (event.code === 'KeyQ') setQuality(quality === 'cinematic' ? 'balanced' : 'cinematic')
      if (event.code === 'KeyG') {
        const state = useAppStore.getState()
        const room = nextGuideRoom(state.world, state.visitedRoomIds, state.player)
        if (room) {
          if (document.pointerLockElement) document.exitPointerLock()
          state.setSelected(null)
          state.setStarted(true)
          state.requestNavigation({
            target: roomEntryPoint(room),
            yaw: roomEntryYaw(room),
            label: room.label
          })
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [quality, setDiagnosticsEnabled, setQuality])

  useEffect(() => {
    if (!actionFeedback) return
    const timer = window.setTimeout(() => clearActionFeedback(actionFeedback.id), 1800)
    return () => window.clearTimeout(timer)
  }, [actionFeedback, clearActionFeedback])

  const selectedVendor = useMemo(() => {
    if (!selected) return null
    return catalog.vendors.find((vendor) => vendor.id === selected.vendorId) ?? null
  }, [catalog.vendors, selected])

  const activeRoom = useMemo(
    () => world.rooms.find((room) => room.id === activeRoomId) ?? null,
    [activeRoomId, world.rooms]
  )

  const enter = () => {
    setStarted(true)
    const canvas = document.querySelector('canvas')
    const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false
    if (!coarse && canvas instanceof HTMLCanvasElement && canvas.requestPointerLock) {
      try {
        void canvas.requestPointerLock()
      } catch {
        // Pointer Lock may be unavailable in embedded previews.
      }
    }
  }

  const navigateToRoom = (room: RoomDefinition) => {
    if (document.pointerLockElement) document.exitPointerLock()
    setSelected(null)
    setStarted(true)
    requestNavigation({
      target: roomEntryPoint(room),
      yaw: roomEntryYaw(room),
      label: room.label
    })
  }

  return (
    <div className="hud" dir="rtl">
      <div className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark">P3</div>
          <div><strong>Paper Bazaar 3D</strong><span>Root performance · v0.17</span></div>
        </div>

        <div className="top-actions">
          <button
            className="quality-toggle"
            type="button"
            onClick={() => setQuality(quality === 'cinematic' ? 'balanced' : 'cinematic')}
            title="میانبر Q"
          >
            {quality === 'cinematic' ? 'Cinematic' : 'Balanced'} <kbd>Q</kbd>
          </button>
          <div className="data-status" title={catalogError ?? undefined}>
            <i className={catalogMode === 'api' ? 'live' : catalogError ? 'error' : ''} />
            {catalogMode === 'api' ? 'API catalog' : catalogError ? 'Seed fallback' : 'Seed snapshot'} · {formatDate(catalog.generatedAt)}
          </div>
        </div>
      </div>

      <MiniMap
        open={mapOpen}
        onToggle={() => setMapOpen((value) => !value)}
        onNavigate={navigateToRoom}
        activeRoomId={activeRoomId}
      />

      {started && <MarketMission />}
      {started && <QuoteTray />}
      {actionFeedback && (
        <div className={`action-feedback ${actionFeedback.tone}`}>{actionFeedback.text}</div>
      )}

      {loadingAssets && progress < 100 && (
        <div className="asset-loader">
          <span>Loading 3D assets</span>
          <strong>{Math.round(progress)}%</strong>
          <i><b style={{ width: `${progress}%` }} /></i>
        </div>
      )}

      {activeRoom && started && !selected && (
        <div className="room-toast" style={{ '--room-accent': activeRoom.theme.accent } as CSSProperties}>
          <span>محدوده فعلی</span>
          <strong>{activeRoom.label}</strong>
        </div>
      )}

      {started && !selected && <div className="crosshair" />}

      {nearby && started && !selected && <InteractionPrompt interaction={nearby} />}

      {started && !selected && (
        <div className="controls-hint">
          <span><kbd>WASD</kbd> حرکت</span>
          <span><kbd>Shift</kbd> سریع</span>
          <span><kbd>Wheel</kbd> زوم محیط</span>
          <span><kbd>0</kbd> ریست زوم</span>
          <span><kbd>R</kbd> ورودی</span>
          <span><kbd>M</kbd> نقشه</span>
          <span><kbd>Q</kbd> کیفیت</span>
          <span><kbd>F</kbd> نمونه سریع</span>
          <span><kbd>C</kbd> استعلام سریع</span>
          <span><kbd>G</kbd> راهنمای غرفه</span>
          <span><kbd>F3</kbd> دیباگ</span>
        </div>
      )}

      {diagnosticsEnabled && <DebugPanel />}
      <MobileControls />

      {selected && selected.kind !== 'document' && selectedVendor && (
        <aside className="detail-panel">
          <div className="detail-head">
            <span>{selected.kind === 'products' ? 'تابلوی قیمت' : selected.kind === 'product' ? 'کالای روی پیشخوان' : 'میز فروش'}</span>
            <button onClick={() => setSelected(null)} aria-label="بستن">×</button>
          </div>
          <VendorPanel vendor={selectedVendor} selected={selected} />
          <div className="panel-footer">برای ادامه حرکت پنل را ببند؛ در موبایل کنترل‌ها خودکار برمی‌گردند.</div>
        </aside>
      )}

      {!started && (
        <div className="intro-overlay">
          <div className="intro-card">
            <div className="intro-eyebrow">ROOT PERFORMANCE + BAKED REALISM · v0.17.0</div>
            <h1>راسته‌ی سه‌بعدی<br /><span>کاغذفروشان بازار تهران</span></h1>
            <p>v0.17 یک جراحی ریشه‌ای performance است: کل صحنه demand-rendered شده، raycast دو مرحله‌ای فقط targetهای واقعی را بررسی می‌کند، نورهای realtime و shaderهای Physical غیرضروری حذف شده‌اند و Hero Shopها به‌جای هزینه‌ی بیشتر GPU، baked vertex lighting دارند. معماری scan/asset/profile نسخه 0.16 کاملاً حفظ شده است.</p>
            <div className="intro-features">
              <span>Demand-only render loop</span>
              <span>Two-stage interaction raycast</span>
              <span>Standard-first PBR</span>
              <span>Baked Hero lighting</span>
              <span>Scan-ready asset registry preserved</span>
            </div>
            <button className="enter-button" onClick={enter}>ورود به بازار <b>↵</b></button>
            <small>دسکتاپ: WASD + Mouse + Wheel · موبایل: Joystick + Look pad + Pinch/±.</small>
          </div>
        </div>
      )}
    </div>
  )
}
