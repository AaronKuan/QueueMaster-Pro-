import { useCallback } from 'react';

export const useSound = () => {
  const playDing = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      // Bell-like sound
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5); // Drop to A4

      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.5);
    } catch (e) {
      console.error('Audio playback failed', e);
    }
  }, []);

  return { playDing };
};