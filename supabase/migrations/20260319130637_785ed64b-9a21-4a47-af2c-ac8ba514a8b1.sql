
-- Create participants table
CREATE TABLE public.participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read participants" ON public.participants FOR SELECT USING (true);
CREATE POLICY "Anyone can insert participants" ON public.participants FOR INSERT WITH CHECK (true);

-- Create sessions table
CREATE TABLE public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE
);
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read sessions" ON public.sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert sessions" ON public.sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update sessions" ON public.sessions FOR UPDATE USING (true);

-- Create videos table
CREATE TABLE public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_url TEXT,
  thumbnail TEXT,
  title TEXT NOT NULL,
  description TEXT,
  channel_name TEXT NOT NULL,
  profile_image TEXT,
  like_count INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  share_count INTEGER NOT NULL DEFAULT 0,
  duration_sec INTEGER NOT NULL DEFAULT 60,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read videos" ON public.videos FOR SELECT USING (true);
CREATE POLICY "Anyone can insert videos" ON public.videos FOR INSERT WITH CHECK (true);

-- Create event type enum
CREATE TYPE public.video_event_type AS ENUM (
  'session_start', 'video_impression', 'play', 'pause', 'resume',
  'skip', 'complete', 'like', 'unlike', 'comment_open',
  'share_click', 'session_end', 'exit'
);

-- Create video_events table
CREATE TABLE public.video_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  video_id UUID REFERENCES public.videos(id) ON DELETE SET NULL,
  sequence_index INTEGER NOT NULL DEFAULT 0,
  event_type public.video_event_type NOT NULL,
  event_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  playback_position_sec NUMERIC DEFAULT 0,
  watch_duration_sec NUMERIC DEFAULT 0,
  metadata JSONB DEFAULT '{}'
);
ALTER TABLE public.video_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read video_events" ON public.video_events FOR SELECT USING (true);
CREATE POLICY "Anyone can insert video_events" ON public.video_events FOR INSERT WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_video_events_session ON public.video_events(session_id);
CREATE INDEX idx_video_events_participant ON public.video_events(participant_id);
CREATE INDEX idx_video_events_video ON public.video_events(video_id);
CREATE INDEX idx_videos_order ON public.videos(order_index);
