// src/hooks/useEventLogger.ts
// MongoDB Atlas 저장용 로깅 훅
// React 앱에서 발생한 세션/행동 로그를 FastAPI로 보내고,
// FastAPI가 MongoDB Atlas의 sessions, video_events 컬렉션에 저장한다.

import { useCallback, useRef } from 'react';

type EventType =
  | 'session_start'
  | 'video_impression'
  | 'video_progress'
  | 'swipe'
  | 'play'
  | 'pause'
  | 'resume'
  | 'skip'
  | 'complete'
  | 'like'
  | 'unlike'
  | 'dislike'
  | 'comment_open'
  | 'share_click'
  | 'more_click'
  | 'session_end'
  | 'exit';

interface LogParams {
  videoId?: string;
  playbackPositionSec?: number;
  watchDurationSec?: number;
  metadata?: Record<string, unknown>;
}

interface SessionResult {
  participantId: string | null;
  sessionId: string | null;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

console.log('[useEventLogger] API_BASE_URL:', API_BASE_URL);

function getDeviceType() {
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    ? 'mobile'
    : 'desktop';
}

function createBaseMetadata() {
  return {
    experiment_version: 'v1',
    device: getDeviceType(),
    user_agent: navigator.userAgent,
    screen_width: window.innerWidth,
    screen_height: window.innerHeight,
    page_url: window.location.href,
  };
}

export function useEventLogger() {
  const participantId = useRef<string | null>(null);
  const sessionId = useRef<string | null>(null);
  const sequenceIndex = useRef(0);

  const initialized = useRef(false);

  // 실험 종료 여부
  // true가 되면 session_end 이후의 모든 행동 로그는 더 이상 저장하지 않음
  const ended = useRef(false);

  const sendEventToServer = useCallback(
    async (eventDoc: Record<string, unknown>) => {
      const url = `${API_BASE_URL}/events`;

      console.log('[useEventLogger] Sending event:', url, eventDoc);

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventDoc),

          // 페이지 이동 직전 session_end 저장 성공률을 조금 높이기 위한 옵션
          keepalive: true,
        });

        console.log('[useEventLogger] Event response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            '[useEventLogger] Event log error:',
            response.status,
            errorText
          );
        }
      } catch (error) {
        console.error('[useEventLogger] Event log network error:', error);
      }
    },
    []
  );

  const logEvent = useCallback(
    async (eventType: EventType, params?: LogParams) => {
      // 실험 종료 후에는 추가 행동 로그 저장 중단
      // 단, session_end 자체는 endSession에서 직접 저장하므로 여기서는 막아도 됨
      if (ended.current) {
        console.log(
          '[useEventLogger] Event ignored because experiment already ended:',
          eventType
        );
        return;
      }

      if (!participantId.current || !sessionId.current) {
        console.warn(
          '[useEventLogger] Event ignored because session is not initialized:',
          eventType
        );
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
    async (externalId?: string): Promise<SessionResult> => {
      console.log('[useEventLogger] initSession called');

      if (initialized.current) {
        console.log('[useEventLogger] Session already initialized:', {
          participantId: participantId.current,
          sessionId: sessionId.current,
        });

        return {
          participantId: participantId.current,
          sessionId: sessionId.current,
        };
      }

      initialized.current = true;
      ended.current = false;

      const now = Date.now();
      const newParticipantId = externalId || `anon_${now}`;
      const newSessionId = `session_${now}`;

      participantId.current = newParticipantId;
      sessionId.current = newSessionId;
      sequenceIndex.current = 0;

      const baseMetadata = createBaseMetadata();

      const sessionDoc = {
        participant_id: newParticipantId,
        session_id: newSessionId,
        metadata: baseMetadata,
      };

      const sessionUrl = `${API_BASE_URL}/sessions`;

      console.log('[useEventLogger] Creating session:', sessionUrl, sessionDoc);

      try {
        const response = await fetch(sessionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sessionDoc),
        });

        console.log('[useEventLogger] Session response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            '[useEventLogger] Session creation error:',
            response.status,
            errorText
          );
        }
      } catch (error) {
        console.error('[useEventLogger] Session creation network error:', error);
      }

      // session_start는 logEvent를 거치지 않고 직접 저장
      const sessionStartEvent = {
        participant_id: newParticipantId,
        session_id: newSessionId,
        video_id: null,
        sequence_index: sequenceIndex.current++,
        event_type: 'session_start',
        playback_position_sec: null,
        watch_duration_sec: null,
        metadata: baseMetadata,
      };

      await sendEventToServer(sessionStartEvent);

      return {
        participantId: newParticipantId,
        sessionId: newSessionId,
      };
    },
    [sendEventToServer]
  );

  const endSession = useCallback(
    async (reason = 'user_clicked_end_button') => {
      if (!participantId.current || !sessionId.current) {
        console.warn('[useEventLogger] endSession ignored: no active session');
        return;
      }

      if (ended.current) {
        console.log('[useEventLogger] endSession ignored: already ended');
        return;
      }

      // 여기서 먼저 true로 바꿔서 이후 발생하는 skip, pause, impression 로그를 차단
      ended.current = true;

      const sessionEndEvent = {
        participant_id: participantId.current,
        session_id: sessionId.current,
        video_id: null,
        sequence_index: sequenceIndex.current++,
        event_type: 'session_end',
        playback_position_sec: null,
        watch_duration_sec: null,
        metadata: {
          ended_at_client: new Date().toISOString(),
          reason,
          page_url: window.location.href,
        },
      };

      await sendEventToServer(sessionEndEvent);
    },
    [sendEventToServer]
  );

  return {
    initSession,
    logEvent,
    endSession,
    participantId,
    sessionId,
    ended,
  };
}
