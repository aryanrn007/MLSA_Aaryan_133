// Simple audio synthesizer for feedback
export class AudioSystem {
    constructor() {
        this.audioCtx = null;
    }

    init() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    playTone(frequency, type, duration, volumeLevel = 0.1) {
        if (!this.audioCtx) return;
        
        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);
        
        gainNode.gain.setValueAtTime(volumeLevel, this.audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        
        oscillator.start();
        oscillator.stop(this.audioCtx.currentTime + duration);
    }

    playCorrect() {
        this.init();
        this.playTone(600, 'sine', 0.1);
        setTimeout(() => this.playTone(800, 'sine', 0.2), 100);
    }

    playIncorrect() {
        this.init();
        this.playTone(300, 'sawtooth', 0.1);
        setTimeout(() => this.playTone(250, 'sawtooth', 0.2), 100);
    }

    playTimeout() {
        this.init();
        this.playTone(400, 'square', 0.5, 0.05);
    }
}
