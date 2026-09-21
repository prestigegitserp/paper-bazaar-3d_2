# Changelog

## 0.15.0 — Human market runtime

### Lineage
- built directly on stable `release/v0.14.0`
- preserves every release snapshot through v0.14
- leaves the older experimental v0.15 branch untouched and does not use it as ancestry

### Performance
- re-hibernates file-backed GLB/scan renderers at 22m while retaining prefetched cache
- adds broad view-aware procedural-room budgeting while preserving v0.14 distance hysteresis
- removes transmission from six decorative passage glass bays
- makes passive interaction raycasts pose/time based instead of refresh-rate based
- removes frame callbacks and point lights from inactive interaction halos
- narrows InteractiveNode Zustand subscriptions to local active booleans
- reduces dormant storefront text texture resolution
- expands F3 diagnostics with FPS, frame time, raycasts/s and room-budget counts

### Human interaction
- E inspect, F quick sample, C quick quote, G nearest-unvisited guide
- multi-vendor quote basket and side-by-side observed-price/unit comparison
- copyable quote draft
- non-blocking action feedback for sample/favorite/quote

### Hero authored shop
- generated authored shop v4
- adds torus geometry plus order/packing/sample context props
- adds a local no-shadow hero spotlight only while the file renderer is mounted

## 0.14.0 — Living market root treatment

### Lineage
- built directly on stable `release/v0.13.0`
- preserves all release snapshots through v0.13

### Performance
- procedural booth interiors hibernate outside an 11.5m wake radius and fall back to lightweight storefront proxies
- 15.5m sleep hysteresis prevents mount/unmount thrash
- shared 256×128 wear-decal cache replaces repeated high-resolution per-instance decal canvases
- preserves v0.13 adaptive DPR, shader warm-up, static shadows, file streaming and staged texture upload

### Materials / environment
- adds verified CC0 PBR routes for walnut veneer and oak planks
- enriches procedural wood with knots and grain drift
- enriches plaster with broad low-frequency blotching
- enriches metal with sparse scratches
- applies generated micro roughness across fallback surfaces
- adds scuffs, grime, fingerprints, loose receipts, used cups, taped cartons and packing-tape props to near-range shops

### Interaction / gameplay
- adds direct in-world sample interactions for up to three catalog products per vendor
- product lists now inspect products in-app before linking externally
- adds collect-sample and favorite-for-comparison actions
- adds exploration/product/sample scoring
- adds compact market mission progress HUD

## 0.13.0 — Photoreal performance rebuild from v0.12

### Lineage
- rebuilt directly from `release/v0.12.0`
- preserves all release snapshots through v0.12
- experimental post-v0.12 work is not treated as ancestry for this release

### Performance
- static cinematic shadow maps update on scene events rather than every frame
- repeated passage columns and ceiling fixtures use instancing
- removes unnecessary floor geometry subdivisions
- keeps all visible light fixtures while reducing real point-light count
- throttles file-stream distance probes and removes square-root distance work
- freezes local matrices for static authored geometry
- diagnostics frame sampling exists only while F3 is open
- suppresses stationary player-position store writes
- uses ImageBitmap decoding when supported
- serializes GPU texture warm-up during idle time
- adds motion-triggered adaptive DPR so movement gets more frame budget while still frames return to full configured resolution
- warms current shader programs with idle compileAsync and treats warm-up failure as non-blocking
- builds PMREM once per started renderer lifecycle instead of rebuilding it on every quality toggle

### Materials
- adaptive 1K/2K PBR based on quality/device capability
- automatic 2K → 1K fallback
- close-range clearcoat micro-normal detail
- paper/cardboard micro bump and roughness detail
- adds deterministic local paper/cardboard fiber albedo on authored UVs with no extra network request
- uses generated micro roughness during albedo-only PBR phases so close surfaces do not become uniformly glossy/flat while full maps stream
- keeps real PBR normal maps authoritative rather than combining them incorrectly with bump maps

### Interaction safety
- structural meshes remain raycastable as occluders
- only tiny decorative instance batches may opt out of raycast
- semantic hotspot behavior remains unchanged

## 0.12.0 — Progressive loading without visual downgrade

### Startup
- keeps the v0.11 visual/detail stack intact
- Canvas runs demand-mode with reduced intro DPR until the visitor enters
- defers shadow maps, PMREM environment, floor-imperfection canvas and SoftShadows until start
- Catalog Reader is a true interaction-time dynamic import

### File-backed assets
- GLB/scan files prefetch by player distance instead of at page startup
- 24m prefetch / 18m reveal thresholds provide loading headroom
- local Suspense fallback keeps the rest of the world rendered during file decoding
- loaded file assets stay resident to avoid reparse thrash

### GPU / draw calls
- repeated non-interactive authored meshes are consolidated into InstancedMesh groups
- semantic hotspot nodes and transparent glass remain individual and interactive
- no geometry/detail reduction is used

