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
  onPlayStateChange: (playing: boolean) => void;
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
      onPlayStateChange(true);
      intervalRef.current = setInterval(() => {
        elapsedRef.current += 0.1;
        const pct = Math.min((elapsedRef.current / video.duration_sec) * 100, 100);
        setProgress(pct);
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (!isActive) {
        elapsedRef.current = 0;
        setProgress(0);
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, paused, video.duration_sec, onPlayStateChange]);

  const togglePause = useCallback(() => {
    setPaused((p) => {
      onPlayStateChange(p); // if was paused, now playing
      return !p;
    });
  }, [onPlayStateChange]);

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
      {/* Simulated video area with gradient */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-muted-foreground/30 text-6xl font-bold select-none">
          {index + 1}
        </div>
      </div>

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
