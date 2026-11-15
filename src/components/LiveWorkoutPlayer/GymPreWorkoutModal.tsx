import React, { useState } from 'react';
import { GymLocation, PlannedWorkoutSession, Exercise } from '../../types';
import { EQUIPMENT_LABELS } from '../../data/defaultGyms';
import { EXERCISES_DATABASE } from '../../data/exercises';
import { MapPin, Plus, Check, AlertCircle, Dumbbell } from 'lucide-react';

interface GymPreWorkoutModalProps {
  gyms: GymLocation[];
  session?: PlannedWorkoutSession;
  isOpen: boolean;
  onClose: () => void;
  onConfirmStart: (selectedGym: GymLocation, adaptedSession?: PlannedWorkoutSession) => void;
  onAddNewGym?: (newGym: GymLocation) => void;
}

export const GymPreWorkoutModal: React.FC<GymPreWorkoutModalProps> = ({
  gyms,
  session,
  isOpen,
  onClose,
  onConfirmStart,
  onAddNewGym
}) => {
  const [selectedGymId, setSelectedGymId] = useState<string>(gyms[0]?.id || 'gym-home');
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [newGymName, setNewGymName] = useState<string>('');
  const [newGymEquipment, setNewGymEquipment] = useState<string[]>(['bodyweight', 'dumbbells']);

  if (!isOpen) return null;

  const currentGym = gyms.find((g) => g.id === selectedGymId) || gyms[0];

  // Calculate compatibility & substitutions
  const getSubstitutedSession = (gym: GymLocation): { session?: PlannedWorkoutSession; replacedCount: number } => {
    if (!session) return { session: undefined, replacedCount: 0 };
    let replaced = 0;
    const adaptedExercises = session.exercises.map((planned) => {
      const exerciseDef = EXERCISES_DATABASE.find((e) => e.id === planned.exerciseId);
      if (!exerciseDef) return planned;

      // Check if all required equipment is present in this gym
      const isMissingEquipment = exerciseDef.requiredEquipment.some(
        (eq) => !gym.equipment.includes(eq)
      );

      if (isMissingEquipment && exerciseDef.alternativeExerciseIds.length > 0) {
        // Find suitable alternative
        const alternative = EXERCISES_DATABASE.find((alt) =>
          exerciseDef.alternativeExerciseIds.includes(alt.id) &&
          alt.requiredEquipment.every((eq) => gym.equipment.includes(eq))
        );

        if (alternative) {
          replaced++;
          return {
            ...planned,
            exerciseId: alternative.id,
            notes: `Adapté pour ${gym.name} (remplace ${exerciseDef.name})`
          };
        }
      }
      return planned;
    });

    return {
      session: {
        ...session,
        exercises: adaptedExercises
      },
      replacedCount: replaced
    };
  };

  const { session: adaptedSession, replacedCount } = getSubstitutedSession(currentGym);

  const handleStart = () => {
    onConfirmStart(currentGym, adaptedSession);
  };

  const handleSaveNewGym = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGymName.trim()) return;

    const newGym: GymLocation = {
      id: 'gym-custom-' + Date.now(),
      name: newGymName.trim(),
      equipment: newGymEquipment as any,
      notes: 'Salle personnalisée'
    };

    if (onAddNewGym) {
      onAddNewGym(newGym);
    }
    setSelectedGymId(newGym.id);
    setIsCreatingNew(false);
    setNewGymName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md bg-zinc-950 border border-zinc-800 rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-950/60 border border-emerald-800/80 rounded-lg text-emerald-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">Lieu de la Séance</h3>
              <p className="text-xs text-zinc-500">Où vous entraînez-vous aujourd'hui ?</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 p-1"
          >
            Fermer
          </button>
        </div>

        {/* Gym List */}
        {!isCreatingNew ? (
          <>
            <div className="space-y-2 mb-4">
              {gyms.map((gym) => {
                const isSelected = gym.id === selectedGymId;
                const { replacedCount: gymReplaced } = getSubstitutedSession(gym);

                return (
                  <div
                    key={gym.id}
                    onClick={() => setSelectedGymId(gym.id)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-900 border-emerald-500 text-zinc-100'
                        : 'bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-900/70 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-medium text-sm flex items-center gap-2">
                        {gym.name}
                        {gym.isDefault && (
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded">
                            Défaut
                          </span>
                        )}
                      </span>
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-zinc-700" />
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {gym.equipment.slice(0, 4).map((eq) => (
                        <span
                          key={eq}
                          className="text-[10px] px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800/80 text-zinc-400"
                        >
                          {EQUIPMENT_LABELS[eq] || eq}
                        </span>
                      ))}
                      {gym.equipment.length > 4 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-950 text-zinc-500">
                          +{gym.equipment.length - 4} autres
                        </span>
                      )}
                    </div>

                    {gymReplaced > 0 && (
                      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-400/90 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {gymReplaced} exercice{gymReplaced > 1 ? 's' : ''} adapté{gymReplaced > 1 ? 's' : ''} au matériel disponible
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setIsCreatingNew(true)}
              className="w-full py-2.5 mb-5 flex items-center justify-center gap-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 border border-dashed border-zinc-800 hover:border-zinc-700 rounded-xl transition"
            >
              <Plus className="w-4 h-4" />
              Ajouter une nouvelle salle
            </button>

            {session && adaptedSession && (
              <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80 mb-5 text-xs">
                <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block mb-1">
                  Séance prévue : {session.title}
                </span>
                <p className="text-zinc-300 font-medium">
                  {adaptedSession.exercises.length} exercices prévus • Durée estimée : {session.estimatedDurationMinutes} min
                </p>
                {replacedCount > 0 && (
                  <p className="text-emerald-400 mt-1">
                    Les exercices ont été automatiquement mis à jour pour correspondre aux équipements de votre salle.
                  </p>
                )}
              </div>
            )}

            <button
              onClick={handleStart}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-zinc-950 font-semibold text-sm rounded-xl transition shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2"
            >
              <Dumbbell className="w-4 h-4" />
              {session ? `Lancer la séance (${currentGym.name})` : `Sélectionner (${currentGym.name})`}
            </button>
          </>
        ) : (
          /* Create New Gym Form */
          <form onSubmit={handleSaveNewGym} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Nom de la salle ou du lieu
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Salle FitnessPark, Box Crossfit, Garage..."
                value={newGymName}
                onChange={(e) => setNewGymName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2">
                Équipements présents
              </label>
              <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {Object.entries(EQUIPMENT_LABELS).map(([key, label]) => {
                  const isChecked = newGymEquipment.includes(key);
                  return (
                    <button
                      type="button"
                      key={key}
                      onClick={() => {
                        if (isChecked) {
                          setNewGymEquipment(newGymEquipment.filter((k) => k !== key));
                        } else {
                          setNewGymEquipment([...newGymEquipment, key]);
                        }
                      }}
                      className={`p-2 rounded-lg text-left text-xs transition border flex items-center justify-between ${
                        isChecked
                          ? 'bg-zinc-800 border-emerald-500/80 text-zinc-100'
                          : 'bg-zinc-900/60 border-zinc-800/60 text-zinc-400'
                      }`}
                    >
                      <span className="truncate mr-1">{label}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="flex-1 py-2.5 bg-zinc-900 text-zinc-400 text-xs font-medium rounded-xl hover:bg-zinc-800"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-emerald-500 text-zinc-950 text-xs font-semibold rounded-xl hover:bg-emerald-400"
              >
                Créer la salle
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
