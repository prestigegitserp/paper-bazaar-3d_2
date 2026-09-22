# v0.17 Root Performance + Baked Realism Debug Report

## Lineage

- Repository: `prestigegitserp/paper-bazaar-3d_2`
- Base: stable `release/v0.16.0` at `14b208e4ab97b26e3eb20a73670d6cc968078268`
- Before creating the official v0.17 feature branch, the repository was checked for v0.17 branches and none existed.
- No historical release branch is rewritten or deleted.

## Why v0.16 could still hitch

The v0.16 architecture had accumulated several independent costs that were individually reasonable but expensive together:

1. Canvas returned to `frameloop="always"` after entry.
2. AdaptiveDpr was mounted twice.
3. Cinematic mode injected Drei PCSS SoftShadows.
4. Corridor lighting kept multiple real Point/Spot lights.
5. Common surfaces used MeshPhysicalMaterial even when clearcoat/transmission were not materially useful.
6. Three authored Hero rooms could each mount local multi-light rigs.
7. Every room owned separate procedural and file residency frame callbacks.
8. Interaction had both a custom center-screen raycaster and R3F pointer-event raycasting.
9. The custom interaction raycaster still traversed the full scene even when no interactable target was under the reticle.
10. PMREM and shader compilation work was allowed to happen after interaction had started.
11. Full-floor transparent wear added fill-rate/overdraw.
12. Circle collision used square roots in a hot movement path.

The root treatment removes these stacked costs instead of tuning only one of them.

## Render-loop surgery

### Demand rendering everywhere

The Canvas is now permanently demand-rendered. Player input explicitly invalidates the renderer only while:
- movement is still settling
- mouse/touch look changes
- FOV is changing
- navigation teleports the player
- assets/materials finish asynchronous upgrades

The movement scheduler targets approximately:
- 60 render requests/second in Cinematic
- 45 render requests/second in Balanced

This prevents 120/144Hz displays from forcing equivalent scene renders solely because the panel refreshes faster.

### DPR

Configured DPR bands are narrower:
- Cinematic: 0.82–1.28
- Balanced: 0.62–1.0

AdaptiveDpr remains mounted once. Motion regression remains the quality pressure valve.

## GPU surgery

### Physical shader budget

Common environment surfaces are now MeshStandardMaterial.

Physical shading remains only for authored hero glass in Cinematic mode.

Removed from general surfaces:
- global clearcoat
- clearcoat normal channel
- anisotropy extension
- physical fragment shader path

### Lighting

Removed:
- corridor PointLight fan-out
- corridor decorative SpotLights
- three-light Hero rig
- PCSS SoftShadows

Retained:
- emissive visible light fixtures
- hemisphere/ambient/directional base
- one conditional no-shadow Hero spotlight when the player is inside that room and performance has recovered
- static event-driven shadow map

Primary shadow map is 1024 rather than 1536.

### Overdraw and transmission

The transparent full-floor imperfection plane is removed.
Three.js transmission render-target resolution is set to 0.5.

## CPU surgery

### Unified room runtime

Each RoomRenderer used to have two independent frame callbacks:
- procedural-detail probe
- progressive-file probe

v0.17 merges them into one `useRoomRuntime` callback while preserving:
- file prefetch/reveal/sleep hysteresis
- procedural wake/sleep hysteresis
- active-room force detail
- camera-facing budget

### Two-stage interaction broadphase

All semantic interaction roots register in a compact Set.

Passive targeting now performs:
1. raycast against registered interaction roots
2. only if a target is hit: exact full-scene raycast up to the target distance to preserve structural occlusion

The old duplicate R3F onPointerOver/onClick 3D event path is removed.

This preserves the important rule that walls/fixtures can block interactions while making the no-target case much cheaper.

### Collision

Circle collision uses squared distance and no longer calls Math.hypot on the movement path.

## Loading / stutter surgery

PMREM environment preparation and compileAsync warm-up are scheduled before interaction-time movement rather than being tied to room changes.

Authored full PBR texture upgrades:
- keep KTX2/shared-atlas fallback
- use 1K detail
- run only in Cinematic
- wait until renderer performance is approximately recovered

## Realism treatment

v0.17 does not claim AAA content production. Its realism treatment is deliberately low-frame-cost:

- common paper/plaster/wood no longer looks globally clear-coated/plastic
- generated Hero GLBs include `COLOR_0` baked vertex lighting
- baked lighting adds baseline directional/contact depth without extra per-frame lights
- existing v0.16 KTX2 atlas, wear decals, signage, three distinct hero variants and scan-ready asset architecture remain intact

The next major realism ceiling remains asset production quality (artist-authored/scanned geometry and real authored texture sets), not additional runtime lights.

## Diagnostics

F3 now reports:
- draw calls
- triangles
- geometries
- textures
- rendered FPS / frame ms
- interaction target scans per second
- exact full-scene occlusion scans per second
- resident interaction target count
- actual renderer pixel ratio
- proxy/detail/file room counts

## CI gates

v0.17 adds tests that reject regressions back to:
- always frameloop
- duplicate AdaptiveDpr
- SoftShadows
- corridor realtime light fan-out
- physical-everywhere materials
- duplicate room-residency callbacks
- full-scene-first interaction raycasts
- room-change shader warm-ups

It also verifies baked GLB vertex colors and the preserved v0.16 KTX2/scan architecture.
