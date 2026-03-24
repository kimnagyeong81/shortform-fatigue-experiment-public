//src\hooks\useVideoPlayback.ts


import { useRef, useCallback, useEffect } from 'react';

interface PlaybackState {
  startTime: number | null;
  accumulatedWatch: number;
  isPlaying: boolean;
}

export function useVideoPlayback(videoId: string) {
  const state = useRef<PlaybackState>({
    startTime: null,
    accumulatedWatch: 0,
    isPlaying: false,
  });

  const reset = useCallback(() => {
    state.current = { startTime: null, accumulatedWatch: 0, isPlaying: false };
  }, []);

  const play = useCallback(() => {
    state.current.startTime = Date.now();
    state.current.isPlaying = true;
  }, []);

  const pause = useCallback(() => {
    if (state.current.startTime && state.current.isPlaying) {
      state.current.accumulatedWatch += (Date.now() - state.current.startTime) / 1000;
      state.current.startTime = null;
    }
    state.current.isPlaying = false;
  }, []);

  const getWatchDuration = useCallback(() => {
    let total = state.current.accumulatedWatch;
    if (state.current.startTime && state.current.isPlaying) {
      total += (Date.now() - state.current.startTime) / 1000;
    }
    return Math.round(total * 100) / 100;
  }, []);

  // Reset when video changes
  useEffect(() => {
    reset();
  }, [videoId, reset]);

  return { play, pause, getWatchDuration, reset };
}
