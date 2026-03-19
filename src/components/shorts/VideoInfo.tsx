import { useState } from 'react';
import { User } from 'lucide-react';

interface VideoInfoProps {
  channelName: string;
  profileImage: string;
  description: string;
  title: string;
}

export default function VideoInfo({ channelName, profileImage, description, title }: VideoInfoProps) {
  const [subscribed, setSubscribed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex flex-col gap-3 max-w-[75%]">
      {/* Channel row */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
          {profileImage ? (
            <img src={profileImage} alt={channelName} className="w-full h-full object-cover" />
          ) : (
            <User className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        <span className="text-foreground font-medium text-sm truncate">@{channelName}</span>
        <button
          onClick={() => setSubscribed(!subscribed)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex-shrink-0 ${
            subscribed
              ? 'bg-secondary text-secondary-foreground'
              : 'bg-foreground text-background'
          }`}
        >
          {subscribed ? 'Subscribed' : 'Subscribe'}
        </button>
      </div>

      {/* Description */}
      <div>
        <p
          className={`text-foreground text-[13px] leading-snug ${
            expanded ? '' : 'line-clamp-2'
          }`}
        >
          {title} {description}
        </p>
        {description.length > 60 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-muted-foreground text-xs mt-0.5"
          >
            {expanded ? 'Show less' : '...more'}
          </button>
        )}
      </div>
    </div>
  );
}
