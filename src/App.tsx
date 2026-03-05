import { useEffect, useRef, useState } from 'react';
import NoiseCanvas from './components/NoiseCanvas';
import RessaFace from './components/RessaFace';

type PermissionState = 'unknown' | 'granted' | 'denied';

type Mood = 'sleeping' | 'calm' | 'annoyed' | 'angry';

const HISTORY_SECONDS = 15;
const TARGET_FPS = 60;
const HISTORY_POINTS = HISTORY_SECONDS * TARGET_FPS;
const DEFAULT_SENSITIVITY = 1;
const DEFAULT_QUIET_MAX = 35;
const DEFAULT_MEDIUM_MAX = 65;
const DEFAULT_TEST_MODE = false;
const AUTO_SLEEP_MS = 30_000;

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const mapDbToLevel = (db: number): number => {
  const mapped = ((db + 60) / 60) * 100;
  return clamp(mapped, 0, 100);
};

const getRmsLevel = (samples: Uint8Array): number => {
  let sumSquares = 0;
  for (let i = 0; i < samples.length; i += 1) {
    const sample = (samples[i] - 128) / 128;
    sumSquares += sample * sample;
  }

  const rms = Math.sqrt(sumSquares / samples.length);
  const safeRms = Math.max(rms, 1e-8);
  const db = 20 * Math.log10(safeRms);
  return mapDbToLevel(db);
};

