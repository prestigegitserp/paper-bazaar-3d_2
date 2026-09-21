# v0.13 Deep Performance + Material Realism Report

## Lineage

This v0.13 candidate is intentionally built with release/v0.12.0 as its direct parent.

The previous post-v0.12 experimental/release history is not merged into this lineage. Proven techniques are re-applied as code/content on top of v0.12 so release snapshots through v0.12 remain untouched.

## Non-negotiable constraints

- preserve authored GLB v3, UVs, bevels, semantic nodes and scan-ready contracts
- preserve first-visible-hit interaction occlusion
- preserve World / Catalog / Documents separation
- do not improve FPS by deleting retail detail
- do not globally preload high-resolution textures
- keep Balanced and Cinematic behavior semantically identical

## Re-applied proven performance work

- static/event-driven cinematic shadow maps
- repeated architecture instancing
- reduced real PointLight count while preserving visible fixtures
- throttled squared-distance GLB streaming probes
- FileRoomRenderer code split
- stationary Zustand player-write suppression
- diagnostics gating
- ImageBitmap texture decode fallback path
- serialized idle GPU texture warm-up
- adaptive 2K albedo with 1K normal/roughness detail channels
- hardened texture lease/upload failure paths

## Deep performance pass

### Motion-adaptive DPR

Movement and pointer/touch look call the R3F performance regression mechanism. AdaptiveDpr temporarily lowers pixel density only during motion and restores the configured DPR after the debounce window.

This does not remove geometry, textures, lights, interactions or authored detail.

### Idle shader warm-up

SceneWarmup schedules WebGLRenderer.compileAsync during idle time after start and after meaningful scene/quality transitions. Failure is deliberately non-blocking because rendering remains authoritative.

### PMREM lifecycle

The previous environment effect regenerated PMREM whenever quality changed even though only environmentIntensity needed to change.

v0.13 separates:
- environment creation lifecycle
- quality/intensity lifecycle

The expensive environment generation is idle-scheduled and no longer tied to the Q toggle.

## Material realism pass

### Paper/cardboard fiber albedo

Authored paper and cardboard now receive a deterministic local 128px fiber color texture using their real GLB UVs.

Properties:
- no external request
- shared generated cache
- sRGB-correct
- subtle multiplier over the physical material base color
- different paper/cardboard surface seeds

### Micro roughness bridge

During progressive PBR loading, the albedo-only phase previously had no roughness map. A generated micro-roughness variant now bridges that phase, and procedural paper/wood/plaster-style surfaces can retain subtle roughness variation even without an external map.

External full-PBR roughness remains authoritative once loaded.

### Channel safety

- full PBR normal remains the primary normal channel
- clearcoat detail uses clearcoatNormalMap
- paper/cardboard use restrained bump + roughness when no full PBR normal owns that channel
- no fake sparkle or manual grout overlay is introduced

## Regression gates

The candidate must pass:
- all v0.12 regression tests
- rebuilt v0.13 performance/occlusion tests
- deep performance tests for AdaptiveDpr, compileAsync and PMREM lifecycle
- material micro-detail tests
- TypeScript production build
- GitHub Pages production build

## Deliberately not claimed in this release

KTX2/Basis, a Blender artist-authored hero shop and a production scan are still separate next milestones. This release improves the current runtime honestly without pretending generator-authored geometry is already a scanned digital twin.
