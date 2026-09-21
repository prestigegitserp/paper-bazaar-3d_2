# v0.10 Material Realism Debug Report

## هدف

v0.10 روی مشکل اصلی باقی‌مانده‌ی تجربه تمرکز دارد: geometry قابل‌قبول بود اما جنس سطوح هنوز بیش از حد CG و تخت دیده می‌شد.

## Root causes

- `mall-porcelain` و `mall-plaster` در v0.9 فقط procedural fallback داشتند.
- authored GLB از flat glTF colors استفاده می‌کرد و PBR registry مشترک را مصرف نمی‌کرد.
- نور ambient زیاد contrast normal/roughness را تخت می‌کرد.
- texture filtering در زاویه‌های کم برای کف بهینه نشده بود.
- Sparkles و grout دستی با هدف واقع‌گرایی سازگار نبودند.
- reflection environment سراسری برای metal/glass وجود نداشت.

## Material pipeline v0.10

```text
Surface ID
   ↓
PBR Registry
   ↓
Shared Texture Cache
   ├─ Albedo 1K
   ├─ Normal GL 1K (Cinematic)
   └─ Roughness 1K (Cinematic)
   ↓
Physical Profile
   ├─ clearcoat
   ├─ envMapIntensity
   ├─ anisotropy
   └─ normal scale
   ↓
Procedural room OR authored GLB
```

Balanced mode:
- real albedo where available
- lower anisotropy
- reduced physical extras
- procedural bump fallback

Cinematic mode:
- albedo + normal + roughness
- up to 8x anisotropic filtering depending on GPU
- clearcoat / anisotropy / stronger environment response
- soft shadow shader

## Modern passage materials

### mall-porcelain
Poly Haven Floor Tiles 04:
- subtle pale marble variation
- grout and wear are part of the source material
- manual fake grout overlay removed
- clearcoat kept restrained to avoid a wet/plastic floor

### mall-plaster
Poly Haven White Plaster 02:
- fine micro roughness and dirt speckle
- lower environment response than floor/metal
- low normal strength to avoid exaggerated concrete appearance

## Authored GLB

The authored model keeps simple material identities in the generated GLB:
- floor
- plaster
- wood
- metal
- silver
- glass
- paper
- cardboard

At runtime v0.10 upgrades them to `MeshPhysicalMaterial`.

Real texture bindings:
- floor → mall-porcelain
- plaster → mall-plaster
- wood → bazaar-plywood

Physical-only upgrades:
- glass → transmission + IOR + thickness + clearcoat
- metal/silver → high metalness + anisotropy + environment reflection
- paper/cardboard → high roughness + low environment response

This keeps the authored asset contract generic; a future Blender/scanned GLB can replace the generated asset without moving business data into the renderer.

## Lighting / reflections

`MaterialEnvironment` builds a local PMREM using Three.js `RoomEnvironment`; it does not require a remote HDRI.

Changes:
- ambient light reduced
- hemisphere fill reduced
- directional key slightly strengthened
- shadow normal bias tuned
- ACES exposure raised slightly
- Sparkles removed
- Cinematic uses soft shadows

The goal is stronger material separation rather than a brighter scene.

## Macro imperfections

`FloorImperfections` creates a deterministic low-opacity CanvasTexture with:
- broad soft smudges
- sparse directional scuffs
- no repeating UI-like pattern

This layer is intentionally subtle and separate from the base PBR material.

## Performance

- PBR source textures are cached once per URL.
- each consumer receives cloned texture transforms while image data remains shared by Three.js.
- Cinematic caps anisotropy at 8x or GPU maximum.
- Balanced caps at 4x and skips normal/roughness network maps.
- no remote HDR environment is required.
- material textures are disposed when room/material instances are released.

## Regression gates

CI now checks:
- modern passage PBR registry entries
- normal/roughness availability in the registry
- shared texture cache
- physical material usage
- environment reflection component
- authored GLB → shared PBR mapping
- absence of Sparkles
- absence of manual tile-grout overlay
- existing room/world/catalog/crawler and visual-label regressions
- TypeScript + production Vite build
