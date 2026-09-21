import { bazaarShopColliders, bazaarShopEntryAnchor, bazaarShopFootprint } from './presets/bazaarShop'
import type { BoothTheme, HotspotDefinition, RoomDefinition, WorldDefinition } from './types'

const themes: Record<string, BoothTheme> = {
  'iran-paper-net': { primary: '#31504c', secondary: '#d9d4c6', accent: '#d5b16c', floor: '#5f5b54' },
  'kaghaz-foroush': { primary: '#604233', secondary: '#ded5c5', accent: '#d0a45d', floor: '#62584f' },
  'mellat-pub': { primary: '#65383d', secondary: '#e1d7c8', accent: '#d6ad68', floor: '#625751' },
  kaghaz20: { primary: '#40586d', secondary: '#dddcd7', accent: '#d3b16f', floor: '#606566' },
  'seraj-cellulose': { primary: '#6a5030', secondary: '#dfd4bd', accent: '#d0a057', floor: '#62564a' },
  'scan-preview': { primary: '#3f5351', secondary: '#d8ddd8', accent: '#9bc3bd', floor: '#606463' }
}

function shopHotspots(vendorId: string): HotspotDefinition[] {
  const documentId = `catalog:${vendorId}:2026`
  return [
    {
      id: `${vendorId}:management`,
      anchor: { kind: 'slot', slot: 'management-desk' },
      action: { kind: 'vendor', vendorId, label: 'اطلاعات و وب‌سایت مغازه' }
    },
    {
      id: `${vendorId}:prices`,
      anchor: { kind: 'slot', slot: 'price-board' },
      action: { kind: 'products', vendorId, label: 'کالاها و آخرین قیمت ثبت‌شده' }
    },
    {
      id: `${vendorId}:catalog`,
      anchor: { kind: 'slot', slot: 'catalog-desk' },
      action: { kind: 'document', vendorId, documentId, label: 'باز کردن کاتالوگ دیجیتال' }
    },
    {
      id: `${vendorId}:product:0`,
      anchor: { kind: 'slot', slot: 'product-pedestal', index: 0 },
      action: { kind: 'product-slot', vendorId, productIndex: 0, label: 'کالای منتخب مغازه' }
    },
    {
      id: `${vendorId}:product:1`,
      anchor: { kind: 'slot', slot: 'product-pedestal', index: 1 },
      action: { kind: 'product-slot', vendorId, productIndex: 1, label: 'کالای منتخب مغازه' }
    }
  ]
}

function authoredShopHotspots(vendorId: string): HotspotDefinition[] {
  const documentId = `catalog:${vendorId}:2026`
  return [
    {
      id: `${vendorId}:management`,
      anchor: { kind: 'node', nodeName: 'hotspot_management' },
      action: { kind: 'vendor', vendorId, label: 'اطلاعات و وب‌سایت مغازه' }
    },
    {
      id: `${vendorId}:prices`,
      anchor: { kind: 'node', nodeName: 'hotspot_prices' },
      action: { kind: 'products', vendorId, label: 'کالاها و آخرین قیمت ثبت‌شده' }
    },
    {
      id: `${vendorId}:catalog`,
      anchor: { kind: 'node', nodeName: 'hotspot_catalog' },
      action: { kind: 'document', vendorId, documentId, label: 'باز کردن کاتالوگ دیجیتال' }
    },
    {
      id: `${vendorId}:product:0`,
      anchor: { kind: 'node', nodeName: 'hotspot_product_0' },
      action: { kind: 'product-slot', vendorId, productIndex: 0, label: 'کالای منتخب مغازه' }
    },
    {
      id: `${vendorId}:product:1`,
      anchor: { kind: 'node', nodeName: 'hotspot_product_1' },
      action: { kind: 'product-slot', vendorId, productIndex: 1, label: 'کالای منتخب مغازه' }
    }
  ]
}

function shop(
  id: string,
  label: string,
  themeKey: string,
  profileId: string,
  x: number,
  z: number,
  rotationY: number,
  vendorId?: string
): RoomDefinition {
  return {
    id,
    label,
    kind: 'booth',
    vendorId,
    position: [x, 0, z],
    rotationY,
    footprint: bazaarShopFootprint,
    entryAnchor: bazaarShopEntryAnchor,
    discoveryRadius: 4.1,
    theme: themes[themeKey],
    asset: {
      kind: 'procedural',
      renderer: 'retail-booth-v3',
      assetId: `procedural:${id}`,
      version: '6.0.0',
      metersPerUnit: 1
    },
    experience: {
      profileId,
      catalogDocumentId: vendorId ? `catalog:${vendorId}:2026` : undefined
    },
    hotspots: vendorId ? shopHotspots(vendorId) : [],
    colliders: bazaarShopColliders
  }
}

function authoredShop(
  id: string,
  label: string,
  themeKey: string,
  profileId: string,
  presentationProfileId: string,
  assetId: string,
  url: string,
  x: number,
  z: number,
  rotationY: number,
  vendorId: string
): RoomDefinition {
  const base = shop(id, label, themeKey, profileId, x, z, rotationY, vendorId)
  return {
    ...base,
    asset: {
      kind: 'gltf',
      url,
      assetId,
      version: '1.0.0',
      metersPerUnit: 1,
      source: 'authored'
    },
    experience: {
      ...base.experience,
      profileId,
      presentationProfileId,
      catalogDocumentId: `catalog:${vendorId}:2026`
    },
    hotspots: authoredShopHotspots(vendorId)
  }
}

export const demoWorld: WorldDefinition = {
  id: 'paper-bazaar-15khordad-inspired',
  name: 'Paper Bazaar 3D — Charsou-inspired modern paper passage',
  version: 11,
  spawn: [0, 1.68, 18.45],
  bounds: { minX: -8.38, maxX: 8.38, minZ: -18.9, maxZ: 20.3 },
  rooms: [
    authoredShop(
      'shop:iran-paper-net',
      'شبکه کاغذ ایران',
      'iran-paper-net',
      'iran-paper-modern',
      'hero-wholesale-v1',
      'authored:hero-wholesale:v1',
      'models/hero-wholesale-v1.glb',
      -5.35,
      -13.5,
      0,
      'iran-paper-net'
    ),
    authoredShop(
      'shop:kaghaz-foroush',
      'کاغذ فروش',
      'kaghaz-foroush',
      'kaghazforoush-stockroom',
      'hero-packaging-v1',
      'authored:hero-packaging:v1',
      'models/hero-packaging-v1.glb',
      5.35,
      -13.5,
      Math.PI,
      'kaghaz-foroush'
    ),
    authoredShop(
      'shop:mellat-pub',
      'انتشارات ملت / کیمیا تجارت',
      'mellat-pub',
      'mellat-editorial',
      'hero-paper-studio-v1',
      'authored:hero-paper-studio:v1',
      'models/hero-paper-studio-v1.glb',
      -5.35,
      -3,
      0,
      'mellat-pub'
    ),
    shop('shop:kaghaz20', 'کاغذ ۲۰', 'kaghaz20', 'kaghaz20-retail', 5.35, -3, Math.PI, 'kaghaz20'),
    shop('shop:seraj-cellulose', 'سراج سلولز / برادران محمودی', 'seraj-cellulose', 'seraj-heritage', -5.35, 7.5, 0, 'seraj-cellulose'),
    shop('shop:scan-preview', 'غرفه نمونه اسکن و Digital Twin', 'scan-preview', 'scan-lab', 5.35, 7.5, Math.PI)
  ],
  staticColliders: [
    { kind: 'circle', x: 0, z: 14.65, radius: 0.78 }
  ]
}
