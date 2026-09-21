import type { Catalog, Vendor } from '../../domain/catalog'
import type { CatalogDocument, CatalogPage, CatalogSwatch } from '../../domain/document'
import type { WorldDefinition } from '../../world/types'

const fallbackPalette = ['#f4f0e8', '#d8c7a8', '#cab998', '#b7d7d9', '#d9c0b8', '#d6d2e8']

function hashText(value: string) {
  let hash = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return Math.abs(hash >>> 0)
}

function vendorSwatches(vendor: Vendor, accent: string): CatalogSwatch[] {
  const seed = hashText(vendor.id)
  const names = ['سفید طبیعی', 'استخوانی', 'کرافت', 'آبی اداری', 'صورتی نمونه', 'یاسی چاپ']
  return names.map((name, index) => ({
    id: `${vendor.id}:swatch:${index}`,
    name,
    color: index === 2 ? '#b88b58' : index === 3 ? accent : fallbackPalette[(seed + index) % fallbackPalette.length],
    description: index % 2 === 0 ? 'نمونه مفهومی برای نمایش بافت و رنگ کاغذ' : 'مناسب مقایسه‌ی بصری در کاتالوگ دیجیتال'
  }))
}

function productPages(vendor: Vendor): CatalogPage[] {
  const pages: CatalogPage[] = []
  for (let index = 0; index < vendor.products.length; index += 3) {
    pages.push({
      id: `${vendor.id}:products:${index / 3}`,
      kind: 'products',
      eyebrow: 'PRODUCT INDEX',
      title: index === 0 ? 'محصولات و قیمت‌های نمونه' : 'ادامه محصولات',
      body: 'قیمت‌ها snapshot دمو هستند و برای معامله نهایی باید از فروشنده استعلام شوند.',
      productIds: vendor.products.slice(index, index + 3).map((product) => product.id)
    })
  }
  return pages
}

export function buildVendorDocuments(catalog: Catalog, world: WorldDefinition): CatalogDocument[] {
  const roomByVendor = new Map(
    world.rooms
      .filter((room): room is typeof room & { vendorId: string } => Boolean(room.vendorId))
      .map((room) => [room.vendorId, room])
  )

  return catalog.vendors.map((vendor) => {
    const room = roomByVendor.get(vendor.id)
    const accent = room?.theme.accent ?? '#c99553'
    const secondary = room?.theme.secondary ?? '#efe5d2'
    const productCount = vendor.products.length

    const pages: CatalogPage[] = [
      {
        id: `${vendor.id}:cover`,
        kind: 'cover',
        eyebrow: 'PAPER BAZAAR / DIGITAL CATALOG',
        title: vendor.name,
        body: vendor.tagline,
        callout: `${productCount} قلم نمونه در نسخه نمایشی`
      },
      {
        id: `${vendor.id}:story`,
        kind: 'story',
        eyebrow: 'ABOUT THE SHOP',
        title: 'راهنمای غرفه و خدمات',
        body: 'این کاتالوگ به صورت داده‌محور ساخته شده و بعداً می‌تواند مستقیم از CMS، ERP یا پنل فروشنده تغذیه شود.',
        bullets: [
          'مشاهده کالاها و قیمت ثبت‌شده',
          'مقایسه نمونه‌های کاغذ و رنگ',
          'دسترسی به وب‌سایت و اطلاعات فروشنده',
          'آماده برای نسخه‌های PDF و اسناد واقعی'
        ]
      },
      ...productPages(vendor),
      {
        id: `${vendor.id}:samples`,
        kind: 'samples',
        eyebrow: 'PAPER SWATCHES',
        title: 'نمونه‌های کاغذ و رنگ',
        body: 'این swatchها فعلاً مفهومی‌اند؛ در نسخه سروری می‌توان تصویر/اسکن واقعی نمونه کاغذ، گرماژ و مشخصات فنی را از دیتابیس دریافت کرد.',
        swatches: vendorSwatches(vendor, accent)
      },
      {
        id: `${vendor.id}:contact`,
        kind: 'contact',
        eyebrow: 'CONTACT / SOURCE',
        title: vendor.shortName,
        body: vendor.website,
        callout: 'برای قیمت قطعی و موجودی، منبع اصلی فروشنده را بررسی کنید.'
      }
    ]

    return {
      id: `catalog:${vendor.id}:2026`,
      vendorId: vendor.id,
      title: `کاتالوگ ${vendor.name}`,
      subtitle: 'Paper Bazaar 3D · Interactive Edition',
      edition: '2026 / v1',
      accent,
      secondary,
      pages
    }
  })
}
