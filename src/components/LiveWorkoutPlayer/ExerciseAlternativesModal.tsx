import React from 'react';
import { Exercise, GymLocation } from '../../types';
import { EXERCISES_DATABASE } from '../../data/exercises';
import { AnatomyDiagram } from '../ExerciseLibrary/AnatomyDiagram';
import { ArrowRight, X, AlertCircle } from 'lucide-react';

interface ExerciseAlternativesModalProps {
  currentExercise: Exercise;
  currentGym: GymLocation;
  isOpen: boolean;
  onClose: () => void;
  onSelectAlternative: (newExercise: Exercise) => void;
}

export const ExerciseAlternativesModal: React.FC<ExerciseAlternativesModalProps> = ({
  currentExercise,
  currentGym,
  isOpen,
  onClose,
  onSelectAlternative
}) => {
  if (!isOpen) return null;

  // Find all possible alternatives from database that target similar muscles
  const directAlternatives = EXERCISES_DATABASE.filter((e) =>
    currentExercise.alternativeExerciseIds.includes(e.id)
  );

  // Also find other exercises with same primary muscles if list is short
  const sameMuscleAlternatives = EXERCISES_DATABASE.filter(
    (e) =>
      e.id !== currentExercise.id &&
      !currentExercise.alternativeExerciseIds.includes(e.id) &&
      e.primaryMuscles.some((m) => currentExercise.primaryMuscles.includes(m))
  );

  const allAlternatives = [...directAlternatives, ...sameMuscleAlternatives];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full sm:max-w-lg bg-zinc-950 border border-zinc-800 rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold block">
              Machine occupée ou inconfort
            </span>
            <h3 className="text-base font-semibold text-zinc-100">
              Remplacer : {currentExercise.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-500 hover:text-zinc-300 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl mb-4 text-xs text-zinc-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-zinc-400 shrink-0" />
          <span>
            Salle actuelle : <strong className="text-zinc-200">{currentGym.name}</strong>. Seuls les exercices compatibles avec votre équipement sont proposés.
          </span>
        </div>

        <div className="space-y-2.5">
          {allAlternatives.map((alt) => {
            const isEquipmentAvailable = alt.requiredEquipment.every((eq) =>
              currentGym.equipment.includes(eq)
            );

            return (
              <div
                key={alt.id}
                className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isEquipmentAvailable
                    ? 'bg-zinc-900/80 border-zinc-800 hover:border-emerald-500/80 text-zinc-100'
                    : 'bg-zinc-950/40 border-zinc-900 text-zinc-600 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <AnatomyDiagram
                    primaryMuscles={alt.primaryMuscles}
                    secondaryMuscles={alt.secondaryMuscles}
                    size="sm"
                    className="p-1 border-0 bg-transparent shrink-0"
                  />
                  <div>
                    <h4 className="text-sm font-medium text-zinc-100">{alt.name}</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Muscles : {alt.primaryMuscles.join(', ')}
                    </p>
                    {!isEquipmentAvailable && (
                      <span className="text-[10px] text-amber-500/90 font-mono mt-1 block">
                        Matériel manquant dans cette salle
                      </span>
                    )}
                  </div>
                </div>

                {isEquipmentAvailable && (
                  <button
                    onClick={() => {
                      onSelectAlternative(alt);
                      onClose();
                    }}
                    className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition shrink-0"
                  >
                    <span>Choisir</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
