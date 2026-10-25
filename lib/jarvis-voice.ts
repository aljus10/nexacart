/**
 * J.A.R.V.I.S. Voice Pack Controller
 * Minimal, crisp voice line controller for task acknowledge and completion.
 */

export interface VoiceLine {
  id: string;
  file: string;
  label: string;
}

export const ACKNOWLEDGE_LINES: VoiceLine[] = [
  { id: 'ack_4', file: '/audio/jarvis/acknowledge_4.mp3', label: 'As you wish.' },
  { id: 'ack_5', file: '/audio/jarvis/acknowledge_5.mp3', label: 'Will do, sir.' },
  { id: 'ack_2', file: '/audio/jarvis/acknowledge_2.mp3', label: 'At your service, sir.' },
  { id: 'ack_3', file: '/audio/jarvis/acknowledge_3.mp3', label: 'For you, sir, always.' },
];

export const COMPLETE_LINES: VoiceLine[] = [
  { id: 'comp_1', file: '/audio/jarvis/complete_1.mp3', label: 'All wrapped up here, sir.' },
  { id: 'comp_2', file: '/audio/jarvis/complete_2.mp3', label: 'As always, sir, a great pleasure watching you work.' },
  { id: 'comp_6', file: '/audio/jarvis/complete_6.mp3', label: 'Complete. Diagnostic projection ready.' },
];

export const ERROR_LINES: VoiceLine[] = [
  { id: 'err_2', file: '/audio/jarvis/error_2.mp3', label: 'That did not work.' }
];

class JarvisVoiceService {
  private currentAudio: HTMLAudioElement | null = null;
  private isMuted: boolean = false;
  private ackIdx: number = 0;
  private compIdx: number = 0;

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) this.stop();
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public stop() {
    if (this.currentAudio) {
      const audio = this.currentAudio;
      this.currentAudio = null;
      try {
        audio.pause();
        audio.currentTime = 0;
        audio.removeAttribute('src');
        audio.load();
      } catch {}
    }
  }

  public playLine(line: VoiceLine, onEnded?: () => void): VoiceLine | null {
    if (typeof window === 'undefined' || this.isMuted || !line) return null;
    this.stop();
    try {
      const audio = new Audio(line.file);
      audio.volume = 0.85;
      this.currentAudio = audio;
      audio.addEventListener('ended', () => {
        if (this.currentAudio === audio) {
          this.currentAudio = null;
        }
        onEnded?.();
      }, { once: true });
      audio.addEventListener('error', () => {
        if (this.currentAudio === audio) {
          this.currentAudio = null;
        }
      }, { once: true });
      const p = audio.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          if (this.currentAudio === audio) {
            this.currentAudio = null;
          }
        });
      }
      return line;
    } catch {
      return null;
    }
  }

  public playAcknowledge(onEnded?: () => void): VoiceLine | null {
    const line = ACKNOWLEDGE_LINES[this.ackIdx % ACKNOWLEDGE_LINES.length];
    this.ackIdx++;
    return this.playLine(line, onEnded);
  }

  public playComplete(onEnded?: () => void): VoiceLine | null {
    const line = COMPLETE_LINES[this.compIdx % COMPLETE_LINES.length];
    this.compIdx++;
    return this.playLine(line, onEnded);
  }

  public playError(onEnded?: () => void): VoiceLine | null {
    const line = ERROR_LINES[0];
    return this.playLine(line, onEnded);
  }
}

export const jarvisVoice = new JarvisVoiceService();
