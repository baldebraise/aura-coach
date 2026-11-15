import React, { useState } from 'react';
import { Exercise, MuscleGroup, EquipmentType } from '../../types';
import { EXERCISES_DATABASE } from '../../data/exercises';
import { EQUIPMENT_LABELS } from '../../data/defaultGyms';
import { AnatomyDiagram } from './AnatomyDiagram';
import { Search, Filter, Dumbbell, ShieldCheck, AlertOctagon, Wind, X } from 'lucide-react';

export const ExerciseLibraryView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
  const [activeExerciseModal, setActiveExerciseModal] = useState<Exercise | null>(null);

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

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-zinc-100">Bibliothèque d'Exercices</h1>
        <p className="text-xs text-zinc-500">
          Biomécanique, schémas anatomiques vectoriels et consignes d'exécution
        </p>
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
          {filteredExercises.length} exercice{filteredExercises.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Exercises Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredExercises.map((exercise) => (
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
                className="p-1 text-zinc-500 hover:text-zinc-300 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Anatomical Diagram Centered */}
            <div className="mb-4">
              <AnatomyDiagram
                primaryMuscles={activeExerciseModal.primaryMuscles}
                secondaryMuscles={activeExerciseModal.secondaryMuscles}
                size="md"
                className="mx-auto"
              />
              <div className="flex justify-center gap-4 mt-2 text-[10px] font-mono text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Moteur principal
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  Synergiste / Stabilisateur
                </span>
              </div>
            </div>

            {/* Execution Sections */}
            <div className="space-y-3.5 text-xs">
              {/* Setup */}
              <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                <div className="flex items-center gap-1.5 text-zinc-200 font-semibold mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>1. Position de départ & Alignement</span>
                </div>
                <ul className="list-disc pl-4 space-y-1 text-zinc-400">
                  {activeExerciseModal.setupCues.map((cue, idx) => (
                    <li key={idx}>{cue}</li>
                  ))}
                </ul>
              </div>

              {/* Execution */}
              <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                <div className="flex items-center gap-1.5 text-zinc-200 font-semibold mb-1">
                  <Dumbbell className="w-3.5 h-3.5 text-cyan-400" />
                  <span>2. Trajectoire & Mouvement</span>
                </div>
                <ul className="list-disc pl-4 space-y-1 text-zinc-400">
                  {activeExerciseModal.executionCues.map((cue, idx) => (
                    <li key={idx}>{cue}</li>
                  ))}
                </ul>
              </div>

              {/* Breathing */}
              {activeExerciseModal.breathingCues && (
                <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
                    <Wind className="w-3.5 h-3.5" />
                    <span>3. Respiration optimale</span>
                  </div>
                  <p className="text-zinc-400">{activeExerciseModal.breathingCues}</p>
                </div>
              )}

              {/* Mistakes to avoid */}
              {activeExerciseModal.commonMistakes.length > 0 && (
                <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-xl">
                  <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
                    <AlertOctagon className="w-3.5 h-3.5" />
                    <span>Erreurs à proscrire</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-amber-300/80">
                    {activeExerciseModal.commonMistakes.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveExerciseModal(null)}
              className="w-full mt-5 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl transition"
            >
              Fermer la fiche
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
