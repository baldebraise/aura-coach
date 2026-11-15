import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, PhysicalTestMetric } from '../../types';
import { sounds } from '../../utils/audio';
import { 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  X, 
  ShieldCheck, 
  Award, 
  AlertTriangle,
  Flame,
  ArrowRight
} from 'lucide-react';

export type TestDefinitionId = 'test-upper' | 'test-lower' | 'test-core' | 'test-cardio';

export interface TestDefinition {
  id: TestDefinitionId;
  title: string;
  categoryName: string;
  category: 'upper' | 'lower' | 'core' | 'cardio';
  targetMuscleGroup: string;
  metricType: 'reps' | 'seconds' | 'kmh';
  unit: string;
  cues: string[];
  mistakesToAvoid: string[];
  benchmarks: {
    beginner: string;
    intermediate: string;
    advanced: string;
    elite: string;
  };
  computeLevel: (score: number) => { level: string; color: string; feedback: string };
}

export const TEST_DEFINITIONS: Record<TestDefinitionId, TestDefinition> = {
  'test-upper': {
    id: 'test-upper',
    title: 'Test Force Haut : Pompes Strictes au Poids du Corps',
    categoryName: 'Haut du Corps (Pectoraux, Épaules, Triceps, Dos)',
    category: 'upper',
    targetMuscleGroup: 'Pectoraux, Triceps, Deltoïde antérieur',
    metricType: 'reps',
    unit: 'répétitions',
    cues: [
      'Mains à largeur d épaules, doigts orientés vers l avant.',
      'Corps parfaitement gainé des talons à la nuque.',
      'Poitrine à 2 cm du sol en bas, extension complète des coudes en haut sans cambrer.'
    ],
    mistakesToAvoid: [
      'Relâcher les lombaires (bassin qui s affaisse).',
      'Demi-répétitions sans descendre la poitrine.',
      'Coude qui s écarte à 90 degrés (garder un angle à 45°).'
    ],
    benchmarks: {
      beginner: '< 12 reps',
      intermediate: '12 à 25 reps',
      advanced: '26 à 40 reps',
      elite: '> 40 reps'
    },
    computeLevel: (score) => {
      if (score < 12) return { level: 'Débutant', color: 'text-zinc-400', feedback: 'Fondation à construire. Les séances démarreront avec un volume protecteur et des variantes inclinées.' };
      if (score <= 25) return { level: 'Intermédiaire', color: 'text-emerald-400', feedback: 'Bonne base neuromusculaire. Programmation équilibrée entre force et hypertrophie.' };
      if (score <= 40) return { level: 'Avancé', color: 'text-cyan-400', feedback: 'Excellente force de poussée. Déblocage des charges lourdes et exercices polyarticulaires complexes.' };
      return { level: 'Élite', color: 'text-purple-400', feedback: 'Niveau exceptionnel. Volume intensif et surcharge progressive avancée activés.' };
    }
  },
  'test-lower': {
    id: 'test-lower',
    title: 'Test Force Bas : Chaise Isométrique contre Mur',
    categoryName: 'Bas du Corps (Quadriceps, Fessiers, Ischios)',
    category: 'lower',
    targetMuscleGroup: 'Quadriceps, Fessiers, Mollets',
    metricType: 'seconds',
    unit: 'secondes',
    cues: [
      'Dos complètement plaqué contre un mur vertical.',
      'Genoux fléchis à 90 degrés exacts, cuisses strictement parallèles au sol.',
      'Bras le long du corps ou croisés sur la poitrine, pas d appui sur les genoux.'
    ],
    mistakesToAvoid: [
      'Poser les mains sur les cuisses pour s aider.',
      'Avoir les fesses plus hautes ou plus basses que les genoux.',
      'Décoller le bas du dos du mur.'
    ],
    benchmarks: {
      beginner: '< 30 sec',
      intermediate: '30s à 60s',
      advanced: '61s à 90s',
      elite: '> 90 sec'
    },
    computeLevel: (score) => {
      if (score < 30) return { level: 'Débutant', color: 'text-zinc-400', feedback: 'Endurance de force initiale. Priorité au contrôle des genoux et à la stabilité articulaire.' };
      if (score <= 60) return { level: 'Intermédiaire', color: 'text-emerald-400', feedback: 'Bonne tenue isométrique. Déblocage des squats chargés et fentes complètes.' };
      if (score <= 90) return { level: 'Avancé', color: 'text-cyan-400', feedback: 'Excellente résistance lactique. Les séances intégreront du tempo et des charges d intensité RPE 8-9.' };
      return { level: 'Élite', color: 'text-purple-400', feedback: 'Solidité remarquable. Accès aux protocoles de force max et d explosivité.' };
    }
  },
  'test-core': {
    id: 'test-core',
    title: 'Test Stabilité : Planche Isométrique sur Avant-Bras',
    categoryName: 'Tronc & Gainage (Abdominaux profonds, Transverse, Lombaires)',
    category: 'core',
    targetMuscleGroup: 'Transverse, Grand droit, Érecteurs du rachis',
    metricType: 'seconds',
    unit: 'secondes',
    cues: [
      'Coudes sous les épaules, avant-bras parallèles.',
      'Rétroversion légère du bassin (serrer fessiers et abdos).',
      'Nuque neutre, regard vers le sol, ligne droite parfaite talons-bassin-épaules.'
    ],
    mistakesToAvoid: [
      'Fesses qui montent en toit de maison.',
      'Bassin qui s effondre vers le sol (danger lombaire).',
      'Bloquer sa respiration (respirer profondément).'
    ],
    benchmarks: {
      beginner: '< 35 sec',
      intermediate: '35s à 70s',
      advanced: '71s à 120s',
      elite: '> 120 sec'
    },
    computeLevel: (score) => {
      if (score < 35) return { level: 'Débutant', color: 'text-zinc-400', feedback: 'Renforcement du caisson abdominal prioritaire pour sécuriser les mouvements polyarticulaires.' };
      if (score <= 70) return { level: 'Intermédiaire', color: 'text-emerald-400', feedback: 'Gainage solide. Capacité à stabiliser les charges debout sans déformation posturale.' };
      if (score <= 120) return { level: 'Avancé', color: 'text-cyan-400', feedback: 'Haute rigidité axiale. Déblocage des mouvements unilatéraux et complexes.' };
      return { level: 'Élite', color: 'text-purple-400', feedback: 'Stabilité exceptionnelle. Protection optimale de la colonne sous forte contrainte.' };
    }
  },
  'test-cardio': {
    id: 'test-cardio',
    title: 'Test Aérobie : VMA Estimée ou FC de Repos au Réveil',
    categoryName: 'Capacité Cardiovasculaire (Endurance, HIIT, Récupération)',
    category: 'cardio',
    targetMuscleGroup: 'Système cardiorespiratoire & filière aérobie',
    metricType: 'kmh',
    unit: 'km/h',
    cues: [
      'Indiquez votre VMA (Vitesse Maximale Aérobie) si connue (ex: 12 à 16 km/h).',
      'OU indiquez votre vitesse maximale tenue sur 6 minutes d effort continu.',
      'Valeur de référence pour calibrer les temps d effort et de récupération en HIIT.'
    ],
    mistakesToAvoid: [
      'Confondre vitesse de sprint court avec allure aérobie soutenue.',
      'Surévaluer sa vitesse au détriment de la régularité cardiaque.'
    ],
    benchmarks: {
      beginner: '< 11 km/h',
      intermediate: '11 à 13.5 km/h',
      advanced: '13.6 à 16 km/h',
      elite: '> 16 km/h'
    },
    computeLevel: (score) => {
      if (score < 11) return { level: 'Débutant', color: 'text-zinc-400', feedback: 'Filière aérobie progressive. Intervalles doux et récupération allongée.' };
      if (score <= 13.5) return { level: 'Intermédiaire', color: 'text-emerald-400', feedback: 'Bonne base cardiovasculaire. Déblocage des protocoles HIIT 30/30.' };
      if (score <= 16) return { level: 'Avancé', color: 'text-cyan-400', feedback: 'Très bonne capacité de travail et de clairance des lactates.' };
      return { level: 'Élite', color: 'text-purple-400', feedback: 'Capacité cardiorespiratoire athlétique de haut niveau.' };
    }
  }
};

