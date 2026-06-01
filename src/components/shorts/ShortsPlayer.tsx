import { useState, useRef, useCallback, useEffect } from 'react';
import ShortsHeader from './ShortsHeader';
import VideoCard from './VideoCard';
import { useEventLogger } from '@/hooks/useEventLogger';
import { useVideoPlayback } from '@/hooks/useVideoPlayback';
import { mockVideos } from '@/data/mockVideos';

export default function ShortsPlayer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const feedRef = useRef<HTMLDivElement>(null);

  const { initSession, logEvent, endSession } = useEventLogger();
  const { play, pause, getWatchDuration, reset } = useVideoPlayback();

  const prevIndexRef = useRef(0);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const startExperiment = async () => {
      await initSession();

      const firstVideo = mockVideos[0];

      await logEvent('video_impression', {
        videoId: firstVideo.video_id,
        metadata: {
          video_index: 0,
          order_index: firstVideo.order_index,
          duration_sec: firstVideo.duration_sec,
        },
      });

      play();
    };

    startExperiment();

    const handleBeforeUnload = () => {
      pause();
      endSession();
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
    if (prevIndexRef.current === currentIndex) return;

    pause();

    const fromIndex = prevIndexRef.current;
    const toIndex = currentIndex;

    const prevVideo = mockVideos[fromIndex];
    const currentVideo = mockVideos[toIndex];

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
      logEvent('comment_open', {
        videoId,
      });
    },
    [logEvent]
  );

  const handleShare = useCallback(
    (videoId: string) => {
      logEvent('share_click', {
        videoId,
      });
    },
    [logEvent]
  );

  return (
    <div
      className="relative w-full h-screen max-w-md mx-auto overflow-hidden"
      style={{ backgroundColor: 'hsl(var(--shorts-bg))' }}
    >
      <ShortsHeader />

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