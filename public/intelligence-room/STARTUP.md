# 8.2-second opening

The loading screen is a separate, opaque view before the Polangui HQ workshop. A metallic Nexa N forms on a dark studio background, with a slow light sweep and a thin completion line. The workshop stays hidden until the final transition. It uses its own canvas and does not display or animate the AI-room hologram.

The room artwork and renderer prepare behind the loader. Once ready, the **8200 ms** presentation clock starts. Audio is not included; the same lifecycle hooks below remain available for your track.

## Audio timing

| Time | Visual beat |
| --- | --- |
| 0.00–1.80 s | A warm line traces the Nexa N. |
| 1.80–4.20 s | The mark fills with metal and catches a moving light. |
| 4.20–7.75 s | A restrained turn and light sweep continue; the completion line advances. |
| 7.75–8.20 s | The separate loader fades away and the workshop appears. |
| 8.20 s | The workshop is fully visible and interactive. |

The boundaries are normalized from one clock. `INTRO_DURATION_MS` in `src/room.js` is set to `8200`. The final reveal is scheduled on that deadline, independently of animation-frame cadence. As with any browser animation, visible updates occur on available frames.

No audio file is included. Add your 8.2-second track to the `assets` folder and connect it from your app. The room itself does not request microphone access or produce synthetic speech.

## Integration hooks

The root is `#nexa-night-hq`. It emits bubbling CustomEvents:

| Event | Purpose |
| --- | --- |
| `nexa:intro-start` | Start or restart the track. Detail includes `durationMs`, `startTimeMs`, and `replay`. |
| `nexa:intro-phase` | An optional cue for `forming`, `finishing`, and `handoff`. |
| `nexa:intro-pause` | Pause audio when the page becomes hidden. |
| `nexa:intro-resume` | Resume audio when the page is visible again. |
| `nexa:intro-skip` | Stop audio when the user skips. |
| `nexa:intro-end` | Finish the opening. Detail includes `skipped` and `actualElapsedMs`. |
| `nexa:intro-error` | Handle unavailable room artwork. A retry icon is provided. |

Register listeners **before loading `src/room.js`** to catch the automatic first opening. For playback initiated by your existing fullscreen button, load the audio and connect its playback from that user action. Handle a rejected `play()` call using your app's audio control.

The following example belongs in the parent app or a script placed before `src/room.js`. Replace the audio filename with your own. It does not add visible controls to the room.

```html
<audio id="nexa-opening-track" preload="auto" src="assets/your-opening.mp3"></audio>
<script>
  const room = document.getElementById('nexa-night-hq');
  const track = document.getElementById('nexa-opening-track');
  let skipped = false;

  function playTrack() {
    track.play().catch(() => {
      // Offer audio playback from an existing user-operated control in your app.
    });
  }

  room.addEventListener('nexa:intro-start', () => {
    skipped = false;
    track.pause();
    track.currentTime = 0;
    playTrack();
  });
  room.addEventListener('nexa:intro-pause', () => track.pause());
  room.addEventListener('nexa:intro-resume', () => {
    if (!skipped) playTrack();
  });
  room.addEventListener('nexa:intro-skip', () => {
    skipped = true;
    track.pause();
  });
  room.addEventListener('nexa:intro-end', () => track.pause());
  room.addEventListener('nexa:intro-error', () => track.pause());
</script>
```

The audio connection is an example, not an enabled feature in this export. Check the actual track's leading silence, duration, and playback start before finalizing beat synchronization.

## Replay and skip

After initialization, the root exposes:

```js
const room = document.getElementById('nexa-night-hq');
room.nexaIntro.durationMs; // 8200
room.nexaIntro.replay();
room.nexaIntro.skip();
```

Replay restarts the visual clock and emits another start event. Skip uses a short dissolve and emits a skip event so the track can stop. The normal opening remains 8.2 seconds. Reduced motion preserves the timing with a stationary metallic mark and final dissolve. Room controls remain inert until completion. No keyboard focus is taken on the automatic first run; a replay focuses its skip control for keyboard access.

Switching away pauses the visual clock, and resume adjusts the deadline to exclude hidden time. Use the pause/resume events to keep your audio aligned with this behavior.
