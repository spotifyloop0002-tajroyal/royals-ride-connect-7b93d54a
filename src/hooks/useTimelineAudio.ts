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
      
      // Load actual motorcycle sound files
      const soundFiles = [
        '/sounds/bike-1.mp3',
        '/sounds/bike-2.mp3',
        '/sounds/bike-3.mp3',
        '/sounds/bike-4.mp3',
        '/sounds/bike-5.mp3',
        '/sounds/bike-6.mp3',
        '/sounds/bike-7.mp3',
        '/sounds/bike-8.mp3',
      ];

      for (let i = 0; i < soundFiles.length; i++) {
        await loadAudioFile(soundFiles[i], i);
      }

      isInitializedRef.current = true;
      console.log('Timeline audio initialized with motorcycle sounds');
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }, []);

  // Load actual audio file
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

  // Track currently playing sources for each milestone
  const playingSourcesRef = useRef<Map<number, AudioBufferSourceNode>>(new Map());

  // Play sound for a milestone (restarts from beginning on each call)
  const playMilestoneSound = useCallback((milestoneIndex: number) => {
    if (!audioContextRef.current || !soundBuffersRef.current.has(milestoneIndex)) {
      return;
    }

    try {
      // Stop any currently playing sound for this milestone
      const existingSource = playingSourcesRef.current.get(milestoneIndex);
      if (existingSource) {
        try {
          existingSource.stop();
        } catch (e) {
          // Source may already be stopped
        }
        playingSourcesRef.current.delete(milestoneIndex);
      }

      const source = audioContextRef.current.createBufferSource();
      const gainNode = audioContextRef.current.createGain();
      
      source.buffer = soundBuffersRef.current.get(milestoneIndex)!;
      
      // Subtle volume (0.2 = 20% volume)
      gainNode.gain.value = 0.2;
      
      source.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      // Clean up reference when sound ends
      source.onended = () => {
        playingSourcesRef.current.delete(milestoneIndex);
      };
      
      playingSourcesRef.current.set(milestoneIndex, source);
      source.start(0);
      
      console.log(`Playing sound for milestone ${milestoneIndex}`);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }, []);

  return {
    initAudio,
    playMilestoneSound,
  };
};
