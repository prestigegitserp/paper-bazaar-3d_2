# v0.16 Production Art + Portable Asset Runtime

## Repository boundary

v0.16 is the first feature release developed exclusively in `prestigegitserp/paper-bazaar-3d_2`.

The legacy repository is not part of the write path anymore. Its stable v0.15 snapshot was imported once, then preserved in the new repository as `release/v0.15.0`.

## Root problem

v0.15 had a strong runtime foundation but still looked like one system repeatedly dressing procedural rooms. The visible ceiling was no longer a shader problem. The project needed content diversity and a renderer contract that could accept future Blender, LiDAR or photogrammetry rooms without new renderer branches.

## Structural treatment

### Presentation profiles

Room business data and presentation policy are now separate.

A room selects:
- an asset
- a business/vendor identity
- an optional `presentationProfileId`

The presentation registry controls:
- file residency distances
- procedural hibernation distances
- PBR material bindings
- hero lighting
- atlas dressing
- transparent/tiny-prop shadow policy

This keeps future scan replacement compatible with the existing catalog and interaction layer.

### Three production hero spaces

The build emits three separate GLBs:
- `hero-wholesale-v1.glb`
- `hero-packaging-v1.glb`
- `hero-paper-studio-v1.glb`

All three retain the same semantic hotspot node names so the interaction layer does not care which visual asset is installed.

The variants deliberately differ in authored work context:
- wholesale: paper rolls, cores, pallet, strapped bundle
- packaging: stacked cartons, cutting table, twine and tape
- studio: swatch wall, sample island, books and stools

## Texture pipeline

v0.16 adds a deterministic 1024x1024 material atlas with 16 authored tiles.

CI installs KTX-Software 4.4.2 and converts the atlas to KTX2 using ETC1S + mipmaps. The static build includes the Three.js Basis transcoder.

Runtime:
1. attempts KTX2 through `KTX2Loader`
2. detects GPU support
3. falls back to PNG if compressed content is unavailable
4. shares atlas tile texture variants across hero material instances

The KTX2 decoder is dynamically imported, so generic file/scan rendering does not pay its JavaScript cost until an authored hero room becomes resident.

## Art direction

The scene palette moved away from cyber-blue toward:
- warm paper / kraft neutrals
- dark charcoal fixtures
- muted green
- brass/gold highlights

Hero profiles have local key/fill/rim lighting. All hero lights are shadow-free so they improve presentation without adding shadow-map passes.

## Performance treatment

- v0.15 procedural wake/sleep thresholds remain 11.5m / 15.5m
- file/scan and procedural LOD budgets are separate
- each hero can have a different prefetch/reveal/sleep policy
- tiny authored props do not cast shadows by default
- transparent authored props do not cast shadows by default
- repeated meshes still batch into InstancedMesh
- file rooms still re-hibernate while cached assets remain reusable
- KTX2/Basis is code-split from the generic file renderer
- one compressed atlas replaces many potential prop-specific color textures

## Scan compatibility

A future GLTF scan can reuse:
- `RoomDefinition`
- `presentationProfileId`
- file residency
- semantic point/node hotspots
- fallback proxy
- catalog/vendor/document contracts

A production scan can therefore replace one room asset without creating a second world architecture.

## Release gates

v0.16 CI must:
- pass all historical regression contracts
- pass v0.16 profile/atlas/hero tests
- install KTX-Software
- generate three hero GLBs
- generate PNG atlas
- generate non-empty KTX2 atlas
- include Basis transcoder
- pass TypeScript + Vite production build
- deploy only from new-repository `main`
