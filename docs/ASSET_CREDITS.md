# Asset credits

v0.7 uses optional remote PBR textures. All listed Poly Haven assets are published as **CC0** by their source pages. Runtime code requests 1K JPG maps from the Poly Haven download CDN and falls back to locally generated procedural materials if a texture cannot load.

| Surface ID | Asset | Source | Runtime maps |
|---|---|---|---|
| `bazaar-brick` | Worn Brick Wall | https://polyhaven.com/a/worn_brick_wall | diffuse, normal GL, roughness |
| `bazaar-plaster` | Worn Plaster Wall | https://polyhaven.com/a/worn_plaster_wall | diffuse, normal GL, roughness |
| `bazaar-floor` | Worn Tile Floor | https://polyhaven.com/a/worn_tile_floor | diffuse, normal GL, roughness |
| `bazaar-shutter` | Painted Metal Shutter | https://polyhaven.com/a/painted_metal_shutter | diffuse, normal GL, roughness |
| `bazaar-plywood` | Plywood | https://polyhaven.com/a/plywood | diffuse, normal GL, roughness |

## Why remote + fallback?

GitHub Pages is currently a static demo. Keeping stable semantic surface IDs lets us use a high-quality visual layer now without coupling booth definitions to storage. When the project moves to a server/CDN, the same registry can be pointed to owned KTX2/WebP assets.

## 15 Khordad / Tehran Bazaar references

The scene is an original conceptual environment inspired by visual characteristics visible in public references of Tehran Grand Bazaar and the 15 Khordad / Beynolharamein area: compact deep shops, dense shelving, glass counters, Persian handwritten labels, metal shutters and brick-vaulted passages.

It is **not** represented as a photogrammetric reconstruction or an exact replica of any specific shop, passage or property.


## v0.10 material realism additions

| Surface ID | Asset | Source | Runtime maps |
|---|---|---|---|
| `mall-porcelain` | Floor Tiles 04 | https://polyhaven.com/a/floor_tiles_04 | diffuse, normal GL, roughness |
| `mall-plaster` | White Plaster 02 | https://polyhaven.com/a/white_plaster_02 | diffuse, normal GL, roughness |

Both assets are published under Poly Haven's CC0 license. v0.10 uses the 1K JPG variants at runtime, with procedural fallbacks if the remote assets are unavailable.

The same registry is consumed by procedural React rooms and by the authored GLB material-upgrade layer, so material identity is not duplicated between renderers.


## v0.14 wood material additions

| Surface ID | Asset | Source | Runtime maps |
|---|---|---|---|
| `wood-walnut` | Walnut Veneer | https://polyhaven.com/a/walnut_veneer | diffuse, normal GL, roughness |
| `wood-oak` | Oak Wood Planks | https://polyhaven.com/a/oak_wood_planks | diffuse, normal GL, roughness |

Both source pages identify the assets as CC0. The runtime keeps the same progressive 1K/2K loading and 1K fallback path used by the rest of the PBR registry.
