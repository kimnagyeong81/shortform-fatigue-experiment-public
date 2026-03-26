// src\hooks\useEventLogger.ts
//참가자와 세션을 만들고, 사용자의 행동 이벤트를 video_events 테이블에 기록하는 DB 로깅 훅 (참가자 생성, 세션 생성, 행동 이벤트를 DB에 저장)

import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

type EventType =  //event_type으로는 이 값들만 기록
  | 'session_start' | 'video_impression' | 'play' | 'pause' | 'resume'
  | 'skip' | 'complete' | 'like' | 'unlike' | 'comment_open'
  | 'share_click' | 'session_end' | 'exit';

interface LogParams {  //logEvent()에 같이 넘길 추가 정보
  videoId?: string;
  playbackPositionSec?: number;
  watchDurationSec?: number;
  metadata?: Record<string, unknown>;
}

export function useEventLogger() {
  const participantId = useRef<string | null>(null);   //현재 참가자 id를 기억
  const sessionId = useRef<string | null>(null);   //현재 세션 id를 기억
  const sequenceIndex = useRef(0);   //이벤트 순번을 기록

  const initSession = useCallback(async (externalId?: string) => {
    //즉 실험 시작할 때 익명 참가자 하나를 DB에 만듦
    const { data: participant } = await supabase   
      .from('participants')
      .insert({ external_id: externalId || `anon_${Date.now()}` })
      .select('id')
      .single();

    if (!participant) return;
    participantId.current = participant.id;

    //참가자가 실험에 들어올 때 새 세션 row를 생성
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

  const logEvent = useCallback(async (eventType: EventType, params?: LogParams) => {  //모든 행동 로그 저장은 결국 여기로 모임.
    if (!participantId.current || !sessionId.current) return;

    const idx = sequenceIndex.current++;
    const row: Record<string, unknown> = {
      participant_id: participantId.current,
      session_id: sessionId.current,
      video_id: params?.videoId || null,
      sequence_index: idx,
      event_type: eventType,
      playback_position_sec: params?.playbackPositionSec ?? 0,
      watch_duration_sec: params?.watchDurationSec ?? 0,
      metadata: params?.metadata ?? {},
    };
    const { error } = await supabase.from('video_events').insert(row as any);    //즉 모든 행동 로그는 결국 여기로 저장됨.

    if (error) console.error('Event log error:', error);
  }, []);

  const endSession = useCallback(async () => {
    if (!sessionId.current) return;
    await logEvent('session_end');
    await supabase
      .from('sessions')
      .update({ ended_at: new Date().toISOString() })   //ended_at에 종료 시간 기록
      .eq('id', sessionId.current);
  }, [logEvent]);

  return { initSession, logEvent, endSession, participantId, sessionId };
}
