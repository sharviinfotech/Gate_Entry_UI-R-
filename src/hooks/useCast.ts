import { useCallback, useEffect, useRef, useState } from 'react';

type CastMode = 'chromecast' | 'window' | 'screen' | null;

interface CastSession {
  isConnected: boolean;
  deviceName: string | null;
  mode: CastMode;
}

type OpenCastResult =
  | { ok: true }
  | { ok: false; reason: 'popup_blocked' | 'error' };

// Extend window for Cast SDK types
declare global {
  interface Window {
    __onGCastApiAvailable?: (isAvailable: boolean) => void;
    cast?: {
      framework: {
        CastContext: {
          getInstance: () => CastContext;
        };
        CastContextEventType: {
          SESSION_STATE_CHANGED: string;
        };
        SessionState: {
          SESSION_STARTED: string;
          SESSION_RESUMED: string;
          SESSION_ENDED: string;
        };
      };
    };
    chrome?: {
      cast?: {
        AutoJoinPolicy: { ORIGIN_SCOPED: string };
        DefaultActionPolicy: { CREATE_SESSION: string };
        isAvailable?: boolean;
      };
    };
  }
  
  interface CastContext {
    setOptions: (options: { receiverApplicationId: string; autoJoinPolicy: string }) => void;
    requestSession: () => Promise<void>;
    endCurrentSession: (stopCasting: boolean) => void;
    getCurrentSession: () => CastSession | null;
    addEventListener: (type: string, listener: (event: SessionStateEvent) => void) => void;
    removeEventListener: (type: string, listener: (event: SessionStateEvent) => void) => void;
  }
  
  interface SessionStateEvent {
    sessionState: string;
  }
}

export function useCast() {
  const [castSession, setCastSession] = useState<CastSession>({
    isConnected: false,
    deviceName: null,
    mode: null,
  });
  const [isChromecastAvailable, setIsChromecastAvailable] = useState(false);
  const [isScreenShareAvailable, setIsScreenShareAvailable] = useState(false);

  const castWindowRef = useRef<Window | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const castContextRef = useRef<CastContext | null>(null);

  // Initialize Cast SDK
  useEffect(() => {
    // Check screen share availability
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getDisplayMedia) {
      setIsScreenShareAvailable(true);
    }

    // Setup Cast SDK callback
    window.__onGCastApiAvailable = (isAvailable: boolean) => {
      if (isAvailable && window.cast && window.chrome?.cast) {
        try {
          const context = window.cast.framework.CastContext.getInstance();
          context.setOptions({
            receiverApplicationId: 'CC1AD845', // Default Media Receiver
            autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
          });
          
          castContextRef.current = context;
          setIsChromecastAvailable(true);

          // Listen for session state changes
          context.addEventListener(
            window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
            (event: SessionStateEvent) => {
              const { SessionState } = window.cast!.framework;
              
              if (event.sessionState === SessionState.SESSION_STARTED ||
                  event.sessionState === SessionState.SESSION_RESUMED) {
                setCastSession({
                  isConnected: true,
                  deviceName: 'Chromecast',
                  mode: 'chromecast',
                });
              } else if (event.sessionState === SessionState.SESSION_ENDED) {
                setCastSession(prev => 
                  prev.mode === 'chromecast' 
                    ? { isConnected: false, deviceName: null, mode: null }
                    : prev
                );
              }
            }
          );
        } catch (e) {
          console.error('Failed to initialize Cast SDK:', e);
        }
      }
    };

    // If Cast SDK already loaded
    if (window.chrome?.cast?.isAvailable) {
      window.__onGCastApiAvailable(true);
    }
  }, []);

  const startChromecast = useCallback(async (): Promise<boolean> => {
    if (!castContextRef.current) {
      console.warn('Chromecast not available');
      return false;
    }

    try {
      await castContextRef.current.requestSession();
      return true;
    } catch (e) {
      console.error('Chromecast session request failed:', e);
      return false;
    }
  }, []);

  const openCastWindow = useCallback(async (url: string): Promise<OpenCastResult> => {
    try {
      const width = window.screen.availWidth;
      const height = window.screen.availHeight;

      const castWindow = window.open(
        url,
        'CastWindow',
        `width=${width},height=${height},left=0,top=0,menubar=no,toolbar=no,location=no,status=no`
      );

      if (!castWindow) return { ok: false, reason: 'popup_blocked' };

      castWindowRef.current = castWindow;
      setCastSession({ isConnected: true, deviceName: 'Cast Window', mode: 'window' });

      const checkWindow = window.setInterval(() => {
        if (castWindow.closed) {
          window.clearInterval(checkWindow);
          castWindowRef.current = null;
          setCastSession(prev => 
            prev.mode === 'window' 
              ? { isConnected: false, deviceName: null, mode: null }
              : prev
          );
        }
      }, 800);

      return { ok: true };
    } catch (e) {
      console.error('openCastWindow failed:', e);
      return { ok: false, reason: 'error' };
    }
  }, []);

  const startScreenShare = useCallback(async (): Promise<MediaStream | null> => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      console.warn('getDisplayMedia not supported');
      return null;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 30, max: 60 } },
        audio: false,
      });

      screenStreamRef.current = stream;
      setCastSession({ isConnected: true, deviceName: 'Screen Share', mode: 'screen' });

      stream.getVideoTracks()[0]?.addEventListener('ended', () => {
        screenStreamRef.current = null;
        setCastSession(prev =>
          prev.mode === 'screen'
            ? { isConnected: false, deviceName: null, mode: null }
            : prev
        );
      });

      return stream;
    } catch (e) {
      console.error('startScreenShare failed:', e);
      return null;
    }
  }, []);

  const stopCasting = useCallback(() => {
    // Stop Chromecast
    if (castContextRef.current && castSession.mode === 'chromecast') {
      try {
        castContextRef.current.endCurrentSession(true);
      } catch (e) {
        console.error('Error ending Chromecast session:', e);
      }
    }

    // Close popup window
    if (castWindowRef.current && !castWindowRef.current.closed) {
      castWindowRef.current.close();
    }
    castWindowRef.current = null;

    // Stop screen share
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    screenStreamRef.current = null;

    setCastSession({ isConnected: false, deviceName: null, mode: null });
  }, [castSession.mode]);

  return {
    castSession,
    isChromecastAvailable,
    isScreenShareAvailable,
    startChromecast,
    openCastWindow,
    startScreenShare,
    stopCasting,
  };
}