const App = (): JSX.Element => {
  const [permission, setPermission] = useState<PermissionState>('unknown');
  const [monitoring, setMonitoring] = useState(false);
  const [level, setLevel] = useState(0);
  const [displayLevel, setDisplayLevel] = useState(0);
  const [history, setHistory] = useState<number[]>(new Array(HISTORY_POINTS).fill(0));
  const [error, setError] = useState('');
  const [sensitivity, setSensitivity] = useState(DEFAULT_SENSITIVITY);
  const [quietMax, setQuietMax] = useState(DEFAULT_QUIET_MAX);
  const [mediumMax, setMediumMax] = useState(DEFAULT_MEDIUM_MAX);
  const [testMode, setTestMode] = useState(DEFAULT_TEST_MODE);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [displayMood, setDisplayMood] = useState<Mood>('calm');
  const [wakeAnimating, setWakeAnimating] = useState(false);

  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const samplesRef = useRef<Uint8Array | null>(null);
  const testTickRef = useRef(0);
  const displayAnimRef = useRef<number | null>(null);
  const latestLevelRef = useRef(0);
  const autoSleepTimeoutRef = useRef<number | null>(null);

  const sensitivityRef = useRef(sensitivity);
  const testModeRef = useRef(testMode);

  useEffect(() => {
    sensitivityRef.current = sensitivity;
  }, [sensitivity]);

  useEffect(() => {
    testModeRef.current = testMode;
  }, [testMode]);

  useEffect(() => {
    latestLevelRef.current = level;
  }, [level]);

  useEffect(() => {
    const animateDisplayLevel = (): void => {
      setDisplayLevel((prev) => {
        const target = latestLevelRef.current;
        const eased = prev + (target - prev) * 0.2;
        return Math.abs(target - eased) < 0.12 ? target : eased;
      });
      displayAnimRef.current = requestAnimationFrame(animateDisplayLevel);
    };

    displayAnimRef.current = requestAnimationFrame(animateDisplayLevel);

    return () => {
      if (displayAnimRef.current) {
        cancelAnimationFrame(displayAnimRef.current);
        displayAnimRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const hysteresis = 4;
    setDisplayMood((prev) => {
      if (prev === 'calm') {
        if (displayLevel > mediumMax + hysteresis) {
          return 'angry';
        }
        if (displayLevel > quietMax + hysteresis) {
          return 'annoyed';
        }
        return 'calm';
      }

      if (prev === 'annoyed') {
        if (displayLevel > mediumMax + hysteresis) {
          return 'angry';
        }
        if (displayLevel <= quietMax - hysteresis) {
          return 'calm';
        }
        return 'annoyed';
      }

      if (displayLevel <= quietMax - hysteresis) {
        return 'calm';
      }
      if (displayLevel <= mediumMax - hysteresis) {
        return 'annoyed';
      }
      return 'angry';
    });
  }, [displayLevel, quietMax, mediumMax]);

  const stopAudioPipeline = (): void => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    analyserRef.current = null;
    samplesRef.current = null;
  };

  const runFrame = (): void => {
    let rawLevel = 0;

    if (testModeRef.current) {
      testTickRef.current += 0.09;
      const wave = (Math.sin(testTickRef.current) + 1) / 2;
      const noise = Math.random() * 20;
      rawLevel = clamp(wave * 70 + noise, 0, 100);
    } else if (analyserRef.current && samplesRef.current) {
      analyserRef.current.getByteTimeDomainData(samplesRef.current);
      rawLevel = getRmsLevel(samplesRef.current);
    }

    const adjusted = clamp(rawLevel * sensitivityRef.current, 0, 100);
    setLevel(adjusted);
    setHistory((prev) => {
      const next = prev.slice(1);
      next.push(adjusted);
      return next;
    });

    animationFrameRef.current = requestAnimationFrame(runFrame);
  };

  const startMonitoring = async (): Promise<void> => {
    setError('');
    if (monitoring) {
      return;
    }

    try {
      if (!testModeRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const context = new AudioContext();
        const source = context.createMediaStreamSource(stream);
        const analyser = context.createAnalyser();
        analyser.fftSize = 2048;

        source.connect(analyser);
        audioContextRef.current = context;
        analyserRef.current = analyser;
        samplesRef.current = new Uint8Array(analyser.fftSize);
      }

      setPermission('granted');
      setMonitoring(true);
      animationFrameRef.current = requestAnimationFrame(runFrame);
    } catch (err) {
      setPermission('denied');
      setMonitoring(false);
      setError(
        err instanceof Error
          ? err.message
          : 'Microphone access was denied. Please grant permission in system settings.'
      );
      stopAudioPipeline();
    }
  };

  const stopMonitoring = (): void => {
    setMonitoring(false);
    stopAudioPipeline();
  };

  useEffect(() => {
    return () => {
      stopAudioPipeline();
      if (autoSleepTimeoutRef.current) {
        window.clearTimeout(autoSleepTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (monitoring) {
      if (autoSleepTimeoutRef.current) {
        window.clearTimeout(autoSleepTimeoutRef.current);
        autoSleepTimeoutRef.current = null;
      }
      return;
    }

    setLevel(0);
    setDisplayLevel(0);
    latestLevelRef.current = 0;
    setDisplayMood('calm');
    setHistory(new Array(HISTORY_POINTS).fill(0));
  }, [monitoring]);

  useEffect(() => {
    if (monitoring || permission !== 'granted') {
      return;
    }

    autoSleepTimeoutRef.current = window.setTimeout(() => {
      setPermission('unknown');
      setSettingsOpen(false);
      autoSleepTimeoutRef.current = null;
    }, AUTO_SLEEP_MS);

    return () => {
      if (autoSleepTimeoutRef.current) {
        window.clearTimeout(autoSleepTimeoutRef.current);
        autoSleepTimeoutRef.current = null;
      }
    };
  }, [monitoring, permission]);

  const onTestModeToggle = async (enabled: boolean): Promise<void> => {
    setTestMode(enabled);
    if (!monitoring) {
      return;
    }

    stopMonitoring();
    setTimeout(() => {
      void startMonitoring();
    }, 0);
  };

  const onMonitorToggle = async (): Promise<void> => {
    if (monitoring) {
      stopMonitoring();
      return;
    }

    await startMonitoring();
  };

  const onWakeRessa = async (): Promise<void> => {
    if (wakeAnimating) {
      return;
    }

    setWakeAnimating(true);
    await new Promise<void>((resolve) => {
      window.setTimeout(() => resolve(), 420);
    });
    await startMonitoring();
    setWakeAnimating(false);
  };

  const onResetDefaults = (): void => {
    setSensitivity(DEFAULT_SENSITIVITY);
    setQuietMax(DEFAULT_QUIET_MAX);
    setMediumMax(DEFAULT_MEDIUM_MAX);
    void onTestModeToggle(DEFAULT_TEST_MODE);
  };

  const showWakeScreen = permission !== 'granted' && !monitoring;
  const levelTipPosition = level;

  return (
    <div className="app-shell">
      {showWakeScreen ? (
        <section className="wake-screen">
          <div className="wake-card">
            <button
              className={`wake-face-button ${wakeAnimating ? 'waking' : ''}`}
              onClick={() => {
                void onWakeRessa();
              }}
              aria-label="Click Ressa to enable microphone and start monitoring"
              disabled={wakeAnimating}
            >
              <RessaFace mood={wakeAnimating ? 'calm' : 'sleeping'} loud={false} animate />
            </button>
            <p className="wake-title">
              {wakeAnimating ? 'Ressa is waking up...' : 'Ressa is sleeping... click to wake her up'}
            </p>
            <p className="wake-subtitle">
              {wakeAnimating ? 'Starting monitor...' : 'Click Ressa to enable mic and start monitoring.'}
              <span
                className="tooltip-icon inline-tooltip"
                title="Privacy: audio is never saved or sent. Only a live volume number is computed locally."
              >
                i
              </span>
            </p>
            {permission === 'denied' ? (
              <div className="warning-box">
                <p>Microphone access was denied.</p>
                <p>macOS: System Settings &gt; Privacy &amp; Security &gt; Microphone.</p>
                <p>Windows: Settings &gt; Privacy &amp; Security &gt; Microphone.</p>
                <p className="error-text">{error}</p>
              </div>
            ) : null}
          </div>
        </section>
      ) : (
        <>
          <main className="portrait-screen">
            <header className="portrait-header">
              <div className="portrait-title-wrap">
                <h1>Hi, I&apos;m RESSA</h1>
                <p className="wake-tagline">I listen, and I don't judge.</p>
              </div>
              <button
                className="icon-button"
                onClick={() => setSettingsOpen(true)}
                aria-label="Open settings"
                title="Open settings"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19.14 12.94a7.9 7.9 0 0 0 .05-.94 7.9 7.9 0 0 0-.05-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.28 7.28 0 0 0-1.63-.94l-.36-2.54a.49.49 0 0 0-.49-.42h-3.84a.49.49 0 0 0-.49.42l-.36 2.54a7.28 7.28 0 0 0-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.7 8.84a.5.5 0 0 0 .12.64l2.03 1.58a7.9 7.9 0 0 0-.05.94c0 .32.02.63.05.94L2.82 14.5a.5.5 0 0 0-.12.64l1.92 3.32a.5.5 0 0 0 .6.22l2.39-.96c.5.39 1.05.71 1.63.94l.36 2.54c.05.24.25.42.49.42h3.84c.24 0 .44-.18.49-.42l.36-2.54a7.28 7.28 0 0 0 1.63-.94l2.39.96a.5.5 0 0 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z" />
                </svg>
              </button>
            </header>

            <section className="ressa-focus-card">
              <RessaFace mood={displayMood} loud={monitoring && displayMood === 'angry'} animate />
              <button
                className={`monitor-toggle ${monitoring ? 'stop' : 'play'}`}
                onClick={() => {
                  void onMonitorToggle();
                }}
                aria-label={monitoring ? 'Stop monitoring' : 'Start monitoring'}
                title={monitoring ? 'Stop monitoring' : 'Start monitoring'}
              >
                {monitoring ? (
                  <>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8 6v12l10-6z" />
                    </svg>
                    <span>Start</span>
                  </>
                )}
              </button>
              <div
                className="meter-track compact-meter"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={level}
              >
                <div className="meter-fill" style={{ width: `${level}%` }} />
                <span className="meter-tip" style={{ left: `${levelTipPosition}%` }}>
                  {Math.floor(level)}
                </span>
              </div>
            </section>

            <div className="mini-chart-card">
              <NoiseCanvas history={history} currentLevel={level} />
            </div>
          </main>

          {settingsOpen ? (
            <div className="modal-backdrop" onClick={() => setSettingsOpen(false)}>
              <section className="settings-modal" onClick={(event) => event.stopPropagation()}>
                <div className="modal-header">
                  <h2>Settings</h2>
                  <button className="icon-button" onClick={() => setSettingsOpen(false)} aria-label="Close settings">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.41L10.59 13.4 4.3 19.7l-1.41-1.41L9.17 12 2.89 5.71 4.3 4.3l6.29 6.29 6.3-6.29z" />
                    </svg>
                  </button>
                </div>

                <label>
                  Sensitivity: {sensitivity.toFixed(2)}x
                  <input
                    type="range"
                    min={0.5}
                    max={2}
                    step={0.05}
                    value={sensitivity}
                    onChange={(event) => setSensitivity(Number(event.target.value))}
                  />
                </label>

                <label>
                  Quiet max: {quietMax}
                  <input
                    type="range"
                    min={5}
                    max={Math.max(quietMax, mediumMax - 1)}
                    value={quietMax}
                    onChange={(event) => {
                      const next = Number(event.target.value);
                      setQuietMax(clamp(next, 5, mediumMax - 1));
                    }}
                  />
                </label>

                <label>
                  Medium max: {mediumMax}
                  <input
                    type="range"
                    min={quietMax + 1}
                    max={95}
                    value={mediumMax}
                    onChange={(event) => {
                      const next = Number(event.target.value);
                      setMediumMax(clamp(next, quietMax + 1, 95));
                    }}
                  />
                </label>

                <label className="toggle-row">
                  <input
                    type="checkbox"
                    checked={testMode}
                    onChange={(event) => {
                      void onTestModeToggle(event.target.checked);
                    }}
                  />
                  Test mode (simulate noise)
                </label>
                <button className="reset-btn" onClick={onResetDefaults}>
                  Reset to Default
                </button>

              </section>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

export default App;
