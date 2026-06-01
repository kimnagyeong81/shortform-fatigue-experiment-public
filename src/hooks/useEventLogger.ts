// src/hooks/useEventLogger.ts
// MongoDB Atlas 저장용 로깅 훅
// React 앱에서 발생한 세션/행동 로그를 FastAPI로 보내고,
// FastAPI가 MongoDB Atlas의 sessions, video_events 컬렉션에 저장한다.

import { useCallback, useRef } from 'react';

type EventType =
  | 'session_start'
  | 'video_impression'
  | 'play'
  | 'pause'
  | 'resume'
  | 'skip'
  | 'complete'
  | 'like'
  | 'unlike'
  | 'comment_open'
  | 'share_click'
  | 'session_end'
  | 'exit';

interface LogParams {
  videoId?: string;
  playbackPositionSec?: number;
  watchDurationSec?: number;
  metadata?: Record<string, unknown>;
}

// .env에 VITE_API_BASE_URL=http://127.0.0.1:8000 을 넣으면 그 값을 쓰고,
// 없으면 기본값으로 로컬 FastAPI 서버를 사용한다.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

function getDeviceType() {
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    ? 'mobile'
    : 'desktop';
}

export function useEventLogger() {
  const participantId = useRef<string | null>(null);
  const sessionId = useRef<string | null>(null);
  const sequenceIndex = useRef(0);
  const initialized = useRef(false);

  const sendEventToServer = useCallback(async (eventDoc: Record<string, unknown>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventDoc),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Event log error:', response.status, errorText);
      }
    } catch (error) {
      console.error('Event log network error:', error);
    }
  }, []);

  const logEvent = useCallback(
    async (eventType: EventType, params?: LogParams) => {
      if (!participantId.current || !sessionId.current) {
        console.warn('Event ignored because session is not initialized:', eventType);
        return;
      }

      const eventDoc = {
        participant_id: participantId.current,
        session_id: sessionId.current,
        video_id: params?.videoId ?? null,
        sequence_index: sequenceIndex.current++,
        event_type: eventType,
        playback_position_sec: params?.playbackPositionSec ?? null,
        watch_duration_sec: params?.watchDurationSec ?? null,
        metadata: params?.metadata ?? {},
      };

      await sendEventToServer(eventDoc);
    },
    [sendEventToServer]
  );

  const initSession = useCallback(
    async (externalId?: string) => {
      if (initialized.current) {
        return {
          participantId: participantId.current,
          sessionId: sessionId.current,
        };
      }

      initialized.current = true;

      const newParticipantId = externalId || `anon_${Date.now()}`;
      const newSessionId = `session_${Date.now()}`;

      participantId.current = newParticipantId;
      sessionId.current = newSessionId;
      sequenceIndex.current = 0;

      const sessionDoc = {
        participant_id: newParticipantId,
        session_id: newSessionId,
        metadata: {
          experiment_version: 'v1',
          device: getDeviceType(),
          user_agent: navigator.userAgent,
          screen_width: window.innerWidth,
          screen_height: window.innerHeight,
        },
      };

      try {
        const response = await fetch(`${API_BASE_URL}/sessions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sessionDoc),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Session creation error:', response.status, errorText);
        }
      } catch (error) {
        console.error('Session creation network error:', error);
      }

      await logEvent('session_start', {
        metadata: {
          experiment_version: 'v1',
          device: getDeviceType(),
          user_agent: navigator.userAgent,
          screen_width: window.innerWidth,
          screen_height: window.innerHeight,
        },
      });

      return {
        participantId: newParticipantId,
        sessionId: newSessionId,
      };
    },
    [logEvent]
  );

  const endSession = useCallback(async () => {
    if (!participantId.current || !sessionId.current) return;

    await logEvent('session_end', {
      metadata: {
        ended_at_client: new Date().toISOString(),
      },
    });
  }, [logEvent]);

  return {
    initSession,
    logEvent,
    endSession,
    participantId,
    sessionId,
  };
}