interface GuidedTestModalProps {
  testId: TestDefinitionId;
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveTestResult: (testId: TestDefinitionId, score: number, levelName: string) => void;
}

export const GuidedTestModal: React.FC<GuidedTestModalProps> = ({
  testId,
  isOpen,
  onClose,
  profile,
  onSaveTestResult
}) => {
  const definition = TEST_DEFINITIONS[testId] || TEST_DEFINITIONS['test-upper'];

  // Existing value if already taken
  const existingTest = profile.baselineTests?.find(
    (t) => t.id === testId || (testId === 'test-upper' && t.id === 'pushups')
  );

  const [scoreInput, setScoreInput] = useState<string>(
    existingTest?.value ? String(existingTest.value) : definition.metricType === 'reps' ? '15' : definition.metricType === 'seconds' ? '45' : '12.5'
  );

  // Chronometer / Stopwatch state
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1;
          // Audio discrete tick every second
          sounds.playTick();
          // Haptic every 15 seconds milestone
          if (next % 15 === 0 && typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([40, 30, 40]);
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning]);

  if (!isOpen) return null;

  const currentScore = parseFloat(scoreInput) || 0;
  const assessment = definition.computeLevel(currentScore);

  const handleStartStopTimer = () => {
    if (!timerRunning) {
      setTimerRunning(true);
      sounds.playTick();
    } else {
      setTimerRunning(false);
      // If isometric, sync score with stopwatch
      if (definition.metricType === 'seconds') {
        setScoreInput(String(elapsedSeconds));
      }
      sounds.playRestComplete();
    }
  };

  const handleResetTimer = () => {
    setTimerRunning(false);
    setElapsedSeconds(0);
  };

  const handleApplyStopwatchToScore = () => {
    setScoreInput(String(elapsedSeconds));
  };

  const handleConfirmSave = () => {
    const finalScore = parseFloat(scoreInput);
    if (isNaN(finalScore) || finalScore <= 0) {
      alert('Veuillez renseigner un score valide supérieur à 0.');
      return;
    }

    sounds.playRecordBeaten();
    onSaveTestResult(testId, finalScore, assessment.level);
    onClose();
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full sm:max-w-lg bg-zinc-950 border border-zinc-800 rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                Étalonnage Athlétique
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                {definition.targetMuscleGroup}
              </span>
            </div>
            <h2 className="text-base font-bold text-zinc-100 leading-snug">
              {definition.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-zinc-500 hover:text-zinc-300 rounded-lg shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Strict Form Instructions */}
        <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-2 text-xs">
          <div className="flex items-center gap-2 text-zinc-200 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Consignes de Forme Stricte</span>
          </div>
          <ul className="space-y-1 text-[11px] text-zinc-400 pl-5 list-disc">
            {definition.cues.map((cue, idx) => (
              <li key={idx}>{cue}</li>
            ))}
          </ul>

          <div className="pt-2 border-t border-zinc-800/80">
            <div className="flex items-center gap-1.5 text-rose-400 text-[11px] font-medium mb-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Erreurs éliminatoires :</span>
            </div>
            <ul className="space-y-0.5 text-[10px] text-zinc-500 pl-5 list-disc">
              {definition.mistakesToAvoid.map((m, idx) => (
                <li key={idx}>{m}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* 2. Interactive Audio-Visual Chronometer / Cadence */}
        <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center space-y-3">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Chronomètre de Test
            </span>
          </div>

          <div className="text-4xl sm:text-5xl font-mono font-black text-zinc-100 tracking-tight">
            {formatTimer(elapsedSeconds)}
          </div>

          <div className="flex items-center gap-2 w-full max-w-xs">
            <button
              onClick={handleStartStopTimer}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                timerRunning
                  ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950'
              }`}
            >
              {timerRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Démarrer le Test</span>
                </>
              )}
            </button>

            <button
              onClick={handleResetTimer}
              className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition"
              title="Réinitialiser"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {elapsedSeconds > 0 && definition.metricType === 'seconds' && !timerRunning && (
            <button
              onClick={handleApplyStopwatchToScore}
              className="text-[11px] text-emerald-400 hover:underline font-mono"
            >
              Insérer ce chrono ({elapsedSeconds}s) comme mon score
            </button>
          )}
        </div>

        {/* 3. Score Input & Real-time Benchmark Analysis */}
        <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-200">
              Votre Score Réalisé ({definition.unit}) :
            </label>
            <span className="text-[10px] font-mono text-zinc-500">
              Barème : {definition.benchmarks.intermediate} (Int.) • {definition.benchmarks.advanced} (Av.)
            </span>
          </div>

          <div className="flex items-center gap-3">
            {definition.metricType === 'reps' && (
              <button
                onClick={() => setScoreInput(String(Math.max(0, currentScore - 1)))}
                className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-base flex items-center justify-center"
              >
                -
              </button>
            )}

            <input
              type="number"
              step={definition.metricType === 'kmh' ? '0.5' : '1'}
              min="0"
              value={scoreInput}
              onChange={(e) => setScoreInput(e.target.value)}
              className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2 text-center text-lg font-mono font-bold text-zinc-100 focus:outline-none focus:border-emerald-500"
            />

            {definition.metricType === 'reps' && (
              <button
                onClick={() => setScoreInput(String(currentScore + 1))}
                className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-base flex items-center justify-center"
              >
                +
              </button>
            )}
          </div>

          {/* Athletic Tier Analysis */}
          <div className="p-2.5 bg-zinc-950 border border-zinc-800/80 rounded-lg flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span className="text-zinc-400">Niveau calculé :</span>
              <span className={`font-bold font-mono ${assessment.color}`}>
                {assessment.level}
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">
              Débloque la catégorie {definition.category.toUpperCase()}
            </span>
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed italic">
            "{assessment.feedback}"
          </p>
        </div>

        {/* 4. Validation CTA */}
        <div className="pt-2">
          <button
            onClick={handleConfirmSave}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-zinc-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg"
          >
            <Check className="w-4 h-4" />
            <span>Valider et Déverrouiller les Séances</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
