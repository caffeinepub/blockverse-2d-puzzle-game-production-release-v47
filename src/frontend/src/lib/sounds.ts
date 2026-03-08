// Simple sound effect generator using Web Audio API
let audioContext: AudioContext | null = null;
let soundEnabled = true;

// Background music state
let bgMusicNodes: {
  oscillators: OscillatorNode[];
  gains: GainNode[];
  masterGain: GainNode;
} | null = null;
let bgMusicPlaying = false;
let bgMusicScheduler: ReturnType<typeof setTimeout> | null = null;

// Initialize sound preference from localStorage
export function initSoundPreference(): boolean {
  const saved = localStorage.getItem("blockverse-sound-enabled");
  soundEnabled = saved === null ? true : saved === "true";
  return soundEnabled;
}

// Get current sound preference
export function isSoundEnabled(): boolean {
  return soundEnabled;
}

// Toggle sound on/off
export function toggleSound(): boolean {
  soundEnabled = !soundEnabled;
  localStorage.setItem("blockverse-sound-enabled", soundEnabled.toString());
  return soundEnabled;
}

// Set sound preference
export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
  localStorage.setItem("blockverse-sound-enabled", enabled.toString());
}

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
  }
  return audioContext;
}

// Resume audio context on user interaction (required for autoplay policies)
export async function resumeAudioContext(): Promise<void> {
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
  } catch (error) {
    console.warn("Failed to resume audio context:", error);
  }
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.3,
) {
  if (!soundEnabled) return;

  try {
    const ctx = getAudioContext();

    // Resume context if needed
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      ctx.currentTime + duration,
    );

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (error) {
    // Silently fail if audio is not supported
    console.warn("Audio playback failed:", error);
  }
}

function playChord(
  frequencies: number[],
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.2,
) {
  if (!soundEnabled) return;

  frequencies.forEach((freq) => {
    playTone(freq, duration, type, volume);
  });
}

// Enhanced block placement sound - impactful "spark" or "clink" effect
function playBlockPlaceSound() {
  if (!soundEnabled) return;

  try {
    const ctx = getAudioContext();

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    // Create a bright, satisfying "clink" sound with multiple harmonics
    const now = ctx.currentTime;

    // Main tone - bright and clear
    const mainOsc = ctx.createOscillator();
    const mainGain = ctx.createGain();
    const mainFilter = ctx.createBiquadFilter();

    mainOsc.type = "sine";
    mainOsc.frequency.value = 1200; // Bright, clear frequency

    mainFilter.type = "bandpass";
    mainFilter.frequency.value = 1200;
    mainFilter.Q.value = 3.0; // Sharp, defined tone

    mainGain.gain.setValueAtTime(0.35, now);
    mainGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    mainOsc.connect(mainFilter);
    mainFilter.connect(mainGain);
    mainGain.connect(ctx.destination);

    mainOsc.start(now);
    mainOsc.stop(now + 0.15);

    // Harmonic overtone - adds sparkle
    const harmOsc = ctx.createOscillator();
    const harmGain = ctx.createGain();

    harmOsc.type = "sine";
    harmOsc.frequency.value = 2400; // One octave higher

    harmGain.gain.setValueAtTime(0.15, now);
    harmGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    harmOsc.connect(harmGain);
    harmGain.connect(ctx.destination);

    harmOsc.start(now);
    harmOsc.stop(now + 0.1);

    // Subtle metallic "clink" using noise
    const noiseBuffer = ctx.createBuffer(
      1,
      ctx.sampleRate * 0.05,
      ctx.sampleRate,
    );
    const noiseData = noiseBuffer.getChannelData(0);

    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] =
        (Math.random() * 2 - 1) * Math.exp(-i / (noiseData.length * 0.15));
    }

    const noiseSource = ctx.createBufferSource();
    const noiseGain = ctx.createGain();
    const noiseFilter = ctx.createBiquadFilter();

    noiseSource.buffer = noiseBuffer;

    noiseFilter.type = "highpass";
    noiseFilter.frequency.value = 3000; // High frequency for metallic quality
    noiseFilter.Q.value = 1.5;

    noiseGain.gain.setValueAtTime(0.12, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noiseSource.start(now);
  } catch (error) {
    console.warn("Block place sound failed:", error);
  }
}

