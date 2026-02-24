import { useRef, useCallback } from 'react';

export const useTimelineAudio = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundBuffersRef = useRef<Map<number, AudioBuffer>>(new Map());
  const isInitializedRef = useRef(false);
  const loadingRef = useRef<Set<number>>(new Set());

  const loadAudioFile = useCallback(async (url: string, milestoneIndex: number) => {
    if (!audioContextRef.current || soundBuffersRef.current.has(milestoneIndex) || loadingRef.current.has(milestoneIndex)) return;
    loadingRef.current.add(milestoneIndex);

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      soundBuffersRef.current.set(milestoneIndex, audioBuffer);
    } catch {
      // silently fail
    } finally {
      loadingRef.current.delete(milestoneIndex);
    }
  }, []);

  const initAudio = useCallback(async () => {
    if (isInitializedRef.current) return;
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      isInitializedRef.current = true;
    } catch {
      // silently fail
    }
  }, []);

  const playingSourcesRef = useRef<Map<number, AudioBufferSourceNode>>(new Map());

  const playMilestoneSound = useCallback((milestoneIndex: number) => {
    // Lazy-load audio on demand instead of all at once
    const soundFile = `/sounds/bike-${milestoneIndex + 1}.mp3`;
    if (!soundBuffersRef.current.has(milestoneIndex)) {
      loadAudioFile(soundFile, milestoneIndex);
      return; // will play next time
    }

    if (!audioContextRef.current) return;

    try {
      const existingSource = playingSourcesRef.current.get(milestoneIndex);
      if (existingSource) {
        try { existingSource.stop(); } catch {}
        playingSourcesRef.current.delete(milestoneIndex);
      }

      const source = audioContextRef.current.createBufferSource();
      const gainNode = audioContextRef.current.createGain();
      
      source.buffer = soundBuffersRef.current.get(milestoneIndex)!;
      gainNode.gain.value = 0.2;
      
      source.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      source.onended = () => {
        playingSourcesRef.current.delete(milestoneIndex);
      };
      
      playingSourcesRef.current.set(milestoneIndex, source);
      source.start(0);
    } catch {
      // silently fail
    }
  }, [loadAudioFile]);

  return {
    initAudio,
    playMilestoneSound,
  };
};
