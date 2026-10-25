# Nexa · Polangui HQ — sourced 3D asset update

A compact night workshop with detailed third-party models in place of the rough procedural desk props. Downloaded meshes retain their UVs and PBR material maps; they render live through Three.js where WebGL2 is available. Browsers without WebGL show high-quality offline renders of those same models.

## Run

Extract the ZIP and open `index.html`, or serve the extracted folder using your normal static server. The assets and libraries are bundled locally; no account, keys or external asset service is required to run it. Models are embedded in `src/model-data.js` so the local-file route does not fetch GLB files. Editable GLBs are also included in `assets/models`.

Move the cursor, drag, use the view arrows or zoom with the wheel. Bracketed actions switch the lamp, activate the beam, use the right computer, slide the glass door, and inspect the hammer/tools, helmet or BU demo ID. Reset or Escape returns from a close-up. The separate loading presentation remains 8.2 seconds, with the existing audio events, replay and skip controls.

The right computer contains Overview, Stores and Products with labeled sample data. Nexa answers are local fixtures projected above the central hologram. Supabase, a real AI service, voice and remote computer control are not connected.

## Replacements

| Object | Actual source |
| --- | --- |
| Gaming PC | Gaming Desktop PC by Yolala1232, CC BY 4.0 |
| Keyboard and mouse | Extracted assemblies from the same credited desktop model |
| Articulated lamp | Desk Lamp Arm 01 by Kuutti Siitonen and Yann Kervran / Poly Haven, CC0 |
| Ceramic cup | Tea Set 01 / Poly Haven, CC0 |
| Mjolnir | Mjolnir by arnart204, CC BY 4.0 |
| Wrench, pliers, screwdriver | Individual textured Poly Haven models, CC0 |
| Iron Man helmet | Detailed geometry and materials from the previously credited Mark VII model |

The earlier simple gauntlet and box-shaped armour bracer were removed. The selected CC BY Infinity Gauntlet by LucasMartinFerreyra requires a signed-in download from BlendSwap; it is not included or replaced with another invented primitive model. See `ASSETS.md` for the exact pending source. A licensed file can be imported through the same GLB pipeline later.

The Bicol University lanyard/demo card and sliding glass remain custom geometry. The room architecture remains a panoramic background. The floor-standing Iron Man remains the detailed transparent model render with the live beam. This update does not make the entire room a walkable 360-degree environment.

## Developer files

- `src/room.js`: complete workshop runtime and camera bridge.
- `src/model-data.js`: embedded model bytes and measured fallback dimensions.
- `vendor/real-scene.js`: bundled Three.js + GLTFLoader renderer.
- `assets/models/*.glb`: compact, self-contained textured model files.
- `assets/fallback/*.webp`: PBR model renders for browsers without WebGL.
- `source/scene.js`: readable renderer source; bundle using Three.js 0.170.0 and esbuild 0.25.12.
- `source/downloaded.js`: placements, loading and fallback projection bridge.
- `source/gltf_assets.py`: glTF/GLB material-preserving normalization and packing.
- `source/prepare_models.py`, `source/render_assets.py`: preparation references; require the original source downloads and the paths described in `ASSETS.md`.
- `STARTUP.md`: unchanged 8200 ms presentation/audio hooks.

Source excerpts are already assembled into the runtime; do not load them twice. Creator credits and licenses are in `ASSETS.md` and `source/GAMING-PC-LICENSE.txt`.
