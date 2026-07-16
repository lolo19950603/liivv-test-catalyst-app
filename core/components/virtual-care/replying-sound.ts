type AudioContextCtor = typeof AudioContext;

function getAudioContextCtor(): AudioContextCtor | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return (
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: AudioContextCtor }).webkitAudioContext
  );
}

/** Short UI cue (no audio assets required). */
function playToneCue(steps: Array<{ frequency: number; durationMs: number; volume?: number }>) {
  const AudioContextCtor = getAudioContextCtor();

  if (!AudioContextCtor) {
    return;
  }

  const audioContext = new AudioContextCtor();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = 'sine';
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  const now = audioContext.currentTime;
  let cursor = now;

  gainNode.gain.setValueAtTime(0, now);

  for (const step of steps) {
    const volume = step.volume ?? 0.08;
    const durationSec = step.durationMs / 1000;

    oscillator.frequency.setValueAtTime(step.frequency, cursor);
    gainNode.gain.setValueAtTime(0, cursor);
    gainNode.gain.linearRampToValueAtTime(volume, cursor + 0.02);
    gainNode.gain.setValueAtTime(volume, cursor + Math.max(durationSec - 0.04, 0.02));
    gainNode.gain.linearRampToValueAtTime(0, cursor + durationSec);
    cursor += durationSec;
  }

  oscillator.start(now);
  oscillator.stop(cursor + 0.02);

  void audioContext.resume().catch(() => undefined);

  window.setTimeout(() => {
    void audioContext.close().catch(() => undefined);
  }, (cursor - now) * 1000 + 80);
}

/** Rising two-tone cue when the microphone engages. */
export function playVoiceStartSound() {
  playToneCue([
    { frequency: 523, durationMs: 90, volume: 0.07 },
    { frequency: 784, durationMs: 120, volume: 0.09 },
  ]);
}

/** Falling two-tone cue when voice chat is cancelled / ended. */
export function playVoiceEndSound() {
  playToneCue([
    { frequency: 587, durationMs: 90, volume: 0.08 },
    { frequency: 349, durationMs: 140, volume: 0.06 },
  ]);
}

/** Soft pulsing tone while waiting for a voice reply (no audio assets required). */
export function createReplyingSound() {
  let audioContext: AudioContext | null = null;
  let oscillator: OscillatorNode | null = null;
  let gainNode: GainNode | null = null;
  let pulseTimer: number | null = null;
  let active = false;

  function stop() {
    active = false;

    if (pulseTimer !== null) {
      window.clearInterval(pulseTimer);
      pulseTimer = null;
    }

    try {
      oscillator?.stop();
    } catch {
      // already stopped
    }

    oscillator = null;
    gainNode = null;

    if (audioContext) {
      void audioContext.close().catch(() => undefined);
      audioContext = null;
    }
  }

  function start() {
    if (active || typeof window === 'undefined') {
      return;
    }

    const AudioContextCtor = getAudioContextCtor();

    if (!AudioContextCtor) {
      return;
    }

    active = true;
    audioContext = new AudioContextCtor();
    oscillator = audioContext.createOscillator();
    gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = 196;
    gainNode.gain.value = 0;

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start();

    void audioContext.resume().catch(() => undefined);

    let pulseUp = true;

    pulseTimer = window.setInterval(() => {
      if (!gainNode || !audioContext) {
        return;
      }

      const now = audioContext.currentTime;

      gainNode.gain.cancelScheduledValues(now);
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.linearRampToValueAtTime(pulseUp ? 0.045 : 0.012, now + 0.35);
      pulseUp = !pulseUp;
    }, 700);
  }

  return { start, stop };
}
