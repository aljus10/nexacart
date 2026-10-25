# Assets and provenance

The compact night workshop background was edited with the built-in image-generation tool from the existing Polangui HQ workshop image. It is a panoramic image, not reconstructed architecture.

- Edit mode: referenced-image edit.
- Original: `assets/workshop-original.png`, 1944 × 809.
- Runtime: `assets/workshop.webp`, optimized from the generated image.
- The main desk and workbench props now use the sourced models listed below. The custom BU demo card/lanyard, door and graphics remain authored in code.
- The BU card uses local typesetting and a generic silhouette. It has no official seal, student name or real ID number.
- The earlier procedural Mjolnir, gauntlet and bracer were removed. Marvel characters and related designs remain the property of their respective owners.

## Final night background edit prompt

```
Use case: precise-object-edit / lighting-weather. Asset type: panorama background for an interactive night workshop.
Edit THIS exact image into a more compact, realistic one-floor developer headquarters at NIGHT. Preserve the very wide 1944x809 composition, foreground desk, center round projector, and ALL THREE blank black monitor screens at exactly their existing positions, corners, and sizes. Those monitor positions are important.
Change the huge two-storey factory into an intimate single-storey workshop about 7 metres deep, with closer dark metal walls, a lower 3.2 metre ceiling, no upper gallery/mezzanine and no staircases. Keep detailed tools on the left wall, a few cabinets, and a glass wall on the right showing a very dark midnight-blue night outside. Realistic subtle warm amber accent strips, small pools of light, deep blue charcoal shadows, dim ceiling fixtures, NOT daylight, NOT bright everywhere. Rich detail still visible in shadows, cinematic photographic realism, warm/cool balance. Foreground desk surfaces reflect sparse amber lighting and faint blue monitor light.
IMPORTANT FLOOR SPACE: shorten the left end of the big foreground desk so its LEFT vertical edge is near x490 in the source image instead of x164. The leftmost monitor x498..677 must stay on this shorter desk. Leave a clear, visible FLOOR aisle in front of the left tool wall: x0..460, from y470 to the bottom of the image. Show dark floor tiles and a little warm wall-edge lighting. No cabinets or tabletop across this floor aisle. A character will be added separately onto this floor later; do not add any character now.
Remove the black architect lamp. Remove the blue PC computer tower to the right of the rightmost monitor, its keyboard and mouse. Reconstruct the desk and room naturally behind them. Remove loose desk objects from the area around x730..825,y550..610. These props will be real 3D objects added separately in the app.
Keep the central circular projector. No holographic panels or text, no logos, no characters or people, no statues. Preserve the three monitor screen corners and front camera framing. Make the room feel smaller and grounded, not a cavernous sci-fi hangar.
```

## Iron Man model and render

- Original **Iron Man Mark 7** model: **jcp0072 / @jordi_creates**. [Creator listing](https://www.cgtrader.com/free-3d-models/character/sci-fi-character/iron-man-mark-7-921b97bf-4e87-408e-99aa-6fc82c720e0a). The creator describes the model as free and requests credit.
- Optimized GLB: [Iron Man Atlas by xt688077](https://github.com/xt688077/iron-man-atlas), `public/models/ironman.glb` on the `master` branch, 6,697,396 bytes. The source project describes personal/educational use. Its README is retained in `source/ironman-source-readme.md`.
- Iron Man is a Marvel character; character rights remain with their respective owners.
- Runtime render: `assets/ironman-mark7.webp`, transparent, 768 × 1152. It was rendered from the model with its metallic materials, warm/cool lighting and reflected workshop environment, using ModernGL with the new night backdrop and dimmer key lighting. The detailed helmet in the runtime is extracted native mesh geometry from the same credited GLB. The charge and beam remain animated by the room code.
- Reproduction: install Python packages `numpy`, `Pillow` and `moderngl`, then run `python3 source/render-ironman.py` from this extracted package. An EGL/OpenGL runtime is required. This is a code-native 3D rendering workflow, not an image-generator output.

## Sourced asset update

### Gaming desktop, keyboard and mouse

This work is based on **Gaming Desktop PC** by **Yolala1232**, licensed under **CC BY 4.0**.

- Original creator: https://sketchfab.com/Yolala1232
- Original model: https://sketchfab.com/3d-models/gaming-desktop-pc-d1d8282c9916438091f11aeb28787b66
- License: https://creativecommons.org/licenses/by/4.0/
- Downloaded source copy: https://github.com/adrianhajdin/project_3D_developer_portfolio/tree/main/public/desktop_pc
- The embedded source metadata and `license.txt` name the same author, original source and license. The complete provided attribution is retained in `source/GAMING-PC-LICENSE.txt`.
- Changes: the tower, keyboard and mouse were extracted as separate assemblies, reoriented, normalized, merged by material and packed into self-contained GLBs. Texture dimensions are capped at 1024px. Local PBR renders are provided for the fallback.
- Outputs: `pc.glb`, `keyboard.glb`, `mouse.glb` in `assets/models`.

### Poly Haven props (Desk items)

All of these models are CC0: https://polyhaven.com/license . Geometry, base color, normal and ARM maps came from Poly Haven's published 1K glTF downloads. The source metadata identifies the artists below. Changes: individual cup extracted, transforms applied, scale/orientation normalized, materials merged and GLBs packed with embedded maps. Fallbacks were rendered locally from these models.

- **Desk Lamp Arm 01** — Yann Kervran, Kuutti Siitonen. Source: https://polyhaven.com/a/desk_lamp_arm_01 . Output: `assets/models/lamp.glb`.
- **Tea Set 01** (Cup) — James Ray Cock, Rico Cilliers, Jurita Burger. Source: https://polyhaven.com/a/tea_set_01 . Output: `assets/models/cup.glb`.

*(Note: The earlier tool wall models — Adjustable Wrench, Pliers, Screwdriver, and Mjolnir by arnart204 — were removed from the live scene to streamline the room layout).*

### Helmet

`assets/models/helmet.glb` retains the geometry, UVs and material maps from the previously credited Iron Man Mark VII source above. The helmet/faceplate/eyes were extracted, transformed and normalized to 0.55 units tall. The earlier flat-shaded vertex-only helmet has been replaced.

### NexaDrive (Retro Computer Flight Racer)

- **Design & Engineering:** Polangui HQ & Nexa Intelligence
- **Architecture:** 100% Original Standalone WebGL / Three.js Procedural Orbital Racer
- **Audio:** Real-time Web Audio API procedural synthesis (Dual ion engine oscillators, sub-bass pulse; zero external audio files or third-party web dependencies)
- **Visuals:** Procedurally generated lunar/orbital courses (Aster Reach, Ember Rift, Halo Meridian), dynamic luminous gate arrays, and particle fields.

### Pending gauntlet

Selected source: **INFINITY GAUNTLET** by **LucasMartinFerreyra**, **CC BY**, https://blendswap.com/blend/21565 . Its download page requires sign-in. No file from that source is included. The original rough procedural gauntlet was removed, so this export does not claim to contain a sourced Infinity Gauntlet. Import a legitimately downloaded licensed file later and preserve its required creator attribution.

### Rendering libraries

Three.js 0.170.0 (including GLTFLoader), MIT: https://github.com/mrdoob/three.js . The bundled license is `vendor/LICENSE-THREE.txt`. Lucide remains bundled under its existing license.
