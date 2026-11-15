import React, { useEffect, useState } from 'react';
import { CompletedWorkoutLog } from '../../types';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/audio';
import { Trophy, Clock, Dumbbell, Flame, CheckCircle, Share2, ArrowRight } from 'lucide-react';

interface WorkoutSummaryModalProps {
  workoutLog: CompletedWorkoutLog;
  isOpen: boolean;
  onClose: () => void;
  onSaveAndExit: (updatedLog: CompletedWorkoutLog) => void;
}

export const WorkoutSummaryModal: React.FC<WorkoutSummaryModalProps> = ({
  workoutLog,
  isOpen,
  onClose,
  onSaveAndExit
}) => {
  const [notes, setNotes] = useState<string>(workoutLog.notes || '');

  useEffect(() => {
    if (isOpen) {
      sounds.playRecordBeaten();
      // Elegant minimal confetti burst
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10b981', '#06b6d4', '#f59e0b']
        });
      } catch {
        // Fallback
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalSets = workoutLog.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);

  const handleFinish = () => {
    onSaveAndExit({
      ...workoutLog,
      notes: notes.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-800/80 mx-auto flex items-center justify-center text-emerald-400 mb-3 shadow-lg shadow-emerald-950/50">
            <Trophy className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-semibold block">
            Séance Terminée
          </span>
          <h2 className="text-xl font-bold text-zinc-100 mt-1">
            {workoutLog.sessionTitle}
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Lieu : {workoutLog.gymName} • {new Date(workoutLog.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })}
          </p>
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl text-center">
            <Clock className="w-4 h-4 text-zinc-400 mx-auto mb-1" />
            <span className="text-[10px] text-zinc-500 uppercase font-mono block">Durée</span>
            <span className="text-base font-bold font-mono text-zinc-100">
              {workoutLog.durationMinutes} min
            </span>
          </div>

          <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl text-center">
            <Dumbbell className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <span className="text-[10px] text-zinc-500 uppercase font-mono block">Volume</span>
            <span className="text-base font-bold font-mono text-emerald-400">
              {workoutLog.totalVolumeKg > 1000
                ? `${(workoutLog.totalVolumeKg / 1000).toFixed(1)}t`
                : `${workoutLog.totalVolumeKg}kg`}
            </span>
          </div>

          <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl text-center">
            <CheckCircle className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
            <span className="text-[10px] text-zinc-500 uppercase font-mono block">Séries</span>
            <span className="text-base font-bold font-mono text-cyan-400">
              {totalSets} séries
            </span>
          </div>
        </div>

        {/* Personal Records Banner if any */}
        {workoutLog.personalRecordsBeatenCount > 0 && (
          <div className="p-3.5 bg-amber-950/40 border border-amber-800/60 rounded-xl flex items-center gap-3 mb-5">
            <Flame className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="text-xs font-semibold text-amber-300 block">
                {workoutLog.personalRecordsBeatenCount} Record{workoutLog.personalRecordsBeatenCount > 1 ? 's' : ''} Personnel{workoutLog.personalRecordsBeatenCount > 1 ? 's' : ''} Battu{workoutLog.personalRecordsBeatenCount > 1 ? 's' : ''} !
              </span>
              <span className="text-[11px] text-amber-400/80">
                Progression enregistrée sur votre profil de force.
              </span>
            </div>
          </div>
        )}

        {/* Exercises Done Breakdown */}
        <div className="mb-5 max-h-36 overflow-y-auto pr-1 space-y-1.5">
          {workoutLog.exercises.map((ex, i) => (
            <div
              key={i}
              className="px-3 py-2 bg-zinc-900/40 border border-zinc-800/50 rounded-lg flex items-center justify-between text-xs"
            >
              <span className="text-zinc-200 font-medium truncate mr-2">
                {ex.exerciseName}
              </span>
              <span className="text-zinc-500 font-mono shrink-0">
                {ex.sets.length} séries validées
              </span>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="mb-5">
          <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
            Ressenti & Notes personnelles
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Énergie du jour, congestion, charges faciles..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 resize-none"
          />
        </div>

        {/* Action Button */}
        <button
          onClick={handleFinish}
          className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2"
        >
          <span>Enregistrer et Clôturer la Séance</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
