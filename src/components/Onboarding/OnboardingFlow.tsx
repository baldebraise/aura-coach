import React, { useState } from 'react';
import { UserProfile, GymLocation, PhysicalTestMetric, EquipmentType } from '../../types';
import { DEFAULT_GYMS, EQUIPMENT_LABELS } from '../../data/defaultGyms';
import { sounds } from '../../utils/audio';
import { 
  User, 
  Target, 
  MapPin, 
  Activity, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Timer, 
  Play, 
  Pause, 
  RotateCcw,
  ShieldAlert
} from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: (profile: UserProfile) => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Profile Form State
  const [name, setName] = useState<string>('');
  const [age, setAge] = useState<number>(28);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [heightCm, setHeightCm] = useState<number>(178);
  const [weightKg, setWeightKg] = useState<number>(75);
  const [selectedInjuries, setSelectedInjuries] = useState<string[]>([]);
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'very_active'>('moderate');

  // Goals Form State
  const [primaryGoal, setPrimaryGoal] = useState<'recomposition' | 'muscle_gain' | 'strength' | 'endurance' | 'mobility_health'>('recomposition');
  const [weeklyDays, setWeeklyDays] = useState<number>(3);
  const [sessionDuration, setSessionDuration] = useState<number>(60);

  // Gyms Initial Setup State
  const [homeEquipment, setHomeEquipment] = useState<EquipmentType[]>([
    'bodyweight',
    'dumbbells',
    'resistance_bands'
  ]);
  const [hasCommercialGym, setHasCommercialGym] = useState<boolean>(true);

  // Physical Tests State
  const [pushupsCount, setPushupsCount] = useState<string>('20');
  const [plankSeconds, setPlankSeconds] = useState<number>(60);
  const [wallSitSeconds, setWallSitSeconds] = useState<number>(45);
  const [restingHeartRate, setRestingHeartRate] = useState<string>('65');
  const [vmaEstimated, setVmaEstimated] = useState<string>('12.5');

  // Interactive Test Timer State
  const [testTimerRunning, setTestTimerRunning] = useState<boolean>(false);
  const [testTimerElapsed, setTestTimerElapsed] = useState<number>(0);

  React.useEffect(() => {
    let interval: any = null;
    if (testTimerRunning) {
      interval = setInterval(() => {
        setTestTimerElapsed((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [testTimerRunning]);

  const injuryOptions = [
    { id: 'knees', label: 'Genoux' },
    { id: 'lower_back', label: 'Bas du dos / Lombaires' },
    { id: 'shoulders', label: 'Épaules' },
    { id: 'elbows_wrists', label: 'Coudes / Poignets' },
    { id: 'cervical', label: 'Nuque / Cervicales' }
  ];

  const handleFinishOnboarding = () => {
    const gyms: GymLocation[] = [
      {
        id: 'gym-home',
        name: 'Maison / Salon',
        isDefault: true,
        equipment: homeEquipment,
        notes: 'Matériel disponible à domicile'
      }
    ];

    if (hasCommercialGym) {
      gyms.push(DEFAULT_GYMS[1]); // Commercial gym
    }

    const baselineTests: PhysicalTestMetric[] = [
      {
        id: 'test-upper',
        name: 'Test Force Haut (Pompes)',
        category: 'strength',
        unit: 'reps',
        value: parseInt(pushupsCount) || 0,
        instructions: 'Nombre maximum de répétitions complètes sans pause'
      },
      {
        id: 'test-core',
        name: 'Test Gainage (Planche)',
        category: 'strength',
        unit: 'secondes',
        value: plankSeconds,
        instructions: 'Maintien rigide en appui sur les avant-bras'
      },
      {
        id: 'test-lower',
        name: 'Test Force Bas (Chaise)',
        category: 'strength',
        unit: 'secondes',
        value: wallSitSeconds,
        instructions: 'Dos au mur, cuisses à 90 degrés'
      },
      {
        id: 'test-cardio',
        name: 'Test Cardio (VMA)',
        category: 'cardio',
        unit: 'km/h',
        value: parseFloat(vmaEstimated) || 12,
        instructions: 'Estimation ou résultat d un test demi-cooper (6 min)'
      }
    ];

    const completedProfile: UserProfile = {
      id: 'user-' + Date.now(),
      name: name.trim() || 'Athlète',
      age,
      gender,
      heightCm,
      weightKg,
      injuries: selectedInjuries,
      activityLevel,
      weeklyAvailabilityDays: weeklyDays,
      preferredSessionDurationMinutes: sessionDuration,
      primaryGoal,
      secondaryGoals: [],
      baselineTests,
      gyms,
      isGoogleAuthenticated: false,
      onboardingCompleted: true
    };

    sounds.playRecordBeaten();
    onComplete(completedProfile);
  };

  return (
    <div className="max-w-lg mx-auto py-6 px-4 pb-20 animate-in fade-in duration-300">
      {/* Stepper Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-500 mb-2">
          <span>ÉTAT DES LIEUX • ÉTAPE {currentStep} SUR 4</span>
          <span className="text-emerald-400 font-semibold">{currentStep * 25}%</span>
        </div>
        <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${currentStep * 25}%` }}
          />
        </div>
      </div>

      {/* STEP 1: MORPHOLOGY & HEALTH */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Profil & Santé</h1>
            <p className="text-xs text-zinc-500">
              Renseignez vos données biométriques pour adapter les calculs de progression.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                Prénom ou Identifiant
              </label>
              <input
                type="text"
                placeholder="Votre prénom..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                  Âge
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value) || 20)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                  Sexe
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="male">Homme</option>
                  <option value="female">Femme</option>
                  <option value="other">Autre</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                  Poids (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value) || 60)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                  Taille (cm)
                </label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(parseInt(e.target.value) || 170)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Past Injuries / Weak points */}
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                Zones sensibles ou antécédents de blessures
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {injuryOptions.map((opt) => {
                  const isChecked = selectedInjuries.includes(opt.id);
                  return (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => {
                        if (isChecked) {
                          setSelectedInjuries(selectedInjuries.filter((i) => i !== opt.id));
                        } else {
                          setSelectedInjuries([...selectedInjuries, opt.id]);
                        }
                      }}
                      className={`p-2 rounded-lg text-left text-xs transition border flex items-center justify-between ${
                        isChecked
                          ? 'bg-zinc-800 border-amber-500 text-zinc-100 font-medium'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Activity Level */}
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                Niveau d'activité quotidienne hors sport
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'sedentary', label: 'Sédentaire (Bureau)' },
                  { id: 'moderate', label: 'Actif (Marche régulière)' },
                  { id: 'very_active', label: 'Physique (Métier manuel)' }
                ].map((act) => (
                  <button
                    type="button"
                    key={act.id}
                    onClick={() => setActivityLevel(act.id as any)}
                    className={`p-2 rounded-lg text-left text-xs transition border ${
                      activityLevel === act.id
                        ? 'bg-zinc-800 border-emerald-500 text-zinc-100 font-medium'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    {act.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => setCurrentStep(2)}
            className="w-full mt-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm rounded-xl transition flex items-center justify-center gap-2"
          >
            <span>Continuer vers les Objectifs</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 2: GOALS & AVAILABILITY */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Objectifs & Emploi du Temps</h1>
            <p className="text-xs text-zinc-500">
              Définissez votre cible prioritaire et le volume d'entraînement réaliste.
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-mono uppercase text-zinc-400">
              Objectif Prioritaire
            </label>
            <div className="space-y-2">
              {[
                { id: 'recomposition', title: 'Recomposition Corporelle', desc: 'Perte de masse grasse, tonus musculaire et santé métabolique' },
                { id: 'muscle_gain', title: 'Prise de Masse & Hypertrophie', desc: 'Développement du volume musculaire et gain de force' },
                { id: 'strength', title: 'Force Maximale & Athlétisme', desc: 'Progression sur les mouvements polyarticulaires et puissance' },
                { id: 'endurance', title: 'Endurance & Capacité Cardio', desc: 'Amélioration de la VO2max, chronos et résistance à la fatigue' },
                { id: 'mobility_health', title: 'Santé, Mobilité & Posture', desc: 'Soulagement des raideurs, souplesse et renforcement postural' }
              ].map((goal) => {
                const isSelected = primaryGoal === goal.id;
                return (
                  <div
                    key={goal.id}
                    onClick={() => setPrimaryGoal(goal.id as any)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-900 border-emerald-500 text-zinc-100'
                        : 'bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900/70 text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-zinc-100">{goal.title}</span>
                      {isSelected ? (
                        <div className="w-4 h-4 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-zinc-700" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-500">{goal.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Weekly Days */}
            <div className="pt-2">
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">
                Séances par semaine : <span className="text-emerald-400 font-bold">{weeklyDays} jours</span>
              </label>
              <div className="flex gap-2">
                {[2, 3, 4, 5].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setWeeklyDays(days)}
                    className={`flex-1 py-2.5 rounded-xl font-mono text-sm font-bold border transition ${
                      weeklyDays === days
                        ? 'bg-zinc-800 border-emerald-500 text-emerald-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    {days}j
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">
                Durée cible par séance : <span className="text-emerald-400 font-bold">{sessionDuration} min</span>
              </label>
              <div className="flex gap-2">
                {[45, 60, 75, 90].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setSessionDuration(dur)}
                    className={`flex-1 py-2 rounded-xl font-mono text-xs font-bold border transition ${
                      sessionDuration === dur
                        ? 'bg-zinc-800 border-emerald-500 text-emerald-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    {dur}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={() => setCurrentStep(1)}
              className="py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm rounded-xl transition flex items-center justify-center gap-2"
            >
              <span>Continuer vers les Salles</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: INITIAL GYM LOCATIONS & EQUIPMENT */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Vos Lieux d'Entraînement</h1>
            <p className="text-xs text-zinc-500">
              Définissez les équipements disponibles chez vous et dans votre salle pour adapter chaque séance.
            </p>
          </div>

          <div className="space-y-4">
            {/* Home Gym */}
            <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-zinc-100">Lieu 1 : Maison / Domicile</h3>
              </div>

              <p className="text-xs text-zinc-400 mb-2">
                Cochez ce que vous possédez à la maison :
              </p>

              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'bodyweight', label: 'Poids de corps (Tapis)' },
                  { id: 'dumbbells', label: 'Haltères' },
                  { id: 'pullup_bar', label: 'Barre de traction' },
                  { id: 'resistance_bands', label: 'Élastiques' },
                  { id: 'bench', label: 'Banc réglable' },
                  { id: 'kettlebell', label: 'Kettlebell' }
                ].map((item) => {
                  const isChecked = homeEquipment.includes(item.id as EquipmentType);
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => {
                        if (isChecked) {
                          setHomeEquipment(homeEquipment.filter((eq) => eq !== item.id));
                        } else {
                          setHomeEquipment([...homeEquipment, item.id as EquipmentType]);
                        }
                      }}
                      className={`p-2 rounded-lg text-left text-xs transition border flex items-center justify-between ${
                        isChecked
                          ? 'bg-zinc-800 border-emerald-500 text-zinc-100 font-medium'
                          : 'bg-zinc-950/80 border-zinc-800 text-zinc-500'
                      }`}
                    >
                      <span className="truncate mr-1">{item.label}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Commercial Gym Toggle */}
            <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-zinc-100">Lieu 2 : Salle de Sport Payante</h3>
                </div>
                <input
                  type="checkbox"
                  checked={hasCommercialGym}
                  onChange={(e) => setHasCommercialGym(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded"
                />
              </div>
              <p className="text-xs text-zinc-400">
                Accès à un club commercial (Basic-Fit, FitnessPark...) avec parcs complets de barres, machines et poulies.
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={() => setCurrentStep(2)}
              className="py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm rounded-xl transition flex items-center justify-center gap-2"
            >
              <span>Continuer vers les Tests Physiques</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: PHYSICAL TESTS BENCHMARKS */}
      {currentStep === 4 && (
        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Batterie de Tests Physiques</h1>
            <p className="text-xs text-zinc-500">
              Évaluez votre condition initiale pour calibrer les charges et chronos de départ.
            </p>
          </div>

          {/* Interactive Stopwatch Helper */}
          <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Timer className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-500 block">Chrono de Test</span>
                <span className="text-lg font-mono font-bold text-zinc-100">
                  {testTimerElapsed} secondes
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTestTimerRunning(!testTimerRunning)}
                className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  testTimerRunning
                    ? 'bg-amber-500 text-zinc-950'
                    : 'bg-emerald-500 text-zinc-950'
                }`}
              >
                {testTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTestTimerRunning(false);
                  setTestTimerElapsed(0);
                }}
                className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-zinc-200"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {/* Test 1: Pushups */}
            <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-zinc-200">Test Force : Pompes propres</span>
                <span className="text-[10px] text-zinc-500 uppercase font-mono">Max reps</span>
              </div>
              <input
                type="number"
                value={pushupsCount}
                onChange={(e) => setPushupsCount(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm font-mono text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Test 2: Plank */}
            <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-zinc-200">Test Tronc : Gainage Planche</span>
                <span className="text-[10px] text-zinc-500 uppercase font-mono">Secondes</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={plankSeconds}
                  onChange={(e) => setPlankSeconds(parseInt(e.target.value) || 0)}
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm font-mono text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setPlankSeconds(testTimerElapsed)}
                  className="px-3 bg-zinc-800 text-zinc-300 text-xs rounded-lg hover:bg-zinc-700"
                >
                  Coller chrono ({testTimerElapsed}s)
                </button>
              </div>
            </div>

            {/* Test 3: Wall sit */}
            <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-zinc-200">Test Cuisses : Chaise Isométrique</span>
                <span className="text-[10px] text-zinc-500 uppercase font-mono">Secondes</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={wallSitSeconds}
                  onChange={(e) => setWallSitSeconds(parseInt(e.target.value) || 0)}
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm font-mono text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setWallSitSeconds(testTimerElapsed)}
                  className="px-3 bg-zinc-800 text-zinc-300 text-xs rounded-lg hover:bg-zinc-700"
                >
                  Coller chrono ({testTimerElapsed}s)
                </button>
              </div>
            </div>

            {/* Test 4: Cardio resting heart rate */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                <span className="text-xs font-semibold text-zinc-200 block mb-1">Pouls au Repos</span>
                <input
                  type="number"
                  placeholder="Ex: 65"
                  value={restingHeartRate}
                  onChange={(e) => setRestingHeartRate(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm font-mono text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">BPM</span>
              </div>

              <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                <span className="text-xs font-semibold text-zinc-200 block mb-1">VMA Estimée</span>
                <input
                  type="number"
                  step="0.5"
                  placeholder="Ex: 13.0"
                  value={vmaEstimated}
                  onChange={(e) => setVmaEstimated(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm font-mono text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">km/h</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={() => setCurrentStep(3)}
              className="py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleFinishOnboarding}
              className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50"
            >
              <span>Valider et Générer mon Programme</span>
              <Check className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
