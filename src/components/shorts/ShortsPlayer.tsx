import { useState, useRef, useCallback, useEffect } from 'react';
import ShortsHeader from './ShortsHeader';
import VideoCard from './VideoCard';
import { useEventLogger } from '@/hooks/useEventLogger';
import { useVideoPlayback } from '@/hooks/useVideoPlayback';
import { mockVideos } from '@/data/mockVideos';

const DEFAULT_RETURN_URL = 'https://replit.com/@gimnagyeong/Korean-Survey-Site';

export default function ShortsPlayer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEnding, setIsEnding] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const feedRef = useRef<HTMLDivElement>(null);

  const { initSession, logEvent, endSession } = useEventLogger();
  const { play, pause, getWatchDuration, reset } = useVideoPlayback();

  const prevIndexRef = useRef(0);
  const initializedRef = useRef(false);
  const firstImpressionLoggedRef = useRef(false);
  const endingRef = useRef(false);

  const getReturnUrl = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const returnUrl = params.get('returnUrl');

    if (returnUrl) {
      return decodeURIComponent(returnUrl);
    }

    return DEFAULT_RETURN_URL;
  }, []);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const startSession = async () => {
      const params = new URLSearchParams(window.location.search);
      const participantIdFromUrl = params.get('participantId');

      await initSession(participantIdFromUrl ?? undefined);
    };

    startSession();

    const handleBeforeUnload = () => {
      if (endingRef.current) return;

      pause();
      endSession('browser_before_unload');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [initSession, pause, endSession]);

  const handleStartWatching = useCallback(async () => {
    if (hasStarted) return;

    setHasStarted(true);

    const activeVideoEl = feedRef.current?.querySelector<HTMLVideoElement>(
      'video[data-active="true"]'
    );

    if (activeVideoEl) {
      activeVideoEl.playsInline = true;
      activeVideoEl.muted = false;
      activeVideoEl.volume = 1;

      try {
        await activeVideoEl.play();
      } catch (err) {
        console.log('initial video play blocked:', err);
      }
    }

    const firstVideo = mockVideos[currentIndex];

    if (firstVideo && !firstImpressionLoggedRef.current) {
      firstImpressionLoggedRef.current = true;

      await logEvent('video_impression', {
        videoId: firstVideo.video_id,
        metadata: {
          video_index: currentIndex,
          order_index: firstVideo.order_index,
          duration_sec: firstVideo.duration_sec,
          source: 'experiment_start_button',
        },
      });
    }

    play();
  }, [hasStarted, currentIndex, logEvent, play]);

  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return;

    let scrollTimeout: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      if (endingRef.current || !hasStarted) return;

      clearTimeout(scrollTimeout);

      scrollTimeout = setTimeout(() => {
        const idx = Math.round(feed.scrollTop / feed.clientHeight);

        if (idx !== currentIndex && idx >= 0 && idx < mockVideos.length) {
          setCurrentIndex(idx);
        }
      }, 100);
    };

    feed.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(scrollTimeout);
      feed.removeEventListener('scroll', handleScroll);
    };
  }, [currentIndex, hasStarted]);

  useEffect(() => {
    if (endingRef.current || !hasStarted) return;
    if (prevIndexRef.current === currentIndex) return;

    pause();

    const fromIndex = prevIndexRef.current;
    const toIndex = currentIndex;

    const prevVideo = mockVideos[fromIndex];
    const currentVideo = mockVideos[toIndex];

    if (!prevVideo || !currentVideo) return;

    const watchDur = getWatchDuration();
    const completedRatio =
      prevVideo.duration_sec > 0 ? watchDur / prevVideo.duration_sec : 0;
    const completed = completedRatio >= 0.9;

    logEvent(completed ? 'complete' : 'skip', {
      videoId: prevVideo.video_id,
      watchDurationSec: watchDur,
      playbackPositionSec: watchDur,
      metadata: {
        from_video_id: prevVideo.video_id,
        to_video_id: currentVideo.video_id,
        from_video_index: fromIndex,
        to_video_index: toIndex,
        direction: toIndex > fromIndex ? 'down' : 'up',
        is_back_navigation: toIndex < fromIndex,
        video_duration_sec: prevVideo.duration_sec,
        completed_ratio: Math.round(completedRatio * 1000) / 1000,
      },
    });

    prevIndexRef.current = currentIndex;

    reset();
    play();

    logEvent('video_impression', {
      videoId: currentVideo.video_id,
      metadata: {
        video_index: toIndex,
        order_index: currentVideo.order_index,
        duration_sec: currentVideo.duration_sec,
      },
    });
  }, [currentIndex, hasStarted, pause, getWatchDuration, reset, play, logEvent]);

  const handlePlayStateChange = useCallback(
    (videoId: string, playing: boolean) => {
      if (endingRef.current || !hasStarted) return;

      if (playing) {
        play();

        logEvent('play', {
          videoId,
          metadata: {
            source: 'user_tap',
          },
        });
      } else {
        pause();

        const dur = getWatchDuration();

        logEvent('pause', {
          videoId,
          watchDurationSec: dur,
          playbackPositionSec: dur,
          metadata: {
            source: 'user_tap',
          },
        });
      }
    },
    [hasStarted, play, pause, getWatchDuration, logEvent]
  );

  const handleLike = useCallback(
    (videoId: string, liked: boolean) => {
      if (endingRef.current || !hasStarted) return;

      logEvent(liked ? 'like' : 'unlike', {
        videoId,
        metadata: {
          liked,
        },
      });
    },
    [hasStarted, logEvent]
  );

  const handleComment = useCallback(
    (videoId: string) => {
      if (endingRef.current || !hasStarted) return;

      logEvent('comment_open', {
        videoId,
      });
    },
    [hasStarted, logEvent]
  );

  const handleShare = useCallback(
    (videoId: string) => {
      if (endingRef.current || !hasStarted) return;

      logEvent('share_click', {
        videoId,
      });
    },
    [hasStarted, logEvent]
  );

  const handleEndExperiment = useCallback(async () => {
    if (endingRef.current) return;

    endingRef.current = true;
    setIsEnding(true);

    pause();

    const currentVideo = mockVideos[currentIndex];
    const watchDur = getWatchDuration();

    if (currentVideo && hasStarted) {
      await logEvent('pause', {
        videoId: currentVideo.video_id,
        watchDurationSec: watchDur,
        playbackPositionSec: watchDur,
        metadata: {
          source: 'experiment_end_button',
          video_index: currentIndex,
        },
      });
    }

    await endSession('user_clicked_end_button');

    const returnUrl = getReturnUrl();
    window.location.href = returnUrl;
  }, [
    pause,
    getWatchDuration,
    currentIndex,
    hasStarted,
    logEvent,
    endSession,
    getReturnUrl,
  ]);

  return (
    <div
      className="relative w-full h-screen max-w-md mx-auto overflow-hidden"
      style={{ backgroundColor: 'hsl(var(--shorts-bg))' }}
    >
      <ShortsHeader />

      {hasStarted && (
        <button
          type="button"
          onClick={handleEndExperiment}
          disabled={isEnding}
          className="absolute top-20 right-4 z-50 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-black shadow-lg backdrop-blur disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isEnding ? '종료 중...' : '실험 종료'}
        </button>
      )}

      {!hasStarted && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/90 px-6">
          <div className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-xl">
            <h1 className="mb-4 text-2xl font-bold text-black">
              숏폼 시청을 시작합니다
            </h1>

            <p className="mb-6 text-base leading-7 text-gray-700">
              아래 버튼을 누르면 소리와 함께 숏폼 영상 시청이 시작됩니다.
              <br />
              평소 숏폼을 보듯이 자유롭게 시청해 주세요.
            </p>

            <button
              type="button"
              onClick={handleStartWatching}
              className="w-full rounded-2xl bg-blue-700 px-5 py-4 text-lg font-bold text-white shadow"
            >
              소리와 함께 시청 시작
            </button>
          </div>
        </div>
      )}

      <div
        ref={feedRef}
        className="shorts-feed w-full h-full overflow-y-scroll snap-y snap-mandatory"
      >
        {mockVideos.map((video, i) => (
          <div key={video.video_id} className="w-full h-screen flex-shrink-0">
            <VideoCard
              video={video}
              index={i}
              isActive={i === currentIndex}
              hasStarted={hasStarted}
              onLike={handleLike}
              onComment={handleComment}
              onShare={handleShare}
              onPlayStateChange={handlePlayStateChange}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
