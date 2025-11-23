import { useRef, useCallback } from 'react';

export const useTimelineAudio = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundBuffersRef = useRef<Map<number, AudioBuffer>>(new Map());
  const isInitializedRef = useRef(false);

  // Initialize audio context (call this on user interaction)
  const initAudio = useCallback(async () => {
    if (isInitializedRef.current) return;

    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // For now, we'll create subtle beep sounds as placeholders
      // Replace these with actual motorcycle sound files later
      const sounds = [
        { frequency: 220, duration: 0.3 }, // Low engine rumble
        { frequency: 330, duration: 0.25 }, // Mid rev
        { frequency: 440, duration: 0.2 }, // Higher rev
      ];

      for (let i = 0; i < 8; i++) {
        const sound = sounds[i % sounds.length];
        const buffer = await createSynthSound(
          audioContextRef.current,
          sound.frequency,
          sound.duration
        );
        soundBuffersRef.current.set(i, buffer);
      }

      isInitializedRef.current = true;
      console.log('Timeline audio initialized');
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }, []);

  // Create a synthetic sound (placeholder for actual motorcycle sounds)
  const createSynthSound = async (
    context: AudioContext,
    frequency: number,
    duration: number
  ): Promise<AudioBuffer> => {
    const sampleRate = context.sampleRate;
    const length = sampleRate * duration;
    const buffer = context.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    // Create a simple engine-like sound with multiple harmonics
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 3); // Decay envelope
      
      // Multiple harmonics for richer sound
      data[i] = envelope * (
        Math.sin(2 * Math.PI * frequency * t) * 0.4 +
        Math.sin(2 * Math.PI * frequency * 2 * t) * 0.2 +
        Math.sin(2 * Math.PI * frequency * 3 * t) * 0.1
      );
    }

    return buffer;
  };

  // Play sound for a milestone
  const playMilestoneSound = useCallback((milestoneIndex: number) => {
    if (!audioContextRef.current || !soundBuffersRef.current.has(milestoneIndex)) {
      return;
    }

    try {
      const source = audioContextRef.current.createBufferSource();
      const gainNode = audioContextRef.current.createGain();
      
      source.buffer = soundBuffersRef.current.get(milestoneIndex)!;
      
      // Subtle volume (0.15 = 15% volume)
      gainNode.gain.value = 0.15;
      
      source.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      source.start(0);
      
      console.log(`Playing sound for milestone ${milestoneIndex}`);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }, []);

  // Load actual audio file (for when you add real motorcycle sounds)
  const loadAudioFile = useCallback(async (url: string, milestoneIndex: number) => {
    if (!audioContextRef.current) return;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      soundBuffersRef.current.set(milestoneIndex, audioBuffer);
      console.log(`Loaded audio for milestone ${milestoneIndex}`);
    } catch (error) {
      console.error(`Error loading audio file for milestone ${milestoneIndex}:`, error);
    }
  }, []);

  return {
    initAudio,
    playMilestoneSound,
    loadAudioFile,
  };
};
