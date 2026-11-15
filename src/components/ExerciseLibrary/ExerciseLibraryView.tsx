import React, { useState } from 'react';
import { Exercise, MuscleGroup, EquipmentType, UserProfile } from '../../types';
import { EXERCISES_DATABASE } from '../../data/exercises';
import { EQUIPMENT_LABELS } from '../../data/defaultGyms';
import { AnatomyDiagram } from './AnatomyDiagram';
import { 
  Search, 
  Filter, 
  Dumbbell, 
  ShieldCheck, 
  AlertOctagon, 
  Wind, 
  X, 
  Lock, 
  ChevronDown, 
  ChevronUp, 
  ArrowLeft 
} from 'lucide-react';

interface ExerciseLibraryViewProps {
  profile?: UserProfile;
  onBack?: () => void;
  onOpenTest?: (testId: string) => void;
}

export const ExerciseLibraryView: React.FC<ExerciseLibraryViewProps> = ({
  profile,
  onBack,
  onOpenTest
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>(() => {
    try {
      return localStorage.getItem('aura_library_muscle') || 'all';
    } catch {
      return 'all';
    }
  });
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
  const [activeExerciseModal, setActiveExerciseModal] = useState<Exercise | null>(() => {
    try {
      const savedId = localStorage.getItem('aura_library_exercise_id');
      if (savedId) {
        return EXERCISES_DATABASE.find((e) => e.id === savedId) || null;
      }
    } catch {}
    return null;
  });
  const [showLockedAccordion, setShowLockedAccordion] = useState<boolean>(false);

  React.useEffect(() => {
    try {
      localStorage.setItem('aura_library_muscle', selectedMuscle);
    } catch {}
  }, [selectedMuscle]);

  React.useEffect(() => {
    try {
      if (activeExerciseModal) {
        localStorage.setItem('aura_library_exercise_id', activeExerciseModal.id);
      } else {
        localStorage.removeItem('aura_library_exercise_id');
      }
    } catch {}
  }, [activeExerciseModal]);

  const availableEquipment: EquipmentType[] = profile?.gyms?.[0]?.equipment || [
    'bodyweight',
    'dumbbells',
    'barbell',
    'pullup_bar',
    'bench'
  ];

  const completedTestIds = (profile?.baselineTests || [])
    .filter((t) => t.value !== undefined)
    .map((t) => t.id);

  const muscleFilters: { id: string; label: string }[] = [
    { id: 'all', label: 'Tous les muscles' },
    { id: 'chest', label: 'Pectoraux' },
    { id: 'back', label: 'Dos' },
    { id: 'shoulders', label: 'Épaules' },
    { id: 'quadriceps', label: 'Quadriceps' },
    { id: 'hamstrings', label: 'Ischio-jambiers' },
    { id: 'glutes', label: 'Fessiers' },
    { id: 'biceps', label: 'Biceps' },
    { id: 'triceps', label: 'Triceps' },
    { id: 'abs', label: 'Abdominaux' }
  ];

  // Check if an exercise is locked by equipment or required test
  const getExerciseLockReason = (ex: Exercise): { isLocked: boolean; reason?: string; missingTestId?: string } => {
    // 1. Equipment check
    const missingEquip = ex.requiredEquipment.filter((eq) => !availableEquipment.includes(eq));
    if (missingEquip.length > 0) {
      return {
        isLocked: true,
        reason: `Matériel requis : ${missingEquip.map((e) => EQUIPMENT_LABELS[e] || e).join(', ')}`
      };
    }

    // 2. Baseline Test calibration check for intensive exercises
    const isUpperIntensive = ex.primaryMuscles.some((m) => ['chest', 'triceps', 'shoulders', 'back'].includes(m));
    const isLowerIntensive = ex.primaryMuscles.some((m) => ['quadriceps', 'hamstrings', 'glutes'].includes(m));
    const isCoreIntensive = ex.primaryMuscles.includes('abs');

    if (isUpperIntensive && !completedTestIds.includes('test-upper') && ex.requiredEquipment.some((e) => ['barbell', 'cable_machine'].includes(e))) {
      return {
        isLocked: true,
        reason: 'Test Force Haut requis',
        missingTestId: 'test-upper'
      };
    }

    if (isLowerIntensive && !completedTestIds.includes('test-lower') && ex.requiredEquipment.some((e) => ['barbell', 'leg_press'].includes(e))) {
      return {
        isLocked: true,
        reason: 'Test Force Bas requis',
        missingTestId: 'test-lower'
      };
    }

    if (isCoreIntensive && !completedTestIds.includes('test-core') && ex.category === 'strength') {
      return {
        isLocked: true,
        reason: 'Test Gainage requis',
        missingTestId: 'test-core'
      };
    }

    return { isLocked: false };
  };

  const filteredExercises = EXERCISES_DATABASE.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.primaryMuscles.some((m) => m.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMuscle =
      selectedMuscle === 'all' ||
      ex.primaryMuscles.includes(selectedMuscle as MuscleGroup) ||
      ex.secondaryMuscles.includes(selectedMuscle as MuscleGroup);

    const matchesEquipment =
      selectedEquipment === 'all' ||
      ex.requiredEquipment.includes(selectedEquipment as EquipmentType);

    return matchesSearch && matchesMuscle && matchesEquipment;
  });

  const unlockedExercises = filteredExercises.filter((ex) => !getExerciseLockReason(ex).isLocked);
  const lockedExercises = filteredExercises.filter((ex) => getExerciseLockReason(ex).isLocked);

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
              title="Page précédente"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Bibliothèque d'Exercices</h1>
            <p className="text-xs text-zinc-500">
              Biomécanique, schémas vectoriels et critères de déblocage
            </p>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Rechercher un exercice, muscle..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Muscle Filter Horizontal Scroll */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {muscleFilters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setSelectedMuscle(filter.id)}
            className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition border ${
              selectedMuscle === filter.id
                ? 'bg-zinc-800 border-emerald-500 text-zinc-100 font-medium'
                : 'bg-zinc-950 border-zinc-800/80 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Equipment Dropdown Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-zinc-500" />
        <select
          value={selectedEquipment}
          onChange={(e) => setSelectedEquipment(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
        >
          <option value="all">Tous les équipements</option>
          {Object.entries(EQUIPMENT_LABELS).map(([k, label]) => (
            <option key={k} value={k}>
              {label}
            </option>
          ))}
        </select>
        <span className="text-xs text-zinc-500 font-mono ml-auto">
          {unlockedExercises.length} accessible{unlockedExercises.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Unlocked Exercises Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {unlockedExercises.map((exercise) => (
          <div
            key={exercise.id}
            onClick={() => setActiveExerciseModal(exercise)}
            className="p-3.5 bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 rounded-2xl cursor-pointer transition flex items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <AnatomyDiagram
                primaryMuscles={exercise.primaryMuscles}
                secondaryMuscles={exercise.secondaryMuscles}
                size="sm"
                className="shrink-0 p-1 bg-transparent border-0"
              />
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-emerald-400 transition truncate">
                  {exercise.name}
                </h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {exercise.requiredEquipment.map((eq) => (
                    <span
                      key={eq}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400"
                    >
                      {EQUIPMENT_LABELS[eq] || eq}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Collapsible Locked Exercises Section */}
      {lockedExercises.length > 0 && (
        <div className="mt-6 pt-4 border-t border-zinc-800/80">
          <button
            onClick={() => setShowLockedAccordion(!showLockedAccordion)}
            className="w-full flex items-center justify-between p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-xl hover:bg-zinc-900/50 transition text-left"
          >
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-zinc-300">
                Exercices à débloquer ({lockedExercises.length})
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
              <span>{showLockedAccordion ? 'Masquer' : 'Afficher'}</span>
              {showLockedAccordion ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showLockedAccordion && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 animate-in fade-in duration-200">
              {lockedExercises.map((exercise) => {
                const lockInfo = getExerciseLockReason(exercise);

                return (
                  <div
                    key={exercise.id}
                    onClick={() => setActiveExerciseModal(exercise)}
                    className="p-3.5 bg-zinc-950/40 border border-zinc-800/40 opacity-75 hover:opacity-100 rounded-2xl cursor-pointer transition flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <AnatomyDiagram
                        primaryMuscles={exercise.primaryMuscles}
                        secondaryMuscles={exercise.secondaryMuscles}
                        size="sm"
                        className="shrink-0 p-1 bg-transparent border-0 opacity-60"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                          <h3 className="text-sm font-semibold text-zinc-300 truncate">
                            {exercise.name}
                          </h3>
                        </div>
                        <div className="mt-1">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/40 border border-amber-900/50 text-amber-300">
                            {lockInfo.reason}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Detailed Exercise Modal */}
      {activeExerciseModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full sm:max-w-lg bg-zinc-950 border border-zinc-800 rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-400 tracking-wider font-semibold block">
                  Fiche Biomécanique
                </span>
                <h2 className="text-lg font-bold text-zinc-100 mt-0.5">
                  {activeExerciseModal.name}
                </h2>
              </div>
              <button
                onClick={() => setActiveExerciseModal(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex justify-center my-4 bg-zinc-900/50 rounded-xl p-4 border border-zinc-800/80">
              <AnatomyDiagram
                primaryMuscles={activeExerciseModal.primaryMuscles}
                secondaryMuscles={activeExerciseModal.secondaryMuscles}
                size="md"
              />
            </div>

            {/* Lock check inside modal */}
            {(() => {
              const lockInfo = getExerciseLockReason(activeExerciseModal);
              if (lockInfo.isLocked) {
                return (
                  <div className="mb-4 p-3 bg-amber-950/30 border border-amber-800/60 rounded-xl flex items-center justify-between text-xs text-amber-300">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{lockInfo.reason}</span>
                    </div>
                    {lockInfo.missingTestId && onOpenTest && (
                      <button
                        onClick={() => {
                          const testId = lockInfo.missingTestId!;
                          setActiveExerciseModal(null);
                          onOpenTest(testId);
                        }}
                        className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-[10px] font-mono rounded-lg transition"
                      >
                        Tester
                      </button>
                    )}
                  </div>
                );
              }
              return null;
            })()}

            <div className="space-y-3.5 text-xs">
              <div>
                <span className="font-mono text-[10px] uppercase text-zinc-400 font-semibold block mb-1">
                  Mise en place (Setup)
                </span>
                <ul className="space-y-1 list-disc list-inside text-zinc-300">
                  {activeExerciseModal.setupCues.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-mono text-[10px] uppercase text-zinc-400 font-semibold block mb-1">
                  Exécution
                </span>
                <ul className="space-y-1 list-disc list-inside text-zinc-300">
                  {activeExerciseModal.executionCues.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-mono text-[10px] uppercase text-zinc-400 font-semibold block mb-1">
                  Respiration
                </span>
                <p className="text-zinc-300 italic">{activeExerciseModal.breathingCues}</p>
              </div>

              <div>
                <span className="font-mono text-[10px] uppercase text-rose-400 font-semibold block mb-1">
                  Erreurs à éviter
                </span>
                <ul className="space-y-1 list-disc list-inside text-rose-300/80">
                  {activeExerciseModal.commonMistakes.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => setActiveExerciseModal(null)}
              className="w-full mt-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-medium text-xs rounded-xl transition border border-zinc-800"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
