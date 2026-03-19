import { useState, useRef, useCallback, useEffect } from 'react';
import ShortsHeader from './ShortsHeader';
import VideoCard from './VideoCard';
import { useEventLogger } from '@/hooks/useEventLogger';
import { useVideoPlayback } from '@/hooks/useVideoPlayback';
import { mockVideos, type VideoData } from '@/data/mockVideos';

export default function ShortsPlayer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const feedRef = useRef<HTMLDivElement>(null);
  const { initSession, logEvent, endSession } = useEventLogger();
  const currentVideo = mockVideos[currentIndex];
  const playback = useVideoPlayback(currentVideo.video_id);
  const prevIndexRef = useRef(0);
  const initializedRef = useRef(false);

  // Init session on mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    initSession().then(() => {
      logEvent('video_impression', { videoId: mockVideos[0].video_id });
      playback.play();
    });

    const handleBeforeUnload = () => {
      playback.pause();
      endSession();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Handle scroll/snap to detect video change
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
    return () => feed.removeEventListener('scroll', handleScroll);
  }, [currentIndex]);

  // Log events when video changes
  useEffect(() => {
    if (prevIndexRef.current !== currentIndex) {
      const watchDur = playback.getWatchDuration();
      const prevVideo = mockVideos[prevIndexRef.current];
      const completed = watchDur >= prevVideo.duration_sec * 0.9;

      // Log skip/complete for previous video
      logEvent(completed ? 'complete' : 'skip', {
        videoId: prevVideo.video_id,
        watchDurationSec: watchDur,
        playbackPositionSec: watchDur,
      });

      prevIndexRef.current = currentIndex;
      playback.reset();
      playback.play();

      // Log impression for new video
      logEvent('video_impression', { videoId: mockVideos[currentIndex].video_id });
    }
  }, [currentIndex]);

  const handlePlayStateChange = useCallback((playing: boolean) => {
    if (playing) {
      playback.play();
      logEvent('play', { videoId: currentVideo.video_id });
    } else {
      playback.pause();
      logEvent('pause', {
        videoId: currentVideo.video_id,
        watchDurationSec: playback.getWatchDuration(),
      });
    }
  }, [currentVideo.video_id, playback, logEvent]);

  const handleLike = useCallback((videoId: string, liked: boolean) => {
    logEvent(liked ? 'like' : 'unlike', { videoId });
  }, [logEvent]);

  const handleComment = useCallback((videoId: string) => {
    logEvent('comment_open', { videoId });
  }, [logEvent]);

  const handleShare = useCallback((videoId: string) => {
    logEvent('share_click', { videoId });
  }, [logEvent]);

  return (
    <div className="relative w-full h-screen max-w-md mx-auto overflow-hidden" style={{ backgroundColor: 'hsl(var(--shorts-bg))' }}>
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
              onPlayStateChange={i === currentIndex ? handlePlayStateChange : () => {}}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
