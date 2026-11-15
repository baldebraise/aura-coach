import React, { useState, useEffect } from 'react';
import { UserProfile, WeeklyScheduleItem, CompletedWorkoutLog, DailyHabits, PlannedWorkoutSession } from '../../types';
import { CalibrationBanner } from './CalibrationBanner';
import { AssessmentBanner } from './AssessmentBanner';
import { TestDefinitionId, TEST_DEFINITIONS } from './GuidedTestModal';
import { DashboardNutritionWidget } from '../Nutrition/DashboardNutritionWidget';
import { NutritionDetailedModal } from '../Nutrition/NutritionDetailedModal';
import { 
  Dumbbell, 
  Calendar, 
  Droplet, 
  Moon, 
  CheckCircle2, 
  TrendingUp, 
  Bell, 
  MapPin, 
  Award, 
  ChevronRight,
  Flame,
  Clock,
  Sparkles,
  Lock,
  Unlock,
  AlertTriangle,
  Play,
  Bot,
  RotateCcw
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar 
} from 'recharts';

export function getRequiredTestForSession(session?: PlannedWorkoutSession): TestDefinitionId | null {
  if (!session) return null;

  const title = session.title.toLowerCase();
  const focus = session.focusMuscles || [];

  // 1. Haut du corps (Push, Pull, Chest, Shoulders, Arms, Back)
  if (
    title.includes('haut') || 
    title.includes('push') || 
    title.includes('pull') || 
    title.includes('pectoraux') || 
    title.includes('dos') || 
    title.includes('épaules') ||
    focus.some((m) => ['chest', 'back', 'shoulders', 'biceps', 'triceps'].includes(m))
  ) {
    return 'test-upper';
  }

  // 2. Bas du corps (Legs, Squat, Quadriceps, Fessiers, Ischios)
  if (
    title.includes('bas') || 
    title.includes('jambes') || 
    title.includes('legs') || 
    title.includes('squat') || 
    title.includes('cuisses') ||
    focus.some((m) => ['quadriceps', 'hamstrings', 'glutes', 'calves'].includes(m))
  ) {
    return 'test-lower';
  }

  // 3. Gainage / Core
  if (
    title.includes('gainage') || 
    title.includes('core') || 
    title.includes('abdos') ||
    focus.includes('abs')
  ) {
    return 'test-core';
  }

  // 4. Cardio / HIIT
  if (
    title.includes('cardio') || 
    title.includes('hiit') || 
    title.includes('endurance') || 
    title.includes('vma') ||
    focus.includes('cardio')
  ) {
    return 'test-cardio';
  }

  return 'test-upper'; // Default to upper test
}

