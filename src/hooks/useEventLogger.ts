import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

type EventType =
  | 'session_start' | 'video_impression' | 'play' | 'pause' | 'resume'
  | 'skip' | 'complete' | 'like' | 'unlike' | 'comment_open'
  | 'share_click' | 'session_end' | 'exit';

interface LogParams {
  videoId?: string;
  playbackPositionSec?: number;
  watchDurationSec?: number;
  metadata?: Record<string, unknown>;
}

export function useEventLogger() {
  const participantId = useRef<string | null>(null);
  const sessionId = useRef<string | null>(null);
  const sequenceIndex = useRef(0);

  const initSession = useCallback(async (externalId?: string) => {
    // Create participant
    const { data: participant } = await supabase
      .from('participants')
      .insert({ external_id: externalId || `anon_${Date.now()}` })
      .select('id')
      .single();

    if (!participant) return;
    participantId.current = participant.id;

    // Create session
    const { data: session } = await supabase
      .from('sessions')
      .insert({ participant_id: participant.id })
      .select('id')
      .single();

    if (!session) return;
    sessionId.current = session.id;
    sequenceIndex.current = 0;

    // Log session_start
    await logEvent('session_start');
    return { participantId: participant.id, sessionId: session.id };
  }, []);

  const logEvent = useCallback(async (eventType: EventType, params?: LogParams) => {
    if (!participantId.current || !sessionId.current) return;

    const idx = sequenceIndex.current++;
    const { error } = await supabase.from('video_events').insert({
      participant_id: participantId.current,
      session_id: sessionId.current,
      video_id: params?.videoId || null,
      sequence_index: idx,
      event_type: eventType,
      playback_position_sec: params?.playbackPositionSec ?? 0,
      watch_duration_sec: params?.watchDurationSec ?? 0,
      metadata: params?.metadata ?? {},
    });

    if (error) console.error('Event log error:', error);
  }, []);

  const endSession = useCallback(async () => {
    if (!sessionId.current) return;
    await logEvent('session_end');
    await supabase
      .from('sessions')
      .update({ ended_at: new Date().toISOString() })
      .eq('id', sessionId.current);
  }, [logEvent]);

  return { initSession, logEvent, endSession, participantId, sessionId };
}
