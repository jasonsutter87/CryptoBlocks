import { useState, useEffect, useRef, useCallback } from 'react';

// DTMF frequency map: [row freq, col freq]
const DTMF_FREQS: Record<string, [number, number]> = {
  '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
  '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
  '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
  '*': [941, 1209], '0': [941, 1336], '#': [941, 1477],
};

const KEYPAD_LAYOUT = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['*', '0', '#'],
];

const ACCESS_CODE = '2600';

type ConnectionState = 'connecting' | 'dialing' | 'accepted' | 'denied' | 'connected';

function getSessionId(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('s');
}

function playDtmf(audioCtx: AudioContext, digit: string) {
  const freqs = DTMF_FREQS[digit];
  if (!freqs) return;

  const [rowFreq, colFreq] = freqs;
  const duration = 0.15;
  const now = audioCtx.currentTime;

  const gainNode = audioCtx.createGain();
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
  gainNode.gain.setValueAtTime(0.3, now + duration - 0.02);
  gainNode.gain.linearRampToValueAtTime(0, now + duration);
  gainNode.connect(audioCtx.destination);

  [rowFreq, colFreq].forEach((freq) => {
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.connect(gainNode);
    osc.start(now);
    osc.stop(now + duration);
  });
}

function playModemHandshake(audioCtx: AudioContext): Promise<void> {
  return new Promise((resolve) => {
    const duration = 2.0;
    const now = audioCtx.currentTime;

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.4, now);
    gainNode.gain.linearRampToValueAtTime(0.0, now + duration);
    gainNode.connect(audioCtx.destination);

    // Primary sweep oscillator
    const osc1 = audioCtx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(300, now);
    osc1.frequency.exponentialRampToValueAtTime(2400, now + duration);
    osc1.connect(gainNode);
    osc1.start(now);
    osc1.stop(now + duration);

    // Secondary warble for that classic modem noise
    const osc2 = audioCtx.createOscillator();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(1200, now);
    osc2.frequency.setValueAtTime(2100, now + 0.3);
    osc2.frequency.setValueAtTime(1200, now + 0.6);
    osc2.frequency.setValueAtTime(2400, now + 0.9);
    osc2.frequency.setValueAtTime(1800, now + 1.2);
    osc2.frequency.setValueAtTime(2400, now + 1.5);
    osc2.frequency.setValueAtTime(1200, now + 1.8);

    const gainNode2 = audioCtx.createGain();
    gainNode2.gain.setValueAtTime(0.15, now);
    gainNode2.gain.linearRampToValueAtTime(0.0, now + duration);
    osc2.connect(gainNode2);
    gainNode2.connect(audioCtx.destination);

    osc2.start(now);
    osc2.stop(now + duration);

    setTimeout(resolve, duration * 1000 + 100);
  });
}

// CRT scanline overlay as a CSS background
const scanlineStyle: React.CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
  pointerEvents: 'none',
  position: 'fixed',
  inset: 0,
  zIndex: 10,
};

