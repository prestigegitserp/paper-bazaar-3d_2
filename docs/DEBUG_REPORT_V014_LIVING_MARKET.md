# v0.14 Living Market / Root Treatment

## Lineage

v0.14 is built directly on the stable v0.13 snapshot. release/v0.13.0 and all older release branches remain unchanged.

## Problem statement

The previous performance work made navigation much smoother, but the market still read as a clean CG showroom:
- procedural booths stayed fully alive even when far outside the useful view
- many interior materials fell back to stylized/generated surfaces
- rooms lacked accumulated wear, packing debris and small evidence of daily work
- only a small subset of products were physically interactive
- there was no loop that rewarded exploration

## Performance treatment

### Procedural booth hibernation

Procedural rooms now have a near/far detail state with hysteresis. A lightweight storefront proxy stays visible from a distance, while shelf stock, counters, samples and other heavy interior props mount only when the player is near or inside the room.

This preserves the authored look at interaction range but cuts irrelevant draw calls and material work across the rest of the passage.

### Lighter imperfection textures

Repeated scuff/smudge/fingerprint decals share a small deterministic cache and use lower-resolution canvases instead of rebuilding separate 512x256 textures for every occurrence.

## Material treatment

- walnut and oak surfaces can use verified Poly Haven CC0 PBR sets
- procedural wood gains knots, broad grain drift and localized wear
- plaster gains low-frequency blotching rather than uniform noise
- metal gains sparse scratches over the brushed pattern
- paper retains fiber-level color/roughness variation
- lived-in room decals add floor scuffs, wall grime and counter fingerprints

## Environmental storytelling

Every detailed procedural shop receives cheap local props:
- used coffee cup
- receipts / loose paper
- taped carton
- packing-tape roll
- accumulated scuff/smudge/fingerprint patterns

The goal is not decoration for its own sake; these details imply handling, packing, quoting and daily wholesale work.

## Interaction / gameplay

- a sample rail exposes every listed product as a direct in-world interaction, including third products that previously existed only in data
- product lists now inspect in-app instead of forcing the first click out to the web
- products can be favorited
- paper samples can be collected
- exploration awards points for new rooms and new interactions
- a compact market mission panel tracks visited shops, inspected products and collected samples

## Regression rules

v0.14 must preserve:
- v0.13 motion-adaptive DPR and shader warm-up
- first-visible-hit occlusion
- lazy catalog/document reader
- authored GLB v3 semantics
- progressive PBR loading and GPU upload scheduling
- scan/server/world/catalog contracts
