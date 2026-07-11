// Sons sintetizados com WebAudio - zero assets externos
"use client";

let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", vol = 0.2) {
  const a = ac();
  if (!a) return;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(vol, a.currentTime + start);
  g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + start + dur);
  o.connect(g).connect(a.destination);
  o.start(a.currentTime + start);
  o.stop(a.currentTime + start + dur + 0.05);
}

export function playClick() {
  tone(600, 0, 0.06, "square", 0.08);
}

export function playCorrect() {
  tone(523, 0, 0.12, "sine", 0.2); // C5
  tone(784, 0.1, 0.18, "sine", 0.2); // G5
}

export function playWrong() {
  // suave, sem drama
  tone(300, 0, 0.15, "sine", 0.12);
  tone(250, 0.12, 0.2, "sine", 0.1);
}

export function playStreak() {
  tone(659, 0, 0.1, "triangle", 0.2);
  tone(880, 0.08, 0.1, "triangle", 0.2);
  tone(1047, 0.16, 0.2, "triangle", 0.2);
}

export function playFanfare() {
  const notes = [523, 659, 784, 1047, 784, 1047, 1319];
  notes.forEach((n, i) => tone(n, i * 0.13, 0.25, "triangle", 0.22));
  tone(262, 0, 1.1, "sine", 0.1);
}

export function playPew() {
  const a = ac();
  if (!a) return;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = "sawtooth";
  o.frequency.setValueAtTime(900, a.currentTime);
  o.frequency.exponentialRampToValueAtTime(150, a.currentTime + 0.2);
  g.gain.setValueAtTime(0.12, a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.2);
  o.connect(g).connect(a.destination);
  o.start();
  o.stop(a.currentTime + 0.25);
}

export function playBoom() {
  const a = ac();
  if (!a) return;
  const dur = 0.35;
  const buf = a.createBuffer(1, a.sampleRate * dur, a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = a.createBufferSource();
  src.buffer = buf;
  const g = a.createGain();
  g.gain.setValueAtTime(0.25, a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
  const f = a.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = 700;
  src.connect(f).connect(g).connect(a.destination);
  src.start();
}

export function playSleep() {
  tone(523, 0, 0.3, "sine", 0.12);
  tone(392, 0.28, 0.35, "sine", 0.12);
  tone(330, 0.6, 0.5, "sine", 0.1);
}
