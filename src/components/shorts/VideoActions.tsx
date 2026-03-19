import { ThumbsUp, ThumbsDown, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';

function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
}

interface VideoActionsProps {
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLiked: boolean;
  onLike: () => void;
  onDislike: () => void;
  onComment: () => void;
  onShare: () => void;
  onExtra: () => void;
}

function ActionButton({
  icon,
  label,
  onClick,
  active,
}: {
  icon: React.ReactNode;
  label?: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 group"
    >
      <div
        className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors
          ${active ? 'bg-foreground/20' : 'bg-foreground/10'}
          group-active:scale-90`}
      >
        {icon}
      </div>
      {label && (
        <span className="text-foreground text-[11px] font-medium">{label}</span>
      )}
    </button>
  );
}

export default function VideoActions({
  likeCount,
  commentCount,
  shareCount,
  isLiked,
  onLike,
  onDislike,
  onComment,
  onShare,
  onExtra,
}: VideoActionsProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <ActionButton
        icon={<ThumbsUp className={`w-6 h-6 ${isLiked ? 'text-primary fill-primary' : 'text-foreground'}`} />}
        label={formatCount(likeCount)}
        onClick={onLike}
        active={isLiked}
      />
      <ActionButton
        icon={<ThumbsDown className="w-6 h-6 text-foreground" />}
        label="Dislike"
        onClick={onDislike}
      />
      <ActionButton
        icon={<MessageCircle className="w-6 h-6 text-foreground" />}
        label={formatCount(commentCount)}
        onClick={onComment}
      />
      <ActionButton
        icon={<Share2 className="w-6 h-6 text-foreground" />}
        label="Share"
        onClick={onShare}
      />
      <ActionButton
        icon={<MoreHorizontal className="w-6 h-6 text-foreground" />}
        onClick={onExtra}
      />
    </div>
  );
}
