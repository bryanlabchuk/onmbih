// Audio Manager - Spooky sounds for a spooky game
// Uses Web Audio API for procedural audio generation

export class AudioManager {
  constructor() {
    this.context = null;
    this.masterGain = null;
    this.enabled = true;
    this.volume = 0.5;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    try {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.context.createGain();
      this.masterGain.connect(this.context.destination);
      this.masterGain.gain.value = this.volume;
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume;
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    if (this.masterGain) {
      this.masterGain.gain.value = this.enabled ? this.volume : 0;
    }
  }

  // ===== SOUND EFFECTS =====

  playDiceRoll() {
    if (!this.enabled || !this.context) return;
    
    // Create a short rattling sound
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    const filter = this.context.createBiquadFilter();
    
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    filter.Q.value = 1;
    
    osc.type = 'square';
    osc.frequency.value = 200;
    
    // Rapid frequency changes for rattle effect
    const now = this.context.currentTime;
    for (let i = 0; i < 10; i++) {
      osc.frequency.setValueAtTime(150 + Math.random() * 200, now + i * 0.03);
    }
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 0.3);
  }

  playDiceLand(value) {
    if (!this.enabled || !this.context) return;
    
    // Thunk sound with pitch based on value
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = 100 + value * 20;
    
    const now = this.context.currentTime;
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 0.1);
  }

  playSuccess() {
    if (!this.enabled || !this.context) return;
    
    // Ascending chime
    const frequencies = [440, 550, 660, 880];
    const now = this.context.currentTime;
    
    frequencies.forEach((freq, i) => {
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.3, now + i * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.3);
    });
  }

  playFailure() {
    if (!this.enabled || !this.context) return;
    
    // Descending dissonant sound
    const osc1 = this.context.createOscillator();
    const osc2 = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    
    const now = this.context.currentTime;
    osc1.frequency.setValueAtTime(300, now);
    osc1.frequency.linearRampToValueAtTime(100, now + 0.5);
    osc2.frequency.setValueAtTime(307, now); // Slightly detuned
    osc2.frequency.linearRampToValueAtTime(103, now + 0.5);
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.5);
    osc2.stop(now + 0.5);
  }

  playSpiritAppear() {
    if (!this.enabled || !this.context) return;
    
    // Eerie rising drone
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    const filter = this.context.createBiquadFilter();
    
    osc.type = 'sawtooth';
    filter.type = 'lowpass';
    filter.frequency.value = 500;
    
    const now = this.context.currentTime;
    osc.frequency.setValueAtTime(50, now);
    osc.frequency.linearRampToValueAtTime(200, now + 1);
    filter.frequency.linearRampToValueAtTime(2000, now + 1);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.5);
    gain.gain.linearRampToValueAtTime(0, now + 1);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 1);
  }

  playSpiritDefeat() {
    if (!this.enabled || !this.context) return;
    
    // Descending wail
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = 'sine';
    
    const now = this.context.currentTime;
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 1.5);
    
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.linearRampToValueAtTime(0, now + 1.5);
    
    // Add tremolo
    const lfo = this.context.createOscillator();
    const lfoGain = this.context.createGain();
    lfo.frequency.value = 8;
    lfoGain.gain.value = 0.3;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    lfo.start(now);
    osc.stop(now + 1.5);
    lfo.stop(now + 1.5);
  }

  playDamage() {
    if (!this.enabled || !this.context) return;
    
    // Impact + static
    const noise = this.context.createBufferSource();
    const buffer = this.context.createBuffer(1, this.context.sampleRate * 0.2, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.2));
    }
    
    noise.buffer = buffer;
    
    const gain = this.context.createGain();
    gain.gain.value = 0.3;
    
    noise.connect(gain);
    gain.connect(this.masterGain);
    
    noise.start();
  }

  playClick() {
    if (!this.enabled || !this.context) return;
    
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = 600;
    
    const now = this.context.currentTime;
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.setValueAtTime(0, now + 0.05);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 0.05);
  }

  playHover() {
    if (!this.enabled || !this.context) return;
    
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = 400;
    
    const now = this.context.currentTime;
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.setValueAtTime(0, now + 0.02);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 0.02);
  }

  // Ambient background drone
  startAmbience() {
    if (!this.enabled || !this.context) return;
    
    // Deep drone
    this.ambientOsc = this.context.createOscillator();
    this.ambientGain = this.context.createGain();
    this.ambientFilter = this.context.createBiquadFilter();
    
    this.ambientOsc.type = 'sawtooth';
    this.ambientOsc.frequency.value = 40;
    
    this.ambientFilter.type = 'lowpass';
    this.ambientFilter.frequency.value = 200;
    
    this.ambientGain.gain.value = 0.1;
    
    this.ambientOsc.connect(this.ambientFilter);
    this.ambientFilter.connect(this.ambientGain);
    this.ambientGain.connect(this.masterGain);
    
    this.ambientOsc.start();
    
    // Slowly modulate the filter
    this.modulateAmbience();
  }

  modulateAmbience() {
    if (!this.ambientFilter || !this.context) return;
    
    const now = this.context.currentTime;
    const targetFreq = 100 + Math.random() * 300;
    this.ambientFilter.frequency.linearRampToValueAtTime(targetFreq, now + 5);
    
    setTimeout(() => this.modulateAmbience(), 5000);
  }

  stopAmbience() {
    if (this.ambientOsc) {
      this.ambientOsc.stop();
      this.ambientOsc = null;
    }
  }
}

export const audio = new AudioManager();
