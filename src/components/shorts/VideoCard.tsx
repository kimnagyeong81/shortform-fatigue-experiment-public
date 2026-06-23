import { useState, useCallback, useEffect, useRef } from 'react';
import { Play } from 'lucide-react';
import VideoActions from './VideoActions';
import VideoInfo from './VideoInfo';
import { bgColorForIndex, type VideoData } from '@/data/mockVideos';

interface VideoCardProps {
  video: VideoData;
  index: number;
  isActive: boolean;
  onLike: (videoId: string, liked: boolean) => void;
  onComment: (videoId: string) => void;
  onShare: (videoId: string) => void;
  onPlayStateChange: (videoId: string, playing: boolean) => void;
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
  const [isVideoReady, setIsVideoReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const tryPlay = useCallback(() => {
    const el = videoRef.current;
    if (!el || !isActive || paused) return;

    // 모바일 자동재생 안정화
    el.muted = true;
    el.playsInline = true;

    const playPromise = el.play();

    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.log('video autoplay blocked:', err);
      });
    }
  }, [isActive, paused]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    if (isActive) {
      el.muted = true;
      el.playsInline = true;

      if (!paused) {
        tryPlay();
      } else {
        el.pause();
      }
    } else {
      el.pause();
      el.currentTime = 0;
      setProgress(0);
      setPaused(false);
      setIsVideoReady(false);
    }
  }, [isActive, paused, tryPlay]);

  const togglePause = useCallback(() => {
    const el = videoRef.current;
    if (!el || !isActive) return;

    setPaused((prev) => {
      const nextPaused = !prev;

      if (nextPaused) {
        el.pause();
        onPlayStateChange(video.video_id, false);
      } else {
        el.muted = true;
        el.playsInline = true;

        el.play().catch((err) => {
          console.log('video play blocked:', err);
        });

        onPlayStateChange(video.video_id, true);
      }

      return nextPaused;
    });
  }, [isActive, onPlayStateChange, video.video_id]);

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
        src={video.video_url}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        muted
        playsInline
        autoPlay={isActive && !paused}
        preload="auto"
        poster={video.thumbnail || undefined}
        disablePictureInPicture
        onLoadedData={() => {
          setIsVideoReady(true);
          tryPlay();
        }}
        onCanPlay={() => {
          setIsVideoReady(true);
          tryPlay();
        }}
        onTimeUpdate={(e) => {
          const el = e.currentTarget;
          if (el.duration && !Number.isNaN(el.duration)) {
            setProgress((el.currentTime / el.duration) * 100);
          }
        }}
      />

      {!isVideoReady && isActive && (
        <div className="absolute inset-0 z-0 flex items-center justify-center bg-black">
          <div className="text-sm text-white/70">영상 로딩 중...</div>
        </div>
      )}

      {paused && isActive && (
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