### Textures
- identical PBR variants use ref-counted shared residency
- PBR texture-set builds are capped at two concurrent jobs
- critical passage albedo can load early; noncritical materials are staggered
- Cinematic normal/roughness upgrades are scheduled after interaction/idle time
- procedural fallback variants are shared by surface/repeat/anisotropy key


## 0.11.0 — Geometry + surface realism

### Authored GLB v3
- fixes a critical realism gap: authored geometry now exports UV coordinates
- replaces the single hand-built cube primitive with reusable box, rounded-box, cylinder and plane geometries
- adds physically rounded edges to retail props while leaving architectural slabs intentionally sharp
- converts paper rolls, cores, pens, conduits, CCTV lens/arm and service-bell details to cylindrical geometry
- adds carton flaps, calculator keys and subtle deterministic placement/rotation variation
- bumps the generated runtime asset to `iran-paper-authored-v3.glb`

### Local detail layer
- adds asset-specific detail profiles keyed by stable assetId
- adds physical paper-package labels without coupling to vendor business data
- adds subtle wall smudges, floor scuffs and counter-glass fingerprints
- all detail layers are WebGL meshes and respect scene depth/occlusion

### Procedural scene
- introduces reusable `BeveledBox`
- upgrades major counter, product-display, bench, cart and kiosk edges without changing interaction/collision contracts

### Rendering
- moves global tone mapping to AgX for more controlled highlight rolloff
- preserves v0.10 PBR, anisotropy, environment reflections and soft-shadow behavior

## 0.10.0 — Material realism pass

### PBR
- adds real CC0 PBR maps for modern porcelain floor and clean white plaster
- shared PBR texture cache serves procedural rooms and authored GLB materials
- Cinematic loads albedo + normal + roughness; Balanced keeps a lighter path
- adds anisotropic filtering, clearcoat profiles and per-surface environment response

### Lighting / physical response
- adds local PMREM RoomEnvironment for glass/metal/floor reflections
- reduces flat ambient fill and strengthens material-readable key light
- adds softer cinematic shadows and removes decorative Sparkles
- removes manual floor grout overlay now that grout/wear comes from real tile material

### Authored shop
- upgrades generated GLB materials to MeshPhysicalMaterial at runtime
- floor/plaster/wood consume shared PBR registry
- glass gets transmission, thickness and IOR
- metals get stronger reflection and anisotropy
- paper/cardboard use restrained environment response

### Imperfections
- adds subtle deterministic macro floor smudges and scuffs
- keeps imperfections separate from business/world definitions


## 0.9.0 — Charsou-inspired modern passage + physical world text

### Environment
- replaces the dominant brick vault with a bright porcelain-tile retail passage
- adds white ceiling panels, linear lights, dark metal reveals and cleaner glass infill bays
- keeps brick only as a restrained heritage accent
- adds modern entrance planters, bench and information kiosk while moving wholesale clutter to the corridor edges

### Visual bug fix
- removes Drei Html / DOM overlays from in-world signage
- adds depth-tested CanvasTexture text panels on actual meshes
- storefront signs, wayfinding, shelf tickets, product labels and price boards now occlude naturally behind scene geometry
- HUD and catalog reader remain DOM by design

### Authored shop v2
- adds shelf lips, bundle straps, counter glass shelf, receipt printer, tape dispenser, pen cup, drawers and handles
- adds power outlet, cable trunk, CCTV, HVAC vent/slats, waste bin, brochure holder, service bell, carton tape and physical price tickets
- generated artifact bumped to `iran-paper-authored-v2.glb`

### Architecture
- keeps semantic node hotspots, independent colliders and RuntimeBundle repositories
- visual skin remains replaceable without changing Catalog/Document/server contracts


## 0.8.0 — Authored GLB shop + scoped world labels

### Authored asset pipeline
- first deterministic, file-backed authored shop in the live World
- build-time GLB generator with stable semantic node names
- generated GLB is emitted to `public/models` before dev/build
- authored room keeps independent World colliders and business data

### Interaction / Digital Twin
- adds `node` hotspot anchors for GLB and GLTF scan rooms
- renderer attaches semantic interactions to cloned named model nodes
- retains point hotspots as a fallback
- world validator rejects node hotspots on incompatible assets and slot hotspots on file-backed rooms

### Visual calm
- adds `RoomScopedHtml`
- interior labels only mount for the active room
- neighboring booth labels no longer bleed through walls/shops
- storefront signage remains intentionally readable from the aisle

### Logic / debug
- exact room containment now wins before discovery proximity
- discovery fallback chooses the nearest eligible room instead of depending on room array order
- adds authored GLB structure test
- adds active-room behavior tests
- adds a visual regression test preventing raw Drei Html in interior fixture modules


## 0.7.0 — 15 Khordad-inspired photoreal market pass

### Environment
- narrows the market aisle and moves shopfronts closer to the pedestrian corridor
- replaces the flat exhibition ceiling with a brick barrel-vault interior and repeated masonry ribs/piers
- adds fluorescent aisle fixtures, visible electrical runs, worn floor treatment and closed infill shutters between active shops
- removes decorative planters and adds delivery cart, cardboard stock, folding stool, paper rolls and a bicycle for market density

