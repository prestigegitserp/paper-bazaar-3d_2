# v0.11 Geometry + Surface Realism Debug Report

## Why v0.11 exists

v0.10 improved material response substantially, but a material system cannot make mathematically perfect primitive geometry look photorealistic by itself.

The main remaining problems were:
- authored GLB had no UV coordinates
- almost every prop inherited the silhouette of a perfect cube
- round real-world objects were represented as boxes
- repeated paper/cardboard stock was too mechanically aligned
- micro-wear existed globally, but not at believable contact locations

## Critical UV fix

The v0.10 runtime attached PBR textures to authored materials, but the generated GLB geometry only exported POSITION and NORMAL attributes.

v0.11 exports:

```text
POSITION
NORMAL
TEXCOORD_0
```

for every generated geometry primitive.

This is now enforced by `authored-shop.test.mjs`.

## Geometry library

The generator now uses Three.js geometry classes directly in Node:

- BoxGeometry: architectural slabs / hard panels
- RoundedBoxGeometry: counters, paper reams, cartons, devices and fixtures
- CylinderGeometry: rolls, cores, pens, conduit, camera details and bell
- PlaneGeometry: reserved for thin authored surfaces / future decals

The GLB writer serializes each geometry once and reuses it across material-specific mesh definitions.

## Why bevels matter

Perfect 90° edges produce no realistic highlight width. Small bevels:
- catch area/environment light
- make roughness differences visible
- remove the toy-block silhouette
- improve scale perception

Architectural walls/floor remain sharp where appropriate; props receive restrained bevels.

## UV / PBR contract

The same PBR registry introduced in v0.10 is retained.

Authored GLB v3 now provides the UVs that registry needs, so:
- floor → mall-porcelain
- plaster → mall-plaster
- wood → bazaar-plywood

can map correctly on the file-backed model.

## Asset detail profiles

`src/assets/detailProfiles.ts` contains presentation-only detail metadata keyed by stable `assetId`.

It currently defines:
- physical paper-stock labels
- lower-wall smudge
- floor scuff
- glass fingerprint
- counter kick scuff

This intentionally does not live in Catalog/Vendor data.

A future server can deliver or version this layer independently from commercial data.

## Decal implementation

`SurfaceDecal` produces deterministic CanvasTexture maps and renders them on physical planes.

Properties:
- WebGL depth tested
- no DOM overlay
- deterministic seed
- low opacity
- no global random state
- disposable GPU textures
- polygon offset to avoid z-fighting

## Procedural rooms

The reusable `BeveledBox` component upgrades selected high-visibility props in procedural rooms without altering:
- hotspot identity
- collider definitions
- vendor data
- room transforms

## Tone mapping

v0.11 switches the renderer from ACES Filmic to AgX.

The intent is not a stylistic filter; it is to keep bright fixtures, reflective metal and transmitted glass from clipping into the same harsh highlight response.

## Regression gates

CI checks:
- GLB v2 validity
- semantic hotspot nodes
- UV accessor on every generated mesh primitive
- cylinder geometry for paper rolls
- rounded geometry for stock bundles
- hard geometry retained for architectural walls
- detail profile registry
- physical decal implementation
- reusable procedural bevel component
- AgX tone mapping
- all v0.10 PBR/material tests
- all world/catalog/crawler/visual-label tests
- TypeScript build
- production Vite build
