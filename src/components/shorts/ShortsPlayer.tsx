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

  const feedRef = useRef<HTMLDivElement>(null);

  const { initSession, logEvent, endSession } = useEventLogger();
  const { play, pause, getWatchDuration, reset } = useVideoPlayback();

  const prevIndexRef = useRef(0);
  const initializedRef = useRef(false);
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

    const startExperiment = async () => {
      const params = new URLSearchParams(window.location.search);
      const participantIdFromUrl = params.get('participantId');

      await initSession(participantIdFromUrl ?? undefined);

      const firstVideo = mockVideos[0];

      if (firstVideo) {
        await logEvent('video_impression', {
          videoId: firstVideo.video_id,
          metadata: {
            video_index: 0,
            order_index: firstVideo.order_index,
            duration_sec: firstVideo.duration_sec,
          },
        });
      }

      play();
    };

    startExperiment();

    const handleBeforeUnload = () => {
      if (endingRef.current) return;

      pause();
      endSession('browser_before_unload');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [initSession, logEvent, play, pause, endSession]);

  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return;

    let scrollTimeout: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      if (endingRef.current) return;

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
  }, [currentIndex]);

  useEffect(() => {
    if (endingRef.current) return;
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
  }, [currentIndex, pause, getWatchDuration, reset, play, logEvent]);

  const handlePlayStateChange = useCallback(
    (videoId: string, playing: boolean) => {
      if (endingRef.current) return;

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
    [play, pause, getWatchDuration, logEvent]
  );

  const handleLike = useCallback(
    (videoId: string, liked: boolean) => {
      if (endingRef.current) return;

      logEvent(liked ? 'like' : 'unlike', {
        videoId,
        metadata: {
          liked,
        },
      });
    },
    [logEvent]
  );

  const handleComment = useCallback(
    (videoId: string) => {
      if (endingRef.current) return;

      logEvent('comment_open', {
        videoId,
      });
    },
    [logEvent]
  );

  const handleShare = useCallback(
    (videoId: string) => {
      if (endingRef.current) return;

      logEvent('share_click', {
        videoId,
      });
    },
    [logEvent]
  );

  const handleEndExperiment = useCallback(async () => {
    if (endingRef.current) return;

    endingRef.current = true;
    setIsEnding(true);

    pause();

    const currentVideo = mockVideos[currentIndex];
    const watchDur = getWatchDuration();

    if (currentVideo) {
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
  }, [pause, getWatchDuration, currentIndex, logEvent, endSession, getReturnUrl]);

  return (
    <div
      className="relative w-full h-screen max-w-md mx-auto overflow-hidden"
      style={{ backgroundColor: 'hsl(var(--shorts-bg))' }}
    >
      <ShortsHeader />

      <button
        type="button"
        onClick={handleEndExperiment}
        disabled={isEnding}
        className="absolute top-20 right-4 z-50 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-black shadow-lg backdrop-blur disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isEnding ? '종료 중...' : '실험 종료'}
      </button>

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