export default function WoprPhone() {
  const [connectionState, setConnectionState] = useState<ConnectionState>('connecting');
  const [digits, setDigits] = useState('');
  const [flickerOn, setFlickerOn] = useState(true);
  const [dotPulse, setDotPulse] = useState(false);
  const [displayFlash, setDisplayFlash] = useState<'none' | 'green' | 'red'>('none');
  const [connectingDots, setConnectingDots] = useState('');
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sessionId = useRef(getSessionId());

  // CRT flicker
  useEffect(() => {
    const interval = setInterval(() => {
      // Rare flicker — ~5% chance per 200ms tick
      if (Math.random() < 0.05) {
        setFlickerOn(false);
        setTimeout(() => setFlickerOn(true), 40 + Math.random() * 60);
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // Connecting dots animation
  useEffect(() => {
    if (connectionState !== 'connecting') return;
    const interval = setInterval(() => {
      setConnectingDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 400);
    return () => clearInterval(interval);
  }, [connectionState]);

  // Green dot pulse when connected
  useEffect(() => {
    if (connectionState !== 'connected') return;
    const interval = setInterval(() => setDotPulse((p) => !p), 800);
    return () => clearInterval(interval);
  }, [connectionState]);

  // Initial connection sequence
  useEffect(() => {
    const sid = sessionId.current;
    const timer = setTimeout(async () => {
      if (sid) {
        try {
          await fetch(`/api/wopr/connect/${sid}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'phreaking' }),
          });
        } catch {
          // Silently continue — the UI experience matters more than the API call
        }
      }
      setConnectionState('dialing');
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const handleKeyPress = useCallback(
    async (digit: string) => {
      if (connectionState !== 'dialing') return;

      const ctx = getAudioCtx();
      playDtmf(ctx, digit);

      // Only accumulate numeric digits for code checking
      if (/[0-9]/.test(digit)) {
        setDigits((prev) => {
          const next = prev + digit;

          if (next.length >= ACCESS_CODE.length) {
            const candidate = (prev + digit).slice(-ACCESS_CODE.length);

            if (candidate === ACCESS_CODE) {
              // Accepted
              setDisplayFlash('green');
              setTimeout(async () => {
                setConnectionState('accepted');
                const modemCtx = getAudioCtx();
                await playModemHandshake(modemCtx);
                try {
                  const sid = sessionId.current;
                  if (sid) {
                    await fetch(`/api/wopr/connect/${sid}`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ status: 'connected' }),
                    });
                  }
                } catch {
                  // Continue regardless
                }
                setConnectionState('connected');
                setDisplayFlash('none');
              }, 300);
              return ACCESS_CODE;
            } else if (next.length >= 4) {
              // Wrong code
              setDisplayFlash('red');
              setTimeout(() => {
                setConnectionState('denied');
                setTimeout(() => {
                  setConnectionState('dialing');
                  setDisplayFlash('none');
                }, 1200);
              }, 200);
              return next.slice(-4);
            }
          }

          return next.slice(-8); // cap display length
        });
      }
    },
    [connectionState, getAudioCtx]
  );

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key;
      if (DTMF_FREQS[key] !== undefined) {
        handleKeyPress(key);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleKeyPress]);

  const amber = '#ffb347';
  const amberDim = '#a0601a';
  const green = '#39ff14';
  const red = '#ff2a2a';

  const displayColor =
    displayFlash === 'green' ? green : displayFlash === 'red' ? red : amber;

  const statusLine = () => {
    switch (connectionState) {
      case 'connecting':
        return `CONNECTING TO WOPR NODE${connectingDots}`;
      case 'dialing':
        return 'DIAL ACCESS CODE';
      case 'accepted':
        return 'ACCESS CODE ACCEPTED';
      case 'denied':
        return 'ACCESS DENIED';
      case 'connected':
        return 'CONNECTED TO WOPR';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Courier New", Courier, monospace',
        opacity: flickerOn ? 1 : 0.85,
        transition: 'opacity 40ms',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Scanlines overlay */}
      <div style={scanlineStyle} />

      {/* Vignette */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.75) 100%)',
          pointerEvents: 'none',
          zIndex: 9,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 20,
          width: '100%',
          maxWidth: 360,
          padding: '0 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
        }}
      >
        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              color: amber,
              fontSize: 28,
              fontWeight: 'bold',
              letterSpacing: '0.25em',
              textShadow: `0 0 8px ${amber}, 0 0 20px ${amberDim}`,
              marginBottom: 4,
            }}
          >
            PHREAKER v2.6
          </div>
          <div
            style={{
              color: amberDim,
              fontSize: 11,
              letterSpacing: '0.15em',
            }}
          >
            BLUE BOX EMULATION SYSTEM
          </div>
        </div>

        {/* Status display */}
        <div
          style={{
            width: '100%',
            background: '#0a0800',
            border: `1px solid ${amberDim}`,
            borderRadius: 4,
            padding: '12px 16px',
            boxShadow: `inset 0 0 10px rgba(0,0,0,0.8), 0 0 6px ${amberDim}`,
          }}
        >
          {/* Digit display */}
          <div
            style={{
              color: displayColor,
              fontSize: 32,
              letterSpacing: '0.4em',
              textAlign: 'right',
              minHeight: 42,
              textShadow: `0 0 10px ${displayColor}`,
              transition: 'color 150ms',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {connectionState === 'dialing' || connectionState === 'denied'
              ? digits || '\u00a0'
              : '\u00a0'}
          </div>

          {/* Separator */}
          <div
            style={{
              borderTop: `1px solid ${amberDim}`,
              marginTop: 8,
              marginBottom: 8,
              opacity: 0.4,
            }}
          />

          {/* Status text */}
          <div
            style={{
              color:
                connectionState === 'accepted' || connectionState === 'connected'
                  ? green
                  : connectionState === 'denied'
                  ? red
                  : amber,
              fontSize: 12,
              letterSpacing: '0.12em',
              textShadow:
                connectionState === 'accepted' || connectionState === 'connected'
                  ? `0 0 8px ${green}`
                  : connectionState === 'denied'
                  ? `0 0 8px ${red}`
                  : `0 0 6px ${amber}`,
              transition: 'color 200ms',
            }}
          >
            {statusLine()}
          </div>

          {/* Connected indicator */}
          {connectionState === 'connected' && (
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: green,
                  boxShadow: `0 0 ${dotPulse ? '12px' : '4px'} ${green}`,
                  transition: 'box-shadow 800ms',
                }}
              />
              <span style={{ color: green, fontSize: 11, letterSpacing: '0.1em' }}>
                NODE ACTIVE
              </span>
            </div>
          )}
        </div>

        {/* Keypad — only show during dialing states */}
        {(connectionState === 'dialing' || connectionState === 'denied') && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
              width: '100%',
            }}
          >
            {KEYPAD_LAYOUT.flat().map((digit) => (
              <button
                key={digit}
                onPointerDown={() => handleKeyPress(digit)}
                style={{
                  background: 'linear-gradient(145deg, #1a1200, #0d0a00)',
                  border: `1px solid ${amberDim}`,
                  borderRadius: 6,
                  color: amber,
                  fontSize: 22,
                  fontFamily: '"Courier New", Courier, monospace',
                  fontWeight: 'bold',
                  padding: '16px 0',
                  cursor: 'pointer',
                  letterSpacing: '0.05em',
                  textShadow: `0 0 6px ${amber}`,
                  boxShadow: `0 0 4px ${amberDim}, inset 0 1px 0 rgba(255,179,71,0.1)`,
                  transition: 'background 80ms, box-shadow 80ms',
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                }}
                onPointerEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    'linear-gradient(145deg, #2a1e00, #1a1200)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    `0 0 10px ${amber}, inset 0 1px 0 rgba(255,179,71,0.2)`;
                }}
                onPointerLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    'linear-gradient(145deg, #1a1200, #0d0a00)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    `0 0 4px ${amberDim}, inset 0 1px 0 rgba(255,179,71,0.1)`;
                }}
              >
                {digit}
              </button>
            ))}
          </div>
        )}

        {/* Connected: return to terminal prompt */}
        {connectionState === 'connected' && (
          <div
            style={{
              textAlign: 'center',
              color: green,
              fontSize: 14,
              letterSpacing: '0.15em',
              textShadow: `0 0 8px ${green}`,
              marginTop: 8,
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>↑</div>
            <div>RETURN TO YOUR TERMINAL</div>
          </div>
        )}

        {/* Connecting animation */}
        {connectionState === 'connecting' && (
          <div style={{ display: 'flex', gap: 8 }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: amber,
                  boxShadow: `0 0 6px ${amber}`,
                  animation: `pulse 1.2s ease-in-out ${i * 0.3}s infinite`,
                }}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            color: '#3a2a00',
            fontSize: 10,
            letterSpacing: '0.1em',
            textAlign: 'center',
          }}
        >
          NORAD BACKDOOR ACCESS TERMINAL
          <br />
          UNAUTHORIZED USE PROHIBITED
        </div>
      </div>

      {/* Keyframe animations injected into head */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.2; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
