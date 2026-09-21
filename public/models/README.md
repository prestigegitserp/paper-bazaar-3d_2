# 3D models

Place optimized GLB assets under versioned folders, for example:

`models/vendor-x/room-v1/room.glb`

Reference them from WorldDefinition with a relative URL such as:

`models/vendor-x/room-v1/room.glb`

Do not commit raw photogrammetry captures, source photo sets or multi-gigabyte point clouds to the application repository.
Keep raw scan sources in dedicated storage and publish optimized runtime assets separately.
