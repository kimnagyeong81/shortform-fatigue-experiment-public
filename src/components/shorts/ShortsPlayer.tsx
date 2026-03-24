// src/components/shorts/ShortsPlayer.tsx 숏폼 피드 전체를 관리하면서, 사용자의 시청 흐름과 행동 이벤트를 DB 로깅 함수와 연결하는 중심 컴포넌트

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

  
  useEffect(() => {                             //실험 시작 시점과 종료 시점을 잡는 코드
    if (initializedRef.current) return;
    initializedRef.current = true;
    initSession().then(() => {
      logEvent('video_impression', { videoId: mockVideos[0].video_id });  //“첫 영상이 화면에 보였다” 기록
      playback.play();  // 첫 영상 시청시간 계산 시작
    });

    const handleBeforeUnload = () => { 
      playback.pause();
      endSession();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

 
  useEffect(() => {                 // 사용자가 위아래로 넘겼을 때, 현재 보고 있는 영상 번호를 계산하는 코드
    const feed = feedRef.current;
    if (!feed) return;

    let scrollTimeout: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const idx = Math.round(feed.scrollTop / feed.clientHeight);              // 현재 스크롤 위치를 화면 높이로 나눠서 몇 번째 영상인지 계산
        if (idx !== currentIndex && idx >= 0 && idx < mockVideos.length) {
          setCurrentIndex(idx);
        }
      }, 100);
    };

    feed.addEventListener('scroll', handleScroll, { passive: true });
    return () => feed.removeEventListener('scroll', handleScroll);
  }, [currentIndex]);

  // 영상이 바뀔 때 skip/complete 기록
  useEffect(() => {
    if (prevIndexRef.current !== currentIndex) {
      const watchDur = playback.getWatchDuration();    // 이전 영상을 몇 초 봤는지 가져옴
      const prevVideo = mockVideos[prevIndexRef.current];
      const completed = watchDur >= prevVideo.duration_sec * 0.9;   //이전 영상 길이의 90% 이상 봤으면 complete

      // Log skip/complete for previous video
      logEvent(completed ? 'complete' : 'skip', {     // 그걸 DB에 기록
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

  const handlePlayStateChange = useCallback((playing: boolean) => {     // 영상 카드에서 재생 상태가 바뀌면 호출되는 함수
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


  //좋아요/댓글/공유 이벤트
  const handleLike = useCallback((videoId: string, liked: boolean) => {
    logEvent(liked ? 'like' : 'unlike', { videoId });
  }, [logEvent]);

  const handleComment = useCallback((videoId: string) => {
    logEvent('comment_open', { videoId });
  }, [logEvent]);

  const handleShare = useCallback((videoId: string) => {
    logEvent('share_click', { videoId });
  }, [logEvent]);


  //화면 렌더링 부분 -> 보이는 영상만 실제 추적 대상으로 만들고 있음
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
