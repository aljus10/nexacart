# NexaDrive

An original orbital flight racer for NexaCart. Pilot the Kestrel NX–01 through three fictional space courses: Aster Reach, Ember Rift, and Halo Meridian. There are no external accounts, API keys, advertisements, or runtime downloads.

## Play

Open `index.html` directly in a modern browser. For a local server, run `node serve.js` (Node 18 or later), then open `http://localhost:8081`. `npm start` does the same thing. No install is necessary to play the included build.

- **WASD / arrow keys:** move vertically and horizontally in the flight corridor.
- **Space:** hold for ion boost; energy refills when released and through cleared gates.
- **Shift:** brake.
- **Escape / P:** pause or resume.
- **R:** restart the selected course.
- **Mouse steering:** toggle during flight to steer with cursor position.
- **Touch:** directional buttons and boost, or drag the flight view.

The ship follows each course's forward direction automatically. Pass through the luminous gates; a centered crossing earns extra points. Missing a gate adds two seconds to the result. Debris damages the regenerating hull and interrupts a combo. Your best score per course stays in this browser's local storage. No result is uploaded.

## Graphics and sound

WebGL2 uses live Three.js geometry, physical materials, original planets, an instanced asteroid field, and three-dimensional gates. A geometry-based Canvas renderer provides the same courses, controls, gate checks, and collisions when WebGL is unavailable. The fallback has simpler lighting and debris. It is not a video or screenshot. A browser without WebGL cannot show the full PBR lighting.

Auto quality caps drawing resolution and can reduce it when frame times remain high. Use the top-right Auto / High / Low button to choose manually. One animation loop owns simulation and drawing; static meshes are built once. Ambient menu motion renders at 30 fps while idle, with faster response to cursor movement. Simulation is fixed-step, and inactive tabs pause the flight. Reduced-motion preferences disable camera shake and speed streaks; flight movement remains essential to gameplay.

Sound starts muted. The sound button enables locally synthesized engine, gate, impact, and completion sounds using Web Audio. There is no sampled soundtrack or copied audio.

## Edit and rebuild

Source is readable in `src/`. Install dependencies only to rebuild:

```
npm install
npm run build
npm test
```

- `core.js`: original courses, movement, boost, scoring, collisions, records.
- `ship.js`: original Kestrel NX–01 mesh geometry and materials.
- `scene.js`: WebGL scene and camera.
- `software.js`: Canvas projection renderer.
- `audio.js`: synthesized audio.
- `main.js`: input, UI, lifecycle, storage, and the single frame loop.
- `style.css`: responsive NexaDrive interface.

The ready-to-play IIFE bundle is `vendor/nexadrive.js`. It works without module imports or network fetches, including local-file mode. Dependencies are pinned to Three.js 0.170.0 and esbuild 0.25.12.

`models/kestrel-nx01.glb` is an editable export of the original spacecraft, for use in Blender or other glTF tools. It is not fetched at runtime; the runtime builds the same mesh from `ship.js`. `PLAY-NEXADRIVE.html` is the single-file edition: open it directly to play without keeping any adjacent folders.

Six automated checks cover the course frames, frame-rate convergence, gate scoring, collision cooldown, boost and pause behavior, and finishing/record comparisons. The browser check covers the Canvas renderer, course selection, launch, steering, boost, gate progression, pause/resume, and the responsive interface. This test browser has WebGL disabled, so live WebGL lighting and materials require a check on a hardware-enabled browser.

## Embed in NexaCart

Copy this entire folder into your application's public assets and load `index.html` in an iframe with a descriptive title and `allowfullscreen`. Keep keyboard focus in the game while flying. Set the iframe height to at least 650px on desktop and 790px for the mobile flight deck; the in-flight view supports smaller heights. This is an independent game; it is not connected to Supabase, store analytics, or Nexa AI.

## Original work and notices

This implementation has newly authored game logic, interface, spacecraft mesh, course geometry, planet surfaces, and synthesized sound. No code bundles, models, textures, audio, fonts, or course data from the supplied prior game are included. No other website's branding or credit badge is displayed.

Three.js is an MIT-licensed rendering dependency. Its required notice is retained in `licenses/THREE-MIT.txt` and linked bundle notices; that notice is not a game-screen attribution. New project-specific source and original generated assets can be adapted by the recipient. This does not grant ownership of third-party libraries or exclusive rights to the name NexaDrive.