// Level-specific clear sound
function playLevelClearSound(level: number) {
  if (!soundEnabled) return;

  const baseFreq = 600 + level * 50;
  playTone(baseFreq, 0.1, "sine", 0.3);
  setTimeout(() => playTone(baseFreq + 200, 0.1, "sine", 0.3), 50);
  setTimeout(() => playTone(baseFreq + 400, 0.15, "sine", 0.3), 100);
}

// Level-specific combo sound
function playLevelComboSound(level: number) {
  if (!soundEnabled) return;

  const baseFreq = 800 + level * 50;
  playTone(baseFreq, 0.08, "square", 0.25);
  setTimeout(() => playTone(baseFreq + 200, 0.08, "square", 0.25), 60);
  setTimeout(() => playTone(baseFreq + 400, 0.08, "square", 0.25), 120);
  setTimeout(() => playTone(baseFreq + 600, 0.12, "square", 0.25), 180);
}

// Background music using Web Audio API - ambient synth loop
function scheduleBgMusicNote(
  ctx: AudioContext,
  masterGain: GainNode,
  time: number,
  freq: number,
  duration: number,
  volume = 0.06,
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(masterGain);
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(volume, time + 0.05);
  gain.gain.linearRampToValueAtTime(volume * 0.6, time + duration * 0.5);
  gain.gain.linearRampToValueAtTime(0, time + duration);
  osc.start(time);
  osc.stop(time + duration + 0.05);
}

// Loop period in seconds
const BG_LOOP_DURATION = 16;

function scheduleBgLoop(
  ctx: AudioContext,
  masterGain: GainNode,
  startTime: number,
) {
  if (!bgMusicPlaying) return;
  // Ambient chord progression - gentle pentatonic feel
  const notes: Array<[number, number, number, number]> = [
    // [time offset, freq, duration, volume]
    [0, 261.63, 2.0, 0.07], // C4
    [0, 392.0, 2.0, 0.05], // G4 harmony
    [2, 293.66, 2.0, 0.07], // D4
    [2, 440.0, 2.0, 0.05], // A4 harmony
    [4, 329.63, 2.0, 0.07], // E4
    [4, 493.88, 2.0, 0.05], // B4 harmony
    [6, 261.63, 2.0, 0.07], // C4
    [6, 392.0, 2.0, 0.05], // G4 harmony
    [8, 220.0, 2.0, 0.06], // A3 (low)
    [8, 329.63, 2.0, 0.05], // E4
    [10, 246.94, 2.0, 0.06], // B3
    [10, 369.99, 2.0, 0.05], // F#4
    [12, 261.63, 2.0, 0.07], // C4
    [12, 392.0, 2.0, 0.05], // G4
    [14, 293.66, 2.0, 0.06], // D4
    [14, 440.0, 2.0, 0.04], // A4
  ];

  notes.forEach(([offset, freq, duration, vol]) => {
    scheduleBgMusicNote(
      ctx,
      masterGain,
      startTime + offset,
      freq,
      duration,
      vol,
    );
  });

  // Add a soft bass pulse every 2 beats
  for (let i = 0; i < 8; i++) {
    scheduleBgMusicNote(ctx, masterGain, startTime + i * 2, 130.81, 0.3, 0.05); // C3 bass
  }

  // Schedule next loop
  if (bgMusicPlaying) {
    bgMusicScheduler = setTimeout(
      () => {
        if (bgMusicPlaying) {
          const ctx2 = getAudioContext();
          if (bgMusicNodes) {
            scheduleBgLoop(
              ctx2,
              bgMusicNodes.masterGain,
              ctx2.currentTime + 0.1,
            );
          }
        }
      },
      (BG_LOOP_DURATION - 0.5) * 1000,
    );
  }
}

export function playBackgroundMusic(): void {
  if (!soundEnabled || bgMusicPlaying) return;
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 2.0);
    masterGain.connect(ctx.destination);

    bgMusicNodes = { oscillators: [], gains: [], masterGain };
    bgMusicPlaying = true;

    scheduleBgLoop(ctx, masterGain, ctx.currentTime + 0.1);
  } catch (e) {
    console.warn("Background music failed:", e);
  }
}

