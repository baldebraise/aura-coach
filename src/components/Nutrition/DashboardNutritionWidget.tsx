import React, { useState } from 'react';
import { UserProfile, DailyHabits, PlannedWorkoutSession } from '../../types';
import { calculateNutritionTargets, generateNutritionSummaryAdvice } from '../../services/nutrition';
import { sounds } from '../../utils/audio';
import { 
  Utensils, 
  Bot, 
  Sparkles, 
  Flame, 
  Droplet, 
  Moon, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  Clock,
  Plus
} from 'lucide-react';

interface DashboardNutritionWidgetProps {
  profile: UserProfile;
  dailyHabits: DailyHabits;
  onUpdateHabits: (updated: DailyHabits) => void;
  isWorkoutDay: boolean;
  todaySession?: PlannedWorkoutSession;
  onOpenDetailedNutrition: () => void;
}

export const DashboardNutritionWidget: React.FC<DashboardNutritionWidgetProps> = ({
  profile,
  dailyHabits,
  onUpdateHabits,
  isWorkoutDay,
  todaySession,
  onOpenDetailedNutrition
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const targets = calculateNutritionTargets(profile, isWorkoutDay);
  const advice = generateNutritionSummaryAdvice(profile, isWorkoutDay, todaySession?.title);

  const currentMeals = dailyHabits.mealsCompleted || {
    breakfast: false,
    lunch: false,
    snackOrPeri: false,
    dinner: false
  };

  const handleToggleMeal = (mealKey: 'breakfast' | 'lunch' | 'snackOrPeri' | 'dinner') => {
    const updatedMeals = {
      ...currentMeals,
      [mealKey]: !currentMeals[mealKey]
    };
    onUpdateHabits({
      ...dailyHabits,
      mealsCompleted: updatedMeals
    });
    sounds.playTick();
  };

  const handleAddProtein = (grams: number) => {
    const current = dailyHabits.proteinGramsConsumed || 0;
    const newTotal = current + grams;
    onUpdateHabits({
      ...dailyHabits,
      proteinGramsConsumed: newTotal,
      proteinAdequate: newTotal >= targets.proteinGrams * 0.8
    });
    sounds.playRecordBeaten();
  };

  const proteinProgressPercent = Math.min(
    100,
    Math.round(((dailyHabits.proteinGramsConsumed || 0) / targets.proteinGrams) * 100)
  );

  const waterProgressPercent = Math.min(
    100,
    Math.round(((dailyHabits.waterLiters || 0) / (targets.waterLiters || 2.5)) * 100)
  );

  return (
    <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden transition">
      {/* Header bar (Collapsible trigger) */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-800/30 transition select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 shrink-0">
            <Utensils className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-zinc-100">Nutrition & Énergie Athlétique</h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                isWorkoutDay
                  ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-400'
                  : 'bg-indigo-950/60 border-indigo-800/80 text-indigo-400'
              }`}>
                {isWorkoutDay ? "Jour d'Entraînement" : 'Repos & Récupération'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Cible : <span className="font-mono text-zinc-200 font-bold">{targets.calories} kcal</span> • <span className="font-mono text-zinc-200 font-bold">{targets.proteinGrams}g protéines</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200"
            aria-label={isExpanded ? 'Replier la section' : 'Déplier la section'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Body */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3.5 border-t border-zinc-800/60 pt-3 animate-in fade-in duration-200">
          {/* ASSISTANT RECAP BANNER (Ce que le coach conseille aujourd'hui) */}
          <div className="p-3.5 bg-gradient-to-br from-emerald-950/40 via-zinc-900/90 to-zinc-950 border border-emerald-800/60 rounded-xl relative overflow-hidden">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-700/80 text-emerald-400 shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-400">
                    Assistant Nutrition AURA
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500">• Analyse du jour</span>
                </div>
                <p className="text-xs text-zinc-200 leading-relaxed font-medium">
                  {advice.advice}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-zinc-400 pt-0.5">
                  <Clock className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>{advice.periFocus}</span>
                </div>
              </div>
            </div>
          </div>

          {/* QUICK MACROS BAR (4 Metrics) */}
          <div className="grid grid-cols-4 gap-2">
            <div className="p-2.5 bg-zinc-950/80 border border-zinc-800/80 rounded-xl text-center">
              <span className="text-[9px] font-mono uppercase text-zinc-500 block">Calories</span>
              <span className="text-xs font-bold font-mono text-zinc-100">{targets.calories}</span>
              <span className="text-[9px] text-zinc-500 block">kcal</span>
            </div>
            <div className="p-2.5 bg-emerald-950/30 border border-emerald-800/60 rounded-xl text-center">
              <span className="text-[9px] font-mono uppercase text-emerald-400 font-bold block">Protéines</span>
              <span className="text-xs font-bold font-mono text-emerald-300">{targets.proteinGrams}g</span>
              <span className="text-[9px] text-zinc-500 block">{targets.proteinGrams * 4} kcal</span>
            </div>
            <div className="p-2.5 bg-zinc-950/80 border border-zinc-800/80 rounded-xl text-center">
              <span className="text-[9px] font-mono uppercase text-zinc-400 block">Glucides</span>
              <span className="text-xs font-bold font-mono text-cyan-300">{targets.carbsGrams}g</span>
              <span className="text-[9px] text-zinc-500 block">{targets.carbsGrams * 4} kcal</span>
            </div>
            <div className="p-2.5 bg-zinc-950/80 border border-zinc-800/80 rounded-xl text-center">
              <span className="text-[9px] font-mono uppercase text-zinc-400 block">Lipides</span>
              <span className="text-xs font-bold font-mono text-amber-300">{targets.fatGrams}g</span>
              <span className="text-[9px] text-zinc-500 block">{targets.fatGrams * 9} kcal</span>
            </div>
          </div>

          {/* HABITS & INTAKE TRACKER (Water, Protein, Meals) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Water Tracker */}
            <div className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-cyan-400" />
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-mono block">Eau</span>
                    <span className="text-xs font-mono font-bold text-zinc-200">
                      {dailyHabits.waterLiters || 0}L / {targets.waterLiters}L
                    </span>
                  </div>
                </div>
                <button
                  onClick={() =>
                    onUpdateHabits({
                      ...dailyHabits,
                      waterLiters: Math.min(5, Math.round(((dailyHabits.waterLiters || 0) + 0.5) * 10) / 10)
                    })
                  }
                  className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-cyan-400 rounded-lg text-xs font-mono font-semibold transition border border-zinc-800"
                >
                  +0.5L
                </button>
              </div>
              <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${waterProgressPercent}%` }}
                />
              </div>
            </div>

            {/* Protein Progress Tracker */}
            <div className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">Protéines consommées</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {dailyHabits.proteinGramsConsumed || 0}g / {targets.proteinGrams}g
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {[20, 30].map((g) => (
                    <button
                      key={g}
                      onClick={() => handleAddProtein(g)}
                      className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 text-emerald-400 rounded-lg text-[10px] font-mono border border-zinc-800 transition"
                    >
                      +{g}g
                    </button>
                  ))}
                </div>
              </div>
              <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${proteinProgressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* MEALS CHECKLIST (4 Prises Quotidiennes) */}
          <div className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">
                Structure des Repas du Jour
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                {Object.values(currentMeals).filter(Boolean).length} / 4 complétés
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { key: 'breakfast', label: 'Petit-déjeuner' },
                { key: 'lunch', label: 'Déjeuner' },
                { key: 'snackOrPeri', label: 'Collation / Péri' },
                { key: 'dinner', label: 'Dîner' }
              ].map((meal) => {
                const isDone = currentMeals[meal.key as keyof typeof currentMeals];
                return (
                  <button
                    key={meal.key}
                    type="button"
                    onClick={() => handleToggleMeal(meal.key as any)}
                    className={`py-2 px-2.5 rounded-lg border text-left flex items-center justify-between transition ${
                      isDone
                        ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                        : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span className="text-[11px] font-medium truncate">{meal.label}</span>
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-zinc-700 shrink-0 ml-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* BUTTON TO OPEN DETAILED MODAL */}
          <button
            onClick={onOpenDetailedNutrition}
            className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs font-semibold rounded-xl transition border border-zinc-800 flex items-center justify-center gap-2 group"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition" />
            <span>Ouvrir l'Espace Nutrition Détaillé & Assistant IA</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition" />
          </button>
        </div>
      )}
    </div>
  );
};
