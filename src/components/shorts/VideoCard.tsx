// src/components/shorts/VideoCard.tsx
// 숏폼 영상 1개 카드를 만드는 컴포넌트. 즉, 좋아요 상태, 일시정지 상태, 재생 진행률, 오른쪽 액션 버튼, 아래 영상 정보, 클릭 시 pause/play 전환을 처리


import { useState, useCallback, useEffect, useRef } from 'react';
import { Play } from 'lucide-react';
import VideoActions from './VideoActions';
import VideoInfo from './VideoInfo';
import { bgColorForIndex, type VideoData } from '@/data/mockVideos';

interface VideoCardProps {    //부모(ShortsPlayer)에게서 받는 값들
  video: VideoData;  //현재 영상 데이터
  index: number;    // 몇번째 영상인지
  isActive: boolean;  //지금 화면에 보이는 활성 영상인지
  onLike: (videoId: string, liked: boolean) => void;  //좋아요 눌렀을 때 부모에 알리는 함수
  onComment: (videoId: string) => void;  //댓글 버튼 눌렀을 때 부모에 알리는 함수
  onShare: (videoId: string) => void;  //공유 버튼 눌렀을 때 부모에 알리는 함수
  onPlayStateChange: (playing: boolean) => void;  //재생/일시정지 상태가 바뀌었을 때 부모에 알리는 함수
}

export default function VideoCard({
  video,
  index,
  isActive,
  onLike,
  onComment,
  onShare,
  onPlayStateChange,
}: VideoCardProps) {
  const [liked, setLiked] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);

  // Simulate playback progress
  useEffect(() => {
    if (isActive && !paused) {
      onPlayStateChange(true);   //부모에게 “지금 재생 중”이라고 알림
      intervalRef.current = setInterval(() => {
        elapsedRef.current += 0.1;
        const pct = Math.min((elapsedRef.current / video.duration_sec) * 100, 100);  //전체 길이(video.duration_sec) 대비 몇 % 봤는지 계산
        setProgress(pct);
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (!isActive) {
        elapsedRef.current = 0;  //현재 화면에서 벗어난 영상이면 초기화
        setProgress(0);  //현재 화면에서 벗어난 영상이면 초기화
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, paused, video.duration_sec, onPlayStateChange]);


  //즉 화면 전체를 누르면 재생/일시정지 전환
  const togglePause = useCallback(() => {
    setPaused((p) => {
      onPlayStateChange(p); 
      return !p;
    });
  }, [onPlayStateChange]);


  //좋아요 UI 상태를 바꾸고, 실제 이벤트 로깅은 부모(ShortsPlayer)에서
  const handleLike = useCallback(() => {
    const newLiked = !liked;
    setLiked(newLiked);
    onLike(video.video_id, newLiked);
  }, [liked, onLike, video.video_id]);

return (
  <div
    className="relative w-full h-full flex-shrink-0 snap-start snap-always"
    style={{ backgroundColor: bgColorForIndex(index) }}
    onClick={togglePause}
  >
    {/* 실제 영상 영역 */}
    <video
  src={video.video_url}
  className="absolute inset-0 w-full h-full object-cover"
  controls
  playsInline
    />

    {/* Pause indicator */}
    {paused && isActive && (
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <div className="w-16 h-16 rounded-full bg-background/30 flex items-center justify-center backdrop-blur-sm">
          <Play className="w-8 h-8 text-foreground ml-1" />
        </div>
      </div>
    )}

    {/* Bottom gradient overlay */}
    <div className="absolute bottom-0 left-0 right-0 h-60 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

    {/* Actions (right side) */}
    <div
      className="absolute right-3 bottom-28 z-20"
      onClick={(e) => e.stopPropagation()}
    >
      <VideoActions
        likeCount={video.like_count + (liked ? 1 : 0)}
        commentCount={video.comment_count}
        shareCount={video.share_count}
        isLiked={liked}
        onLike={handleLike}
        onDislike={() => {}}
        onComment={() => onComment(video.video_id)}
        onShare={() => onShare(video.video_id)}
        onExtra={() => {}}
      />
    </div>

    {/* Video info (bottom) */}
    <div
      className="absolute left-3 bottom-6 z-20"
      onClick={(e) => e.stopPropagation()}
    >
      <VideoInfo
        channelName={video.channel_name}
        profileImage={video.profile_image}
        description={video.description}
        title={video.title}
      />
    </div>

    {/* Progress bar */}
    <div className="absolute bottom-0 left-0 right-0 h-[3px] z-30">
      <div
        className="h-full bg-foreground transition-all duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
);
}
