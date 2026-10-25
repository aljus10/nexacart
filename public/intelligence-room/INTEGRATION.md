# Integration

The root remains `#nexa-night-hq`. Copy the body content and keep `src`, `assets` and `vendor` together. The script order is important: Lucide, asset-meta.js, real-scene.js, room.js, icons.js. The standalone page fills the window; use your fullscreen route's dimensions when integrating it.

## Native imported models

`source/scene.js` bundles Three.js 0.170.0 and GLTFLoader. The readable source is included; the ready-to-use bundle is `vendor/real-scene.js`. When WebGL2 is available it loads the local model-data script and parses the embedded GLBs, retaining their UVs, normal maps, base-color and metal/roughness maps. The stage has an environment reflection map, warm/cool scene lights, soft contact shadows and a lamp point light linked to the room toggle. Texture resolution is capped at 1024px, and static meshes are merged by material to reduce draw calls. There is no network asset dependency or download token in the export.

`buildDownloadedAssets()` supplies normalized anchors to both renderers. `drawDownloadedAssets()` passes the workshop camera position, forward/up vectors, field of view, aspect, size and lamp position to the live stage. Camera coordinates match the room's projection. Live models therefore stay aligned during cursor movement, dragging, wheel zoom and monitor/object focus.

When WebGL2 is unavailable, the same sourced meshes are shown as pre-rendered PBR images projected on anchored planes. This fallback is deliberately different from a live mesh renderer; it retains model detail but does not recalculate its own material lighting or geometry with the camera. The room's lamp glow, central AI and beam continue to animate. The old flat-shaded procedural PC, cup, lamp, hammer and workbench tool meshes are not used.

`data-asset-renderer` on the root reports `gltf-pbr` or `model-render-fallback`. `data-downloaded-assets` lists the ten imported assets. The background retains its existing WebGL/Canvas renderer, and custom lanyard/card and door geometry retain their smaller native renderer. The floor suit remains a rendered model image with live effects.

## Placements

All source coordinates refer to the 1944 × 809 panoramic backdrop. Camera coverage remains 160 degrees horizontally; free walking is not enabled.

| Asset | Source anchor | Radius |
| --- | --- | --- |
| Cup | 760,577 | 6.1 |
| PC | 1460,565 | 6.4 |
| Lamp | 610,580 | 6.3 |
| Keyboard | 1225,583 | 6.1 |
| Mouse | 1370,597 | 6.1 |
| Helmet | 834,578 | 6.1 |
| Mjolnir | 220,446 | 8 |
| Wrench | 312,446 | 8 |
| Pliers | 364,446 | 8 |
| Screwdriver | 410,446 | 8 |

The mesh origin is normalized to its bottom center. Each placement carries its source-angle orientation and measured fallback dimensions. Adjust anchors in `source/downloaded.js` or the assembled equivalent in `src/room.js`; apply the same changes to both paths.

## Adding the gauntlet later

Obtain the actual licensed file from the pending source in `ASSETS.md`. Convert it to a self-contained GLB with its real materials, normalize to the desired display size, record the creator/license and add it to the embedding script. Add its model and fallback dimensions to `NexaAssetMeta`, bytes to `NexaModelData`, and a placement entry. Do not use an unauthenticated viewer asset to bypass a site's required download sign-in.

## Lifecycle and data

The loader starts its 8200 ms presentation after room artwork and the live model stage have initialized. WebGL failure resolves to the supplied model renders. `STARTUP.md` covers replay, skip, visibility pause and audio events. The exported app includes no sound track or speech service.

`desktopData` and `ask()` still use local sample fixtures. Replace them with authenticated database and AI services in the parent application, passing output through `textContent`. No external data is sent by this prototype.

For an SPA, isolate the page in a route/iframe or provide complete cleanup on unmount: animation frame, ResizeObserver, loader deadline, answer timers, visibility and element listeners, `root.nexaIntro`, and `NexaReal3D.dispose()` for buffers, materials, textures and WebGL state. Initialize once per root.

## Validation

The runtime and scene bundle pass JavaScript syntax/bundle checks. Converted assets were loaded and rendered offline using their texture maps. Browser QA covers the provided fallback, camera movement, close-ups and controls; this cloud browser does not provide WebGL2, so the native Three.js stage still needs a hardware-enabled browser check on your machine.