export function stopBackgroundMusic(): void {
  if (!bgMusicPlaying) return;
  bgMusicPlaying = false;

  if (bgMusicScheduler) {
    clearTimeout(bgMusicScheduler);
    bgMusicScheduler = null;
  }

  if (bgMusicNodes) {
    try {
      const ctx = getAudioContext();
      bgMusicNodes.masterGain.gain.linearRampToValueAtTime(
        0,
        ctx.currentTime + 1.0,
      );
    } catch (_) {
      /* ignore */
    }
    bgMusicNodes = null;
  }
}

export function isBgMusicPlaying(): boolean {
  return bgMusicPlaying;
}

export function playSound(
  type:
    | "place"
    | "clear"
    | "button"
    | "gameStart"
    | "powerUp"
    | "rankUp"
    | "badgeUnlock"
    | "gameOver"
    | "combo"
    | "levelUp",
  level = 1,
) {
  if (!soundEnabled) return;

  // Ensure audio context is resumed on first sound
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    ctx.resume();
  }

  switch (type) {
    case "place":
      // Enhanced block placement sound - impactful "spark" or "clink"
      playBlockPlaceSound();
      break;

    case "clear":
      // Level-specific ascending tones for line clear
      playLevelClearSound(level);
      break;

    case "combo":
      // Level-specific exciting combo sound
      playLevelComboSound(level);
      break;

    case "button":
      // Quick click sound
      playTone(600, 0.05, "sine", 0.2);
      break;

    case "gameStart":
      // Uplifting start sound
      playTone(400, 0.1, "sine", 0.3);
      setTimeout(() => playTone(500, 0.1, "sine", 0.3), 80);
      setTimeout(() => playTone(600, 0.15, "sine", 0.3), 160);
      setTimeout(() => playChord([800, 1000, 1200], 0.2, "sine", 0.25), 280);
      break;

    case "powerUp":
      // Magical power-up sound
      playTone(600, 0.08, "triangle", 0.3);
      setTimeout(() => playTone(800, 0.08, "triangle", 0.3), 60);
      setTimeout(() => playTone(1000, 0.08, "triangle", 0.3), 120);
      setTimeout(() => playTone(1200, 0.12, "triangle", 0.3), 180);
      setTimeout(
        () => playChord([1400, 1600, 1800], 0.15, "triangle", 0.2),
        280,
      );
      break;

    case "rankUp":
      // Triumphant rank up sound
      playChord([400, 500, 600], 0.15, "square", 0.25);
      setTimeout(() => playChord([500, 625, 750], 0.15, "square", 0.25), 150);
      setTimeout(() => playChord([600, 750, 900], 0.2, "square", 0.25), 300);
      break;

    case "levelUp":
      // Epic level up fanfare
      playChord([600, 750, 900], 0.15, "sine", 0.3);
      setTimeout(() => playChord([700, 875, 1050], 0.15, "sine", 0.3), 150);
      setTimeout(() => playChord([800, 1000, 1200], 0.2, "sine", 0.3), 300);
      setTimeout(() => playChord([1000, 1250, 1500], 0.25, "sine", 0.3), 500);
      setTimeout(() => playChord([1200, 1500, 1800], 0.3, "sine", 0.25), 750);
      break;

    case "badgeUnlock":
      // Special badge unlock fanfare
      playTone(800, 0.1, "sine", 0.3);
      setTimeout(() => playTone(1000, 0.1, "sine", 0.3), 100);
      setTimeout(() => playChord([1200, 1400, 1600], 0.15, "sine", 0.25), 200);
      setTimeout(() => playChord([1400, 1600, 1800], 0.2, "sine", 0.25), 350);
      break;

    case "gameOver":
      // Descending game over sound
      playTone(600, 0.15, "sine", 0.3);
      setTimeout(() => playTone(500, 0.15, "sine", 0.3), 150);
      setTimeout(() => playTone(400, 0.2, "sine", 0.3), 300);
      break;
  }
}
