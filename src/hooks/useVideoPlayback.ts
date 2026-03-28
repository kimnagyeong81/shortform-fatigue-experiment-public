//src\hooks\useVideoPlayback.ts
//현재 영상의 재생 시작 시점과 누적 시청시간을 추적해서, 총 시청시간을 초 단위로 계산해주는 훅 (1.재생 시작 시각 기록 2.pause 될 때까지 본 시간을 누적 3. 현재까지 총 몇 초 봤는지 계산 4. 영상이 바뀌면 초기화)

import { useRef, useCallback } from 'react';

interface PlaybackState {
  startTime: number | null;
  accumulatedWatch: number;
  isPlaying: boolean;
}

export function useVideoPlayback() {
  const state = useRef<PlaybackState>({
    startTime: null,
    accumulatedWatch: 0,
    isPlaying: false,
  });

  const reset = useCallback(() => {
    state.current = {
      startTime: null,
      accumulatedWatch: 0,
      isPlaying: false,
    };
  }, []);

  const play = useCallback(() => {
    if (state.current.isPlaying) return;

    state.current.startTime = Date.now();
    state.current.isPlaying = true;
  }, []);

  const pause = useCallback(() => {
    if (state.current.startTime !== null && state.current.isPlaying) {
      state.current.accumulatedWatch +=
        (Date.now() - state.current.startTime) / 1000;
      state.current.startTime = null;
    }

    state.current.isPlaying = false;
  }, []);

  const getWatchDuration = useCallback(() => {
    let total = state.current.accumulatedWatch;

    if (state.current.startTime !== null && state.current.isPlaying) {
      total += (Date.now() - state.current.startTime) / 1000;
    }

    return Math.round(total * 100) / 100;
  }, []);

  return { play, pause, getWatchDuration, reset };
}