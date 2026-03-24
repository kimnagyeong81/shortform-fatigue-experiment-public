// src/components/shorts/VideoActions.tsx
//오른쪽 세로 버튼 영역 UI를 만드는 컴포넌트. 즉 Shorts 화면에서 보이는 좋아요, 싫어요, 댓글, 공유, 더보기
//DB에 직접 저장하는 로직은 없고, 버튼이 눌렸을 때 어떤 함수를 호출할지 연결하는 UI 컴포넌트

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
  onLike: () => void;     //즉 버튼 눌렀을 때 실행할 함수
  onDislike: () => void;    //즉 버튼 눌렀을 때 실행할 함수
  onComment: () => void;    //즉 버튼 눌렀을 때 실행할 함수
  onShare: () => void;    //즉 버튼 눌렀을 때 실행할 함수
  onExtra: () => void;    //즉 버튼 눌렀을 때 실행할 함수
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
