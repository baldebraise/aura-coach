import React, { useState, useEffect } from 'react';
import { PlannedWorkoutSession, GymLocation, Exercise, WorkoutSetLog, ExerciseSessionLog, CompletedWorkoutLog } from '../../types';
import { EXERCISES_DATABASE } from '../../data/exercises';
import { YouTubeMusicWidget } from './YouTubeMusicWidget';
import { SmartTimers } from './SmartTimers';
import { ExerciseAlternativesModal } from './ExerciseAlternativesModal';
import { WarmupCalculatorModal } from './WarmupCalculatorModal';
import { WorkoutSummaryModal } from './WorkoutSummaryModal';
import { AnatomyDiagram } from '../ExerciseLibrary/AnatomyDiagram';
import { sounds } from '../../utils/audio';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  HelpCircle, 
  RefreshCw, 
  Calculator, 
  Clock, 
  Flame, 
  Plus, 
  Minus,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface LiveWorkoutModalProps {
  session: PlannedWorkoutSession;
  gym: GymLocation;
  isOpen: boolean;
  onClose: () => void;
  onFinishWorkout: (log: CompletedWorkoutLog) => void;
}

export const LiveWorkoutModal: React.FC<LiveWorkoutModalProps> = ({
  session,
  gym,
  isOpen,
  onClose,
  onFinishWorkout
}) => {
  if (!isOpen) return null;

  // Current Exercise Index
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);

  // Active Exercises list (allows in-session substitutions)
  const [exercisesList, setExercisesList] = useState(session.exercises);

  // Workout Elapsed Time
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Sets logging state per exercise: Record<exerciseId, WorkoutSetLog[]>
  const [loggedSets, setLoggedSets] = useState<Record<string, WorkoutSetLog[]>>(() => {
    const initial: Record<string, WorkoutSetLog[]> = {};
    session.exercises.forEach((ex) => {
      initial[ex.exerciseId] = Array.from({ length: ex.targetSets }, (_, i) => ({
        setNumber: i + 1,
        repsCompleted: parseInt(ex.targetReps) || 10,
        weightKg: ex.targetWeightKg || 0,
        rpe: ex.targetRpe || 8,
        isCompleted: false
      }));
    });
    return initial;
  });

  // Rest Timer State
  const [isRestActive, setIsRestActive] = useState<boolean>(false);
  const [restSeconds, setRestSeconds] = useState<number>(90);

  // Modals inside Live player
  const [isAlternativesOpen, setIsAlternativesOpen] = useState<boolean>(false);
  const [isWarmupOpen, setIsWarmupOpen] = useState<boolean>(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState<boolean>(false);
  const [showTechniqueSheet, setShowTechniqueSheet] = useState<boolean>(false);
  const [completedWorkoutLog, setCompletedWorkoutLog] = useState<CompletedWorkoutLog | null>(null);

  // Elapsed time counter
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentPlanned = exercisesList[currentExerciseIndex];
  const currentExerciseDef = EXERCISES_DATABASE.find((e) => e.id === currentPlanned?.exerciseId) || {
    id: currentPlanned?.exerciseId || 'custom',
    name: 'Exercice',
    category: 'strength',
    primaryMuscles: session.focusMuscles,
    secondaryMuscles: [],
    requiredEquipment: [],
    alternativeExerciseIds: [],
    setupCues: [],
    executionCues: [],
    breathingCues: '',
    commonMistakes: [],
    svgDiagramId: 'chest',
    defaultRestSeconds: 90
  } as Exercise;

  const currentSets = loggedSets[currentPlanned?.exerciseId] || [];

  const formatElapsed = (sec: number): string => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle set completion
  const handleToggleSet = (index: number) => {
    const updated = [...currentSets];
    const target = updated[index];
    if (!target) return;

    const newCompleted = !target.isCompleted;
    target.isCompleted = newCompleted;

    setLoggedSets((prev) => ({
      ...prev,
      [currentPlanned.exerciseId]: updated
    }));

    if (newCompleted) {
      sounds.playTick();
      // Start rest timer
      setRestSeconds(currentPlanned.restSeconds || currentExerciseDef.defaultRestSeconds || 90);
      setIsRestActive(true);
    } else {
      setIsRestActive(false);
    }
  };

  // Modify weight or reps
  const handleUpdateSet = (index: number, field: 'weightKg' | 'repsCompleted', delta: number) => {
    const updated = [...currentSets];
    const target = updated[index];
    if (!target) return;

    if (field === 'weightKg') {
      target.weightKg = Math.max(0, target.weightKg + delta);
    } else if (field === 'repsCompleted') {
      target.repsCompleted = Math.max(1, target.repsCompleted + delta);
    }

    setLoggedSets((prev) => ({
      ...prev,
      [currentPlanned.exerciseId]: updated
    }));
  };

  // Replace exercise via Alternatives
  const handleSubstituteExercise = (newEx: Exercise) => {
    const updatedExercises = [...exercisesList];
    updatedExercises[currentExerciseIndex] = {
      ...updatedExercises[currentExerciseIndex],
      exerciseId: newEx.id,
      notes: `Remplacé par ${newEx.name}`
    };
    setExercisesList(updatedExercises);

    // Initialize set logs for new exercise
    setLoggedSets((prev) => ({
      ...prev,
      [newEx.id]: Array.from({ length: currentPlanned.targetSets }, (_, i) => ({
        setNumber: i + 1,
        repsCompleted: parseInt(currentPlanned.targetReps) || 10,
        weightKg: 0,
        rpe: 8,
        isCompleted: false
      }))
    }));
  };

  // Check if all exercises are done or user wants to finish
  const handleFinishRequest = () => {
    // Calculate total volume
    let totalVolume = 0;
    let recordsCount = 0;
    const sessionLogs: ExerciseSessionLog[] = [];

    exercisesList.forEach((planned) => {
      const sets = (loggedSets[planned.exerciseId] || []).filter((s) => s.isCompleted);
      const exDef = EXERCISES_DATABASE.find((e) => e.id === planned.exerciseId);
      
      sets.forEach((s) => {
        totalVolume += s.repsCompleted * s.weightKg;
      });

      if (sets.length > 0) {
        // Mock PR check (e.g. if weight > 70kg or 15 reps)
        const isPr = sets.some((s) => s.weightKg >= 70 || s.repsCompleted >= 15);
        if (isPr) recordsCount++;

        sessionLogs.push({
          exerciseId: planned.exerciseId,
          exerciseName: exDef?.name || 'Exercice',
          sets,
          personalRecordBeaten: isPr
        });
      }
    });

    const summaryLog: CompletedWorkoutLog = {
      id: 'log-' + Date.now(),
      date: new Date().toISOString(),
      gymId: gym.id,
      gymName: gym.name,
      sessionTitle: session.title,
      durationMinutes: Math.max(1, Math.round(elapsedSeconds / 60)),
      totalVolumeKg: totalVolume,
      exercises: sessionLogs,
      personalRecordsBeatenCount: recordsCount
    };

    setCompletedWorkoutLog(summaryLog);
    setIsSummaryOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col overflow-hidden text-zinc-100 select-none animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <header className="px-4 py-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (window.confirm('Voulez-vous quitter la séance en cours ?')) {
                onClose();
              }
            }}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition"
            aria-label="Quitter"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                {gym.name}
              </span>
              <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatElapsed(elapsedSeconds)}
              </span>
            </div>
            <h1 className="text-sm font-semibold text-zinc-100 truncate max-w-[200px] sm:max-w-xs mt-0.5">
              {session.title}
            </h1>
          </div>
        </div>

        <button
          onClick={handleFinishRequest}
          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold rounded-lg transition"
        >
          Terminer
        </button>
      </header>

      {/* Main Scrollable Workout Screen */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-lg mx-auto w-full">
        {/* Waze-style YouTube Music Mini-Player */}
        <YouTubeMusicWidget />

        {/* Exercise Stepper Navigation */}
        <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
          <button
            disabled={currentExerciseIndex === 0}
            onClick={() => setCurrentExerciseIndex((i) => i - 1)}
            className="p-1.5 rounded-lg hover:bg-zinc-900 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="tracking-wider">
            EXERCICE {currentExerciseIndex + 1} SUR {exercisesList.length}
          </span>

          <button
            disabled={currentExerciseIndex === exercisesList.length - 1}
            onClick={() => setCurrentExerciseIndex((i) => i + 1)}
            className="p-1.5 rounded-lg hover:bg-zinc-900 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${((currentExerciseIndex + 1) / exercisesList.length) * 100}%` }}
          />
        </div>

        {/* Current Exercise Card */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">
                Cible : {currentExerciseDef.primaryMuscles.join(', ')}
              </span>
              <h2 className="text-lg font-bold text-zinc-100">
                {currentExerciseDef.name}
              </h2>
              {currentPlanned.notes && (
                <p className="text-xs text-amber-400/90 font-medium mt-0.5">
                  {currentPlanned.notes}
                </p>
              )}
            </div>

            <button
              onClick={() => setShowTechniqueSheet(!showTechniqueSheet)}
              className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition shrink-0"
              title="Fiche technique & Anatomie"
            >
              <HelpCircle className="w-5 h-5 text-emerald-400" />
            </button>
          </div>

          {/* Quick Helper Actions */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setIsAlternativesOpen(true)}
              className="flex-1 py-2 px-2.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-xl text-xs text-zinc-300 flex items-center justify-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Alternative / Pris</span>
            </button>

            <button
              onClick={() => setIsWarmupOpen(true)}
              className="flex-1 py-2 px-2.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-xl text-xs text-zinc-300 flex items-center justify-center gap-1.5 transition"
            >
              <Calculator className="w-3.5 h-3.5 text-cyan-400" />
              <span>Montée en charge</span>
            </button>
          </div>

          {/* Collapsible Technique Sheet with Vector Anatomy */}
          {showTechniqueSheet && (
            <div className="mb-4 p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs animate-in slide-in-from-top-2 duration-200">
              <div className="mb-3">
                <AnatomyDiagram
                  primaryMuscles={currentExerciseDef.primaryMuscles}
                  secondaryMuscles={currentExerciseDef.secondaryMuscles}
                  size="md"
                  className="mx-auto"
                />
              </div>

              <div className="space-y-2 text-zinc-300">
                <div>
                  <strong className="text-zinc-100 block mb-0.5">Positionnement :</strong>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-zinc-400">
                    {currentExerciseDef.setupCues.map((cue, idx) => (
                      <li key={idx}>{cue}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <strong className="text-zinc-100 block mb-0.5">Exécution :</strong>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-zinc-400">
                    {currentExerciseDef.executionCues.map((cue, idx) => (
                      <li key={idx}>{cue}</li>
                    ))}
                  </ul>
                </div>

                {currentExerciseDef.breathingCues && (
                  <div>
                    <strong className="text-emerald-400 block mb-0.5">Respiration :</strong>
                    <p className="text-[11px] text-zinc-400">{currentExerciseDef.breathingCues}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sets Table */}
          <div className="space-y-2">
            <div className="grid grid-cols-12 text-[10px] font-mono uppercase text-zinc-500 px-2">
              <span className="col-span-2">Série</span>
              <span className="col-span-4 text-center">Charge (kg)</span>
              <span className="col-span-4 text-center">Reps</span>
              <span className="col-span-2 text-right">Valider</span>
            </div>

            {currentSets.map((set, idx) => {
              return (
                <div
                  key={idx}
                  className={`grid grid-cols-12 items-center p-2.5 rounded-xl border transition ${
                    set.isCompleted
                      ? 'bg-emerald-950/20 border-emerald-900/60'
                      : 'bg-zinc-950/60 border-zinc-800/80'
                  }`}
                >
                  {/* Set Number */}
                  <span className="col-span-2 font-mono font-bold text-sm text-zinc-300">
                    #{set.setNumber}
                  </span>

                  {/* Weight Controls */}
                  <div className="col-span-4 flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => handleUpdateSet(idx, 'weightKg', -2.5)}
                      className="w-6 h-6 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 flex items-center justify-center"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono font-bold text-sm min-w-[32px] text-center text-zinc-100">
                      {set.weightKg}
                    </span>
                    <button
                      onClick={() => handleUpdateSet(idx, 'weightKg', 2.5)}
                      className="w-6 h-6 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 flex items-center justify-center"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Reps Controls */}
                  <div className="col-span-4 flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => handleUpdateSet(idx, 'repsCompleted', -1)}
                      className="w-6 h-6 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 flex items-center justify-center"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono font-bold text-sm min-w-[28px] text-center text-zinc-100">
                      {set.repsCompleted}
                    </span>
                    <button
                      onClick={() => handleUpdateSet(idx, 'repsCompleted', 1)}
                      className="w-6 h-6 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 flex items-center justify-center"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Complete Button */}
                  <div className="col-span-2 flex justify-end">
                    <button
                      onClick={() => handleToggleSet(idx)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                        set.isCompleted
                          ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md shadow-emerald-950'
                          : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700'
                      }`}
                      aria-label="Valider la série"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Smart Timers Engine */}
        <SmartTimers
          restSecondsTarget={restSeconds}
          isRestActive={isRestActive}
          onRestComplete={() => setIsRestActive(false)}
          onCancelRest={() => setIsRestActive(false)}
        />
      </main>

      {/* Alternatives Modal */}
      <ExerciseAlternativesModal
        currentExercise={currentExerciseDef}
        currentGym={gym}
        isOpen={isAlternativesOpen}
        onClose={() => setIsAlternativesOpen(false)}
        onSelectAlternative={handleSubstituteExercise}
      />

      {/* Warmup Calculator Modal */}
      <WarmupCalculatorModal
        exerciseName={currentExerciseDef.name}
        defaultWorkingWeightKg={currentSets[0]?.weightKg || 50}
        isOpen={isWarmupOpen}
        onClose={() => setIsWarmupOpen(false)}
      />

      {/* Summary Modal */}
      {completedWorkoutLog && (
        <WorkoutSummaryModal
          workoutLog={completedWorkoutLog}
          isOpen={isSummaryOpen}
          onClose={() => setIsSummaryOpen(false)}
          onSaveAndExit={(finalLog) => {
            onFinishWorkout(finalLog);
            setIsSummaryOpen(false);
            onClose();
          }}
        />
      )}
    </div>
  );
};