interface DashboardViewProps {
  profile: UserProfile;
  schedule: WeeklyScheduleItem[];
  completedLogs: CompletedWorkoutLog[];
  dailyHabits: DailyHabits;
  onUpdateHabits: (updated: DailyHabits) => void;
  onStartSession: (session: PlannedWorkoutSession) => void;
  onOpenAICoach: () => void;
  onOpenGuidedTest: (testId: TestDefinitionId) => void;
  onOpenGymConfig?: () => void;
  onReconfigureProfile?: () => void;
  onOpenAgenticAssessment: () => void;
  onResetAccount?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  schedule,
  completedLogs,
  dailyHabits,
  onUpdateHabits,
  onStartSession,
  onOpenAICoach,
  onOpenGuidedTest,
  onOpenGymConfig,
  onReconfigureProfile,
  onOpenAgenticAssessment,
  onResetAccount
}) => {
  const [notificationGranted, setNotificationGranted] = useState<boolean>(false);
  const [isDetailedNutritionOpen, setIsDetailedNutritionOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem('aura_nutrition_modal_open') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (isDetailedNutritionOpen) {
        localStorage.setItem('aura_nutrition_modal_open', 'true');
      } else {
        localStorage.removeItem('aura_nutrition_modal_open');
      }
    } catch {}
  }, [isDetailedNutritionOpen]);

  // Today's day of week (0 = Sunday, 1 = Monday, etc.)
  const todayDayOfWeek = new Date().getDay();
  const todayScheduleItem = (schedule && schedule.length > 0)
    ? (schedule.find((s) => s.dayOfWeek === todayDayOfWeek) || schedule[0])
    : {
        dayOfWeek: todayDayOfWeek,
        dayName: 'Aujourd hui',
        isRestDay: true,
        session: undefined
      };

  const isTodayWorkoutDay = !todayScheduleItem.isRestDay && !!todayScheduleItem.session;

  const userWeight = profile?.weightKg;

  // Check if today's session has its required test passed
  const todaySession = todayScheduleItem.session;
  const requiredTestId = todaySession ? getRequiredTestForSession(todaySession) : null;
  const isRequiredTestCompleted = requiredTestId 
    ? (profile.baselineTests || []).some((t) => t.id === requiredTestId && t.value !== undefined)
    : true;
  const requiredTestDef = requiredTestId ? TEST_DEFINITIONS[requiredTestId] : null;

  // Weight progression chart data - ONLY genuine user inputs
  const currentRecordedWeight = dailyHabits?.weightKg || userWeight;
  const weightData = userWeight
    ? [
        { date: 'Initial', weight: userWeight },
        ...(dailyHabits?.weightKg && dailyHabits.weightKg !== userWeight
          ? [{ date: 'Aujourd hui', weight: dailyHabits.weightKg }]
          : [])
      ]
    : [];

  // Volume history data - ONLY genuine logs
  const volumeData = (completedLogs && completedLogs.length > 0)
    ? completedLogs.map((log) => ({
        date: new Date(log.date).toLocaleDateString('fr-FR', { weekday: 'short' }),
        volume: Math.round(log.totalVolumeKg || 0)
      }))
    : [];

  const totalWeeklyVolume = (completedLogs && completedLogs.length > 0)
    ? completedLogs.reduce((acc, l) => acc + (l.totalVolumeKg || 0), 0)
    : 0;

  const handleRequestNotifications = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setNotificationGranted(true);
          new Notification('AURA Performance', {
            body: 'Rappels activés : vous recevrez vos alertes de séance et d hydratation.',
            icon: '/pwa-192x192.png'
          });
        }
      } catch {
        // Fallback
      }
    }
  };

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Top Welcome & Notification Reminder Banner */}
      <div className="flex items-center justify-between">
        <div>
          <span className={`text-[10px] font-mono uppercase tracking-wider font-semibold ${
            profile?.primaryGoal ? 'text-emerald-400' : 'text-amber-400'
          }`}>
            {profile?.primaryGoal ? profile.primaryGoal.toUpperCase() : 'EN ATTENTE DE CADRAGE'}
          </span>
          <h1 className="text-xl font-bold text-zinc-100">
            Bonjour, {profile?.name || 'Athlète'}
          </h1>
        </div>

        {!notificationGranted && (
          <button
            onClick={handleRequestNotifications}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-xl text-xs transition"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span>Rappels Push</span>
          </button>
        )}
      </div>

      {/* 1. INITIAL ASSESSMENT & QUESTIONNAIRE BANNER (Step 1 before tests) */}
      <AssessmentBanner
        profile={profile}
        onOpenAgenticAssessment={onOpenAgenticAssessment}
      />

      {/* 2. ATHLETIC CALIBRATION HUB BANNER (Step 2 - Physical Tests) */}
      <CalibrationBanner
        profile={profile}
        onOpenTest={onOpenGuidedTest}
        onOpenGymConfig={onOpenGymConfig}
        onOpenAgenticAssessment={onOpenAgenticAssessment}
      />

      {/* Checklist Banner / Daily Reminder */}
      {(!dailyHabits.proteinAdequate || dailyHabits.waterLiters < dailyHabits.targetWaterLiters) && (
        <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-zinc-300">
              Bilan du jour : {dailyHabits.waterLiters}L / {dailyHabits.targetWaterLiters}L d'eau • Protéines à valider
            </span>
          </div>
          <button
            onClick={() => onUpdateHabits({ ...dailyHabits, proteinAdequate: true })}
            className="text-emerald-400 font-medium hover:underline text-[11px] shrink-0"
          >
            Cocher
          </button>
        </div>
      )}

      {/* TODAY'S WORKOUT CALL TO ACTION */}
      <div className="p-4 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold tracking-wider">
            {todayScheduleItem.isRestDay ? 'JOUR DE RÉCUPÉRATION' : 'SÉANCE DU JOUR'}
          </span>
          <span className="text-xs text-zinc-500 font-mono">
            {todayScheduleItem.dayName}
          </span>
        </div>

        {todaySession ? (
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <h2 className="text-lg font-bold text-zinc-100">
                {todaySession.title}
              </h2>
              {isRequiredTestCompleted ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/50 shrink-0">
                  <CheckCircle2 className="w-3 h-3" />
                  Calibrée
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800/50 shrink-0">
                  <Lock className="w-3 h-3" />
                  Test requis
                </span>
              )}
            </div>

            <p className="text-xs text-zinc-400 mb-4">
              {todaySession.exercises.length} exercices • {todaySession.estimatedDurationMinutes} minutes ciblées
            </p>

            {/* Smart Unlocking Condition */}
            {!isRequiredTestCompleted && requiredTestDef ? (
              <div className="space-y-2">
                <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-xl text-xs text-amber-200">
                  <div className="flex items-center gap-2 mb-1 font-semibold text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Test préalable recommandé : {requiredTestDef.title}</span>
                  </div>
                  <p className="text-[11px] text-amber-200/80 leading-relaxed">
                    Ce test de 2 minutes permet d ajuster vos répétitions cibles, vos temps de repos et d éviter les surcharges articulaires.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => requiredTestId && onOpenGuidedTest(requiredTestId)}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-zinc-950 font-bold text-xs rounded-xl transition shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Passer le test ({requiredTestDef.unit})</span>
                  </button>

                  <button
                    onClick={() => onStartSession(todaySession)}
                    className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-semibold rounded-xl transition border border-zinc-800 flex items-center justify-center gap-2"
                  >
                    <span>Démarrer sans calibrer</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => onStartSession(todaySession)}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-zinc-950 font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2"
              >
                <Dumbbell className="w-4 h-4" />
                <span>Démarrer la séance</span>
              </button>
            )}
          </div>
        ) : schedule.length === 0 ? (
          <div>
            <h2 className="text-base font-bold text-zinc-200 mb-1">
              Plan d'entraînement en attente de cadrage
            </h2>
            <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
              Votre programmation personnalisée et vos séances d'entraînement seront générées dès la validation de votre premier bilan initial avec le Coach.
            </p>
            <button
              onClick={onOpenAgenticAssessment}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
            >
              <Bot className="w-4 h-4" />
              <span>Lancer le premier bilan</span>
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-base font-bold text-zinc-200 mb-1">
              Repos & Récupération Musculaire
            </h2>
            <p className="text-xs text-zinc-400 mb-3">
              Hydratez-vous, soignez votre sommeil et laissez les fibres musculaires se surcompenser.
            </p>
            <button
              onClick={onOpenAICoach}
              className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium rounded-xl transition border border-zinc-800 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Demander un protocole de récupération au coach IA</span>
            </button>
          </div>
        )}
      </div>

      {/* NUTRITION & ATHLETIC ENERGY HUB */}
      <DashboardNutritionWidget
        profile={profile}
        dailyHabits={dailyHabits}
        onUpdateHabits={onUpdateHabits}
        isWorkoutDay={isTodayWorkoutDay}
        todaySession={todayScheduleItem.session}
        onOpenDetailedNutrition={() => setIsDetailedNutritionOpen(true)}
      />

      {/* WEEKLY SCHEDULE CALENDAR WITH CALIBRATION STATUS */}
      <div className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-zinc-400" />
            <h3 className="text-sm font-semibold text-zinc-100">Planning de la Semaine</h3>
          </div>
          <span className="text-xs text-zinc-500 font-mono">
            {profile.weeklyAvailabilityDays ? `${profile.weeklyAvailabilityDays} séances / 7j` : 'Non calibré'}
          </span>
        </div>

        {schedule.length === 0 ? (
          <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-800/60 text-center">
            <p className="text-xs text-zinc-400 font-medium">Aucune séance programmée pour l'instant</p>
            <p className="text-[11px] text-zinc-500 mt-1">
              Votre cycle hebdomadaire sera structuré sur-mesure dès la validation de votre premier bilan initial.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {schedule.map((day) => {
              const isToday = day.dayOfWeek === todayDayOfWeek;
              const reqTest = day.session ? getRequiredTestForSession(day.session) : null;
              const isCalibrated = reqTest
                ? (profile.baselineTests || []).some((t) => t.id === reqTest && t.value !== undefined)
                : true;

              return (
                <div
                  key={day.dayOfWeek}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition ${
                    isToday
                      ? 'bg-zinc-900 border-emerald-500/80'
                      : 'bg-zinc-950/60 border-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`font-mono font-bold w-12 shrink-0 ${
                        isToday ? 'text-emerald-400' : 'text-zinc-500'
                      }`}
                    >
                      {day.dayName}
                    </span>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className={`truncate ${
                          day.isRestDay ? 'text-zinc-500 italic' : 'text-zinc-200 font-medium'
                        }`}
                      >
                        {day.session ? day.session.title : 'Récupération active'}
                      </span>
                      {day.session && !isCalibrated && (
                        <span className="shrink-0 p-0.5 rounded text-amber-400" title="Test de calibration recommandé">
                          <Lock className="w-3 h-3 inline" />
                        </span>
                      )}
                    </div>
                  </div>

                  {day.session && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      {!isCalibrated && reqTest && (
                        <button
                          onClick={() => onOpenGuidedTest(reqTest)}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/50 hover:bg-amber-900/60 transition"
                        >
                          Tester
                        </button>
                      )}
                      <button
                        onClick={() => onStartSession(day.session!)}
                        className="p-1 rounded-lg text-zinc-400 hover:text-emerald-400"
                        title="Lancer la séance"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PROGRESSION CHARTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Weight Evolution */}
        <div className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Évolution du Poids (kg)
            </span>
            <span className="text-xs font-mono font-bold text-zinc-100">
              {dailyHabits.weightKg || profile.weightKg ? `${dailyHabits.weightKg || profile.weightKg} kg` : '-- kg'}
            </span>
          </div>

          {weightData.length >= 2 ? (
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightData}>
                  <XAxis dataKey="date" stroke="#52525b" fontSize={10} tickLine={false} />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} stroke="#52525b" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-40 w-full flex flex-col items-center justify-center text-center p-4 bg-zinc-950/60 rounded-xl border border-zinc-800/60">
              <TrendingUp className="w-5 h-5 text-zinc-600 mb-2" />
              <p className="text-xs text-zinc-300 font-medium">
                Poids initial : {dailyHabits.weightKg || profile.weightKg ? `${dailyHabits.weightKg || profile.weightKg} kg` : 'Non renseigné'}
              </p>
              <p className="text-[11px] text-zinc-500 mt-1 max-w-xs">
                Renseignez vos pesées dans le bloc Habitudes pour tracer votre courbe réelle dans le temps.
              </p>
            </div>
          )}
        </div>

        {/* Volume Tonnage Evolution */}
        <div className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Volume de Travail Hebdo (kg)
            </span>
            <span className="text-xs font-mono font-bold text-amber-400">
              {totalWeeklyVolume} kg
            </span>
          </div>

          {volumeData.length > 0 ? (
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeData}>
                  <XAxis dataKey="date" stroke="#52525b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#52525b" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Bar dataKey="volume" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-40 w-full flex flex-col items-center justify-center text-center p-4 bg-zinc-950/60 rounded-xl border border-zinc-800/60">
              <Flame className="w-5 h-5 text-zinc-600 mb-2" />
              <p className="text-xs text-zinc-300 font-medium">0 séance terminée cette semaine</p>
              <p className="text-[11px] text-zinc-500 mt-1 max-w-xs">
                Votre tonnage réel (charges x répétitions) s'affichera ici dès la validation de votre premier entraînement.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reconfigure Profile & Account Reset Quick Access */}
      {(onReconfigureProfile || onResetAccount) && (
        <div className="p-4 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-semibold text-zinc-200">Gestion & Réinitialisation</h4>
            <p className="text-[11px] text-zinc-500">Repasser le cadrage initial ou remettre le compte à neuf</p>
          </div>
          <div className="flex items-center gap-2">
            {onReconfigureProfile && (
              <button
                onClick={onReconfigureProfile}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl transition"
              >
                Reconfigurer
              </button>
            )}
            {onResetAccount && (
              <button
                onClick={() => {
                  if (window.confirm('Voulez-vous remettre votre compte à zéro ? Toutes les données, tests, plan et historique seront effacés pour repartir sur un compte totalement neuf.')) {
                    onResetAccount();
                  }
                }}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-rose-950/60 border border-zinc-800 hover:border-rose-900 text-zinc-400 hover:text-rose-400 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                title="Remettre le compte à zéro"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Remise à 0</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Detailed Nutrition & Assistant Modal */}
      <NutritionDetailedModal
        isOpen={isDetailedNutritionOpen}
        onClose={() => setIsDetailedNutritionOpen(false)}
        profile={profile}
        dailyHabits={dailyHabits}
        onUpdateHabits={onUpdateHabits}
        isWorkoutDay={isTodayWorkoutDay}
        sessionTitle={todayScheduleItem.session?.title}
      />
    </div>
  );
};
