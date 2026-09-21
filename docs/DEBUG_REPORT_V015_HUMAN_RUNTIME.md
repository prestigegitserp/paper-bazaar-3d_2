# v0.15 Human Market Runtime / Deep Performance Pass

## Lineage

v0.15 is built directly on the stable v0.14 snapshot. release/v0.14.0 and every older release branch remain immutable.

## Why another performance pass

v0.14 removed a large amount of irrelevant procedural-room work, but profiling the runtime architecture still exposed four expensive patterns:

- a file-backed GLB stayed fully rendered after the first visit even when the player crossed the market
- decorative passage glass used transmission even though it was not a hero interaction surface
- passive interaction raycasts were frame-count based, so high-refresh displays paid more raycasts per second
- every interaction halo owned a frame callback and every InteractiveNode subscribed to the full nearby object

## Runtime treatment

### File-backed re-hibernation

GLB/scan assets still prefetch and remain in the Drei/GLTF cache, but their heavy renderer now has independent visibility hysteresis:
- 24m prefetch
- 18m reveal
- 22m sleep

Leaving the hero shop no longer leaves its detailed mesh/material graph in the rendered scene for the rest of the session.

### View-aware procedural budget

v0.14's 11.5m wake / 15.5m sleep contract remains, with a 6.8m forced-detail radius. Outside that near bubble, a room must also be within a broad camera-facing budget to wake. A room well behind the player must remain behind for several probes before sleeping, preventing turn-induced thrash.

### Transmission budget

The six decorative passage glass bays no longer use MeshPhysicalMaterial transmission. They use a cheap transparent standard material. Hero/authored shop glass keeps its physical transmission, but the whole file renderer now hibernates at distance.

### Interaction scheduler

Passive center-screen targeting is now time/pose based rather than every N frames:
- moving/looking scan floor: about 90ms
- stationary scan floor: about 260ms
- hard refresh: 360ms
- explicit E/F/C actions still raycast immediately

This makes interaction CPU cost largely independent from 60Hz vs 120/144Hz displays.

### React/frame-loop cleanup

- inactive interaction halos render nothing and own no useFrame callback
- halo point lights were removed
- InteractiveNode subscribes only to whether its own interaction is active
- dormant storefront text uses a 0.45 texture-resolution scale
- F3 diagnostics report FPS, frame milliseconds, raycasts/second and current room budget

## Human interaction treatment

### Flow-preserving quick actions

Products can be acted on without dropping out of navigation:
- E: inspect / open primary interaction
- F: collect sample immediately
- C: add/remove product from quote basket
- G: guide to nearest unvisited shop

### Multi-vendor quote basket

The HUD now contains a persistent quote basket that resolves products back to their vendors and shows product, unit and observed price side by side. The visitor can remove items, clear the basket or copy a quote-draft summary.

### Feedback

Sample, favorite and quote actions emit short non-blocking feedback instead of silently mutating state.

## Hero authored shop v4

The deterministic GLB generator now exports an authored v4 shop with extra work-context geometry:
- order clipboard and sheet
- stamp / ink pad
- packing scale
- packing tape roll using real torus geometry
- hand truck and wheels
- stacked sample books

A local non-shadow-casting hero spotlight exists only while the authored FileRoomRenderer is mounted.

## Regression rules

v0.15 must preserve:
- v0.14 living-market detail and product sample interactions
- v0.13 motion DPR, static shadows and shader warm-up
- v0.12 progressive loading / lazy document reader
- first-visible-hit interaction occlusion
- scan/server/world/catalog contracts
- all immutable release branches
