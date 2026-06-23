import { useState, useCallback, useEffect, useRef } from 'react';
import { Play } from 'lucide-react';
import VideoActions from './VideoActions';
import VideoInfo from './VideoInfo';
import { bgColorForIndex, type VideoData } from '@/data/mockVideos';

interface VideoCardProps {
  video: VideoData;
  index: number;
  isActive: boolean;
  hasStarted: boolean;
  onLike: (videoId: string, liked: boolean) => void;
  onComment: (videoId: string) => void;
  onShare: (videoId: string) => void;
  onPlayStateChange: (videoId: string, playing: boolean) => void;
}

export default function VideoCard({
  video,
  index,
  isActive,
  hasStarted,
  onLike,
  onComment,
  onShare,
  onPlayStateChange,
}: VideoCardProps) {
  const [liked, setLiked] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [playBlocked, setPlayBlocked] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const forcePlay = useCallback(async () => {
    const el = videoRef.current;

    if (!el || !isActive || !hasStarted) return false;

    try {
      el.playsInline = true;
      el.muted = false;
      el.volume = 1;

      await el.play();

      setPaused(false);
      setPlayBlocked(false);
      setIsVideoReady(true);

      return true;
    } catch (err) {
      console.log('video play blocked:', err);
      setPlayBlocked(true);
      return false;
    }
  }, [isActive, hasStarted]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    if (!hasStarted) {
      el.pause();
      return;
    }

    if (isActive) {
      el.playsInline = true;
      el.muted = false;
      el.volume = 1;

      if (!paused) {
        forcePlay();
      } else {
        el.pause();
      }
    } else {
      el.pause();
      el.currentTime = 0;

      setProgress(0);
      setPaused(false);
      setIsVideoReady(false);
      setPlayBlocked(false);
    }
  }, [isActive, hasStarted, paused, forcePlay]);

  const togglePause = useCallback(() => {
    const el = videoRef.current;
    if (!el || !isActive || !hasStarted) return;

    /*
      핵심 수정:
      모바일에서 소리 있는 자동재생이 막히면 playBlocked=true가 됨.
      이때 첫 번째 화면 터치는 pause 토글이 아니라 "재생 재시도"로 처리해야 함.
      그래야 두 번 눌러야 재생되는 문제가 줄어듦.
    */
    if (playBlocked) {
      forcePlay().then((success) => {
        if (success) {
          onPlayStateChange(video.video_id, true);
        }
      });

      return;
    }

    setPaused((prev) => {
      const nextPaused = !prev;

      if (nextPaused) {
        el.pause();
        onPlayStateChange(video.video_id, false);
      } else {
        forcePlay().then((success) => {
          if (success) {
            onPlayStateChange(video.video_id, true);
          }
        });
      }

      return nextPaused;
    });
  }, [
    isActive,
    hasStarted,
    playBlocked,
    forcePlay,
    onPlayStateChange,
    video.video_id,
  ]);

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
      <video
        ref={videoRef}
        data-active={isActive ? 'true' : 'false'}
        src={video.video_url}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        playsInline
        preload="auto"
        autoPlay={isActive && hasStarted && !paused}
        muted={false}
        poster={video.thumbnail || undefined}
        disablePictureInPicture
        onLoadedData={() => {
          setIsVideoReady(true);
          if (isActive && hasStarted && !paused) {
            forcePlay();
          }
        }}
        onCanPlay={() => {
          setIsVideoReady(true);
          if (isActive && hasStarted && !paused) {
            forcePlay();
          }
        }}
        onPlaying={() => {
          setIsVideoReady(true);
          setPlayBlocked(false);
        }}
        onTimeUpdate={(e) => {
          const el = e.currentTarget;
          if (el.duration && !Number.isNaN(el.duration)) {
            setProgress((el.currentTime / el.duration) * 100);
          }
        }}
      />

      {!isVideoReady && isActive && hasStarted && (
        <div className="absolute inset-0 z-0 flex items-center justify-center bg-black">
          <div className="text-sm text-white/70">영상 로딩 중...</div>
        </div>
      )}

      {(paused || playBlocked) && isActive && hasStarted && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-background/30 flex items-center justify-center backdrop-blur-sm">
            <Play className="w-8 h-8 text-foreground ml-1" />
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 h-60 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

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

      <div className="absolute bottom-0 left-0 right-0 h-[3px] z-30">
        <div
          className="h-full bg-foreground transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
