// src/components/shorts/ShortsPlayer.tsx

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
  const currentVideo = mockVideos[currentIndex];
  const playback = useVideoPlayback();
  const prevIndexRef = useRef(0);
  const initializedRef = useRef(false);

  // 세션 시작 + 첫 영상 impression
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    initSession().then((res) => {
      console.log('initSession done:', res);
      console.log('first video impression:', mockVideos[0].video_id);

      logEvent('video_impression', { videoId: mockVideos[0].video_id });
      playback.play();
    });

    const handleBeforeUnload = () => {
      console.log('before unload');
      playback.pause();
      endSession();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [initSession, logEvent, playback, endSession]);

  // 스크롤해서 현재 영상 index 계산
  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return;

    let scrollTimeout: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      clearTimeout(scrollTimeout);

      scrollTimeout = setTimeout(() => {
        const idx = Math.round(feed.scrollTop / feed.clientHeight);
        console.log('scroll idx:', idx, 'currentIndex:', currentIndex);

        if (idx !== currentIndex && idx >= 0 && idx < mockVideos.length) {
          setCurrentIndex(idx);
        }
      }, 100);
    };

    feed.addEventListener('scroll', handleScroll, { passive: true });
    return () => feed.removeEventListener('scroll', handleScroll);
  }, [currentIndex]);

  // 영상 바뀔 때 이전 영상 skip/complete 저장
  useEffect(() => {
    if (prevIndexRef.current !== currentIndex) {
      const watchDur = playback.getWatchDuration();
      const prevVideo = mockVideos[prevIndexRef.current];
      const completed = watchDur >= prevVideo.duration_sec * 0.9;

      console.log('video changed');
      console.log('prevIndex:', prevIndexRef.current);
      console.log('currentIndex:', currentIndex);
      console.log('prevVideoId:', prevVideo.video_id);
      console.log('watchDur:', watchDur);
      console.log('event type:', completed ? 'complete' : 'skip');

      logEvent(completed ? 'complete' : 'skip', {
        videoId: prevVideo.video_id,
        watchDurationSec: watchDur,
        playbackPositionSec: watchDur,
      });

      prevIndexRef.current = currentIndex;

      playback.reset();
      playback.play();

      console.log('new video impression:', mockVideos[currentIndex].video_id);
      logEvent('video_impression', { videoId: mockVideos[currentIndex].video_id });
    }
  }, [currentIndex, playback, logEvent]);

  // play / pause 이벤트 저장
  const handlePlayStateChange = useCallback(
    (playing: boolean) => {
      console.log('handlePlayStateChange:', playing, currentVideo.video_id);

      if (playing) {
        playback.play();
        logEvent('play', { videoId: currentVideo.video_id });
      } else {
        playback.pause();
        const dur = playback.getWatchDuration();

        console.log('pause duration:', dur);

        logEvent('pause', {
          videoId: currentVideo.video_id,
          watchDurationSec: dur,
        });
      }
    },
    [currentVideo.video_id, playback, logEvent]
  );

  // 좋아요 / 댓글 / 공유 이벤트 저장
  const handleLike = useCallback(
    (videoId: string, liked: boolean) => {
      console.log('like event:', videoId, liked);
      logEvent(liked ? 'like' : 'unlike', { videoId });
    },
    [logEvent]
  );

  const handleComment = useCallback(
    (videoId: string) => {
      console.log('comment event:', videoId);
      logEvent('comment_open', { videoId });
    },
    [logEvent]
  );

  const handleShare = useCallback(
    (videoId: string) => {
      console.log('share event:', videoId);
      logEvent('share_click', { videoId });
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
              onPlayStateChange={i === currentIndex ? handlePlayStateChange : () => {}}
            />
          </div>
        ))}
      </div>
    </div>
  );
}