### Shops
- replaces gallery/neon storefront language with metal frames, rolled or half-open shutters and compact Persian shop signs
- glass sales counters with merchandise inside
- denser floor-to-ceiling stock walls and handwritten yellow shelf labels
- paper sample walls, swatch fans, stock pallets, roll racks, book walls, pegboards and shipping cartons remain profile-driven
- shop fixtures split into smaller modules for easier future authoring

### Materials
- adds network-safe PBR surface registry with procedural fallback
- integrates 1K CC0 Poly Haven materials for worn brick, worn plaster, worn tile floor, painted metal shutter and plywood
- Cinematic loads color + normal + roughness maps; Balanced keeps a lighter path
- PBR failures never crash the room and fall back to generated textures

### Architecture
- preserves RuntimeBundle, semantic interactions, scan/GLB renderer boundary and document reader
- world layout and colliders updated for the narrower alley and new glass-counter orientation
- v0.7 remains server/CMS-ready and does not encode business data into renderer components

## 0.6.0 — Modular retail experience + interactive catalogs

### Retail realism
- six distinct booth profiles instead of one shared shop layout
- procedural surface registry for plaster, wood, aged brick, terrazzo, paper, fabric and brushed metal
- configurable fixture sets: sample walls, roll racks, pallet stacks, book walls, pegboards, acrylic cases, print frames and swatch fans
- vendor-specific layout coordinates and lighting profiles

### Interaction
- physical catalog prop on each vendor desk
- new semantic `document` interaction independent from renderer meshes
- responsive two-page catalog reader with keyboard navigation and mobile single-page mode
- generated product pages, paper swatches, store story and source/contact pages

### Architecture
- Runtime repository contracts for Catalog, World and Documents
- runtime bundle loader with API-first catalog + seed fallback
- World and Documents promoted to app state; HUD and scene no longer import demoWorld directly
- booth instance config now references stable profile IDs so server data can select renderer behavior without embedding React logic

### Digital Twin path
- scan/GLB renderer boundary remains intact
- procedural surface IDs can later map to CDN-hosted PBR/KTX2 assets without changing booth templates
- point hotspots and semantic actions remain suitable for scanned rooms

## 0.5.0 — Tehran paper alley + mobile controls

### Environment
- expands the world from 4 rooms to 6 shops/spaces
- replaces the glossy exhibition-hall mood with a narrower Tehran paper-market alley
- adds warm plaster/brick materials, arch ribs, Persian shop signs, awnings and dense paper shelves
- adds Seraj Cellulose as an additional sourced vendor
- keeps one dedicated scan-ready room for the first real GLB/LiDAR experiment

### Camera / interaction
- mouse wheel zoom now changes camera FOV inside the 3D world instead of relying on browser zoom
- two-finger pinch and mobile +/- buttons control the same camera zoom
- key 0 resets camera zoom
- mobile virtual joystick, touch-look zone, interact and reset controls
- mobile movement remains collision-aware and uses the same world/navigation contracts as desktop

### Performance
- mobile/coarse-pointer devices start in Balanced mode automatically
- lower mobile DPR and shadows disabled in Balanced mode
- repeated shelves, paper bundles, arch ribs and floor marks use instancing
- removes the expensive mirrored aisle from the default market skin
- fewer real-time lights while preserving emissive fixtures and warm visual contrast

### Versioning / deployment
- release/v0.3.0 and release/v0.4.0 snapshot branches preserve previous milestones
- main remains the latest stable release line
- every push/merge to main builds and deploys the latest version once GitHub Pages is enabled once in repository Settings


## 0.4.0 — Immersive experience foundation

### Visual
- polished reflective central aisle with a balanced fallback mode
- denser architectural ceiling, wayfinding signs and light rails
- kinetic paper sculpture and lounge decor
- illuminated booth portal frames and improved physical materials
- cinematic/balanced quality toggle with adaptive DPR

### Interaction
- smoother accelerated/decelerated movement
- subtle head bob and sprint FOV response
- active-room detection and room toast
- clickable mini-map fast navigation
- interaction halo for the currently targeted hotspot
- keyboard shortcuts: R reset, Q quality, M map, F3 diagnostics

### Digital twin / scans
- room collision moved out of the renderer and into WorldDefinition
- asset metadata now has stable asset id, version and meters-per-unit
- GLB/scan URLs are base-path aware for static hosting
- room-level Error Boundary prevents one broken asset from crashing the world
- asset failures are exposed in runtime diagnostics
- point hotspots remain independent from GLB mesh names

### Operations
- GitHub Pages build/deploy workflow added
- static-demo mode avoids failed API requests on GitHub Pages
- version bumped to 0.4.0
- Docker remains intentionally out of scope

## 0.3.0 — Modular digital-twin foundation

- separated Catalog, World, Engine and crawler concerns
- added procedural/GLTF room rendering boundary
- added semantic hotspots and catalog fallback
- added crawler source-adapter registry and server tests
