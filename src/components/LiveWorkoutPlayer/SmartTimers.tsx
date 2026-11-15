import React, { useState, useEffect } from 'react';
import { sounds } from '../../utils/audio';
import { Play, Pause, RotateCcw, Plus, Minus, Bell, Timer, Flame } from 'lucide-react';

interface SmartTimersProps {
  restSecondsTarget: number;
  isRestActive: boolean;
  onRestComplete: () => void;
  onCancelRest: () => void;
}

export const SmartTimers: React.FC<SmartTimersProps> = ({
  restSecondsTarget,
  isRestActive,
  onRestComplete,
  onCancelRest
}) => {
  // Mode: 'rest' | 'isometric' | 'hiit'
  const [activeTab, setActiveTab] = useState<'rest' | 'isometric' | 'hiit'>('rest');

  // Rest Timer State
  const [restRemaining, setRestRemaining] = useState<number>(restSecondsTarget);

  // Isometric Hold Timer State
  const [isoTargetSeconds, setIsoTargetSeconds] = useState<number>(45);
  const [isoRemaining, setIsoRemaining] = useState<number>(45);
  const [isIsoRunning, setIsIsoRunning] = useState<boolean>(false);

  // HIIT / Circuit State
  const [hiitWorkSeconds, setHiitWorkSeconds] = useState<number>(20);
  const [hiitRestSeconds, setHiitRestSeconds] = useState<number>(10);
  const [hiitRounds, setHiitRounds] = useState<number>(8);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [hiitPhase, setHiitPhase] = useState<'work' | 'rest'>('work');
  const [hiitRemaining, setHiitRemaining] = useState<number>(20);
  const [isHiitRunning, setIsHiitRunning] = useState<boolean>(false);

  // Sync rest target when changed
  useEffect(() => {
    if (isRestActive) {
      setRestRemaining(restSecondsTarget);
      setActiveTab('rest');
    }
  }, [isRestActive, restSecondsTarget]);

  // REST TIMER TICK EFFECT
  useEffect(() => {
    let interval: any = null;
    if (isRestActive && restRemaining > 0) {
      interval = setInterval(() => {
        setRestRemaining((prev) => {
          if (prev <= 4 && prev > 1) {
            sounds.playTick();
          }
          if (prev <= 1) {
            sounds.playRestComplete();
            onRestComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRestActive, restRemaining, onRestComplete]);

  // ISOMETRIC TIMER EFFECT
  useEffect(() => {
    let interval: any = null;
    if (isIsoRunning && isoRemaining > 0) {
      interval = setInterval(() => {
        setIsoRemaining((prev) => {
          if (prev <= 4 && prev > 1) {
            sounds.playTick();
          }
          if (prev <= 1) {
            sounds.playRestComplete();
            setIsIsoRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isIsoRunning, isoRemaining]);

  // HIIT TIMER EFFECT
  useEffect(() => {
    let interval: any = null;
    if (isHiitRunning && currentRound <= hiitRounds) {
      interval = setInterval(() => {
        setHiitRemaining((prev) => {
          if (prev <= 4 && prev > 1) {
            sounds.playTick();
          }
          if (prev <= 1) {
            sounds.playRestComplete();
            // Switch phase or round
            if (hiitPhase === 'work') {
              setHiitPhase('rest');
              return hiitRestSeconds;
            } else {
              if (currentRound >= hiitRounds) {
                setIsHiitRunning(false);
                return 0;
              }
              setCurrentRound((r) => r + 1);
              setHiitPhase('work');
              return hiitWorkSeconds;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isHiitRunning, hiitRemaining, hiitPhase, currentRound, hiitRounds, hiitWorkSeconds, hiitRestSeconds]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const adjustRest = (amount: number) => {
    setRestRemaining((prev) => Math.max(0, prev + amount));
  };

  return (
    <div className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 shadow-xl">
      {/* Sub-tabs for Timers */}
      <div className="flex border-b border-zinc-900 pb-2 mb-3 gap-2">
        <button
          onClick={() => setActiveTab('rest')}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition ${
            activeTab === 'rest'
              ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Timer className="w-3.5 h-3.5" />
          Repos Série
          {isRestActive && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('isometric')}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition ${
            activeTab === 'isometric'
              ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          Maintien / Isométrie
        </button>

        <button
          onClick={() => setActiveTab('hiit')}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition ${
            activeTab === 'hiit'
              ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          HIIT / Circuit
        </button>
      </div>

      {/* TAB 1: REST TIMER */}
      {activeTab === 'rest' && (
        <div className="flex flex-col items-center">
          <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
            {isRestActive ? 'Récupération en cours' : 'Temps de repos cible'}
          </div>

          <div className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-zinc-100 my-1">
            {formatTime(isRestActive ? restRemaining : restSecondsTarget)}
          </div>

          {isRestActive ? (
            <div className="flex items-center gap-2 mt-3 w-full">
              <button
                onClick={() => adjustRest(-15)}
                className="flex-1 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-mono transition"
              >
                -15s
              </button>
              <button
                onClick={() => adjustRest(30)}
                className="flex-1 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-mono transition"
              >
                +30s
              </button>
              <button
                onClick={onCancelRest}
                className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-medium transition"
              >
                Passer
              </button>
            </div>
          ) : (
            <p className="text-xs text-zinc-500 mt-2 text-center">
              Le chrono se déclenche automatiquement dès que vous cochez une série.
            </p>
          )}
        </div>
      )}

      {/* TAB 2: ISOMETRIC HOLD TIMER */}
      {activeTab === 'isometric' && (
        <div className="flex flex-col items-center">
          <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
            Chrono de Maintien (Planche, Chaise...)
          </div>

          <div className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-zinc-100 my-1">
            {formatTime(isoRemaining)}
          </div>

          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={() => {
                if (isIsoRunning) {
                  setIsIsoRunning(false);
                } else {
                  if (isoRemaining <= 0) setIsoRemaining(isoTargetSeconds);
                  setIsIsoRunning(true);
                }
              }}
              className={`px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                isIsoRunning
                  ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950'
              }`}
            >
              {isIsoRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isIsoRunning ? 'Pause' : 'Démarrer'}
            </button>

            <button
              onClick={() => {
                setIsIsoRunning(false);
                setIsoRemaining(isoTargetSeconds);
              }}
              className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-zinc-200 transition"
              aria-label="Réinitialiser"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Quick Presets */}
            <div className="flex gap-1 ml-2">
              {[30, 45, 60, 90].map((sec) => (
                <button
                  key={sec}
                  onClick={() => {
                    setIsIsoRunning(false);
                    setIsoTargetSeconds(sec);
                    setIsoRemaining(sec);
                  }}
                  className={`text-[10px] font-mono px-2 py-1.5 rounded-lg border transition ${
                    isoTargetSeconds === sec
                      ? 'bg-zinc-800 border-emerald-500 text-zinc-100'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HIIT / TABATA TIMER */}
      {activeTab === 'hiit' && (
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3 mb-1">
            <span
              className={`text-[11px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                hiitPhase === 'work'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}
            >
              {hiitPhase === 'work' ? 'EFFORT' : 'REPOS'}
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              Tour {currentRound} / {hiitRounds}
            </span>
          </div>

          <div className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-zinc-100 my-1">
            {formatTime(hiitRemaining)}
          </div>

          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={() => {
                if (isHiitRunning) {
                  setIsHiitRunning(false);
                } else {
                  if (hiitRemaining <= 0) {
                    setCurrentRound(1);
                    setHiitPhase('work');
                    setHiitRemaining(hiitWorkSeconds);
                  }
                  setIsHiitRunning(true);
                }
              }}
              className={`px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                isHiitRunning
                  ? 'bg-amber-500 text-zinc-950'
                  : 'bg-emerald-500 text-zinc-950'
              }`}
            >
              {isHiitRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isHiitRunning ? 'Pause' : 'Lancer Circuit'}
            </button>

            <button
              onClick={() => {
                setIsHiitRunning(false);
                setCurrentRound(1);
                setHiitPhase('work');
                setHiitRemaining(hiitWorkSeconds);
              }}
              className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-zinc-200 transition"
              aria-label="Réinitialiser"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
