import React, { useState } from 'react';
import { UserProfile, WeeklyScheduleItem, CompletedWorkoutLog, DailyHabits } from '../../types';
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
  Sparkles
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

interface DashboardViewProps {
  profile: UserProfile;
  schedule: WeeklyScheduleItem[];
  completedLogs: CompletedWorkoutLog[];
  dailyHabits: DailyHabits;
  onUpdateHabits: (updated: DailyHabits) => void;
  onStartSession: (session: any) => void;
  onOpenAICoach: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  schedule,
  completedLogs,
  dailyHabits,
  onUpdateHabits,
  onStartSession,
  onOpenAICoach
}) => {
  const [notificationGranted, setNotificationGranted] = useState<boolean>(false);

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

  const userWeight = profile?.weightKg || 75;

  // Weight progression chart data
  const weightData = [
    { date: 'S-3', weight: userWeight + 1.2 },
    { date: 'S-2', weight: userWeight + 0.8 },
    { date: 'S-1', weight: userWeight + 0.3 },
    { date: 'Aujourd hui', weight: dailyHabits?.weightKg || userWeight }
  ];

  // Volume history data
  const volumeData = (completedLogs && completedLogs.length > 0)
    ? completedLogs.map((log) => ({
        date: new Date(log.date).toLocaleDateString('fr-FR', { weekday: 'short' }),
        volume: Math.round(log.totalVolumeKg || 0)
      }))
    : [
        { date: 'Lun', volume: 3200 },
        { date: 'Mer', volume: 4100 },
        { date: 'Ven', volume: 3800 }
      ];

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
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
            {(profile?.primaryGoal || 'recomposition').toUpperCase()}
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

        {todayScheduleItem.session ? (
          <div>
            <h2 className="text-lg font-bold text-zinc-100 mb-1">
              {todayScheduleItem.session.title}
            </h2>
            <p className="text-xs text-zinc-400 mb-4">
              {todayScheduleItem.session.exercises.length} exercices • {todayScheduleItem.session.estimatedDurationMinutes} minutes ciblées
            </p>

            <button
              onClick={() => onStartSession(todayScheduleItem.session)}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-zinc-950 font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2"
            >
              <Dumbbell className="w-4 h-4" />
              <span>Démarrer la séance</span>
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

      {/* DAILY HABITS TRACKER */}
      <div className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-zinc-100">Habitudes & Nutrition du Jour</h3>
          <span className="text-[10px] font-mono text-zinc-500 uppercase">Non restrictif</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Water */}
          <div className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplet className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-mono block">Eau</span>
                <span className="text-xs font-mono font-bold text-zinc-200">
                  {dailyHabits.waterLiters}L / {dailyHabits.targetWaterLiters}L
                </span>
              </div>
            </div>
            <button
              onClick={() =>
                onUpdateHabits({
                  ...dailyHabits,
                  waterLiters: Math.min(4, dailyHabits.waterLiters + 0.5)
                })
              }
              className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-cyan-400 rounded-lg text-xs font-mono"
            >
              +0.5L
            </button>
          </div>

          {/* Sleep */}
          <div className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-400" />
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-mono block">Sommeil</span>
                <span className="text-xs font-mono font-bold text-zinc-200">
                  {dailyHabits.sleepHours || 7.5}h
                </span>
              </div>
            </div>
          </div>

          {/* Protein check */}
          <div
            onClick={() =>
              onUpdateHabits({
                ...dailyHabits,
                proteinAdequate: !dailyHabits.proteinAdequate
              })
            }
            className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
              dailyHabits.proteinAdequate
                ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                : 'bg-zinc-950/80 border-zinc-800/80 text-zinc-400'
            }`}
          >
            <div>
              <span className="text-[10px] uppercase font-mono block">Protéines</span>
              <span className="text-xs font-medium">À chaque repas</span>
            </div>
            {dailyHabits.proteinAdequate ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <div className="w-4 h-4 rounded-full border border-zinc-700" />
            )}
          </div>

          {/* Whole foods check */}
          <div
            onClick={() =>
              onUpdateHabits({
                ...dailyHabits,
                wholeFoodsAdequate: !dailyHabits.wholeFoodsAdequate
              })
            }
            className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
              dailyHabits.wholeFoodsAdequate
                ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                : 'bg-zinc-950/80 border-zinc-800/80 text-zinc-400'
            }`}
          >
            <div>
              <span className="text-[10px] uppercase font-mono block">Végétaux</span>
              <span className="text-xs font-medium">Légumes & fibres</span>
            </div>
            {dailyHabits.wholeFoodsAdequate ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <div className="w-4 h-4 rounded-full border border-zinc-700" />
            )}
          </div>
        </div>
      </div>

      {/* WEEKLY SCHEDULE CALENDAR */}
      <div className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-zinc-400" />
            <h3 className="text-sm font-semibold text-zinc-100">Planning de la Semaine</h3>
          </div>
          <span className="text-xs text-zinc-500 font-mono">
            {profile.weeklyAvailabilityDays} séances / 7j
          </span>
        </div>

        <div className="space-y-1.5">
          {schedule.map((day) => {
            const isToday = day.dayOfWeek === todayDayOfWeek;

            return (
              <div
                key={day.dayOfWeek}
                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition ${
                  isToday
                    ? 'bg-zinc-900 border-emerald-500/80'
                    : 'bg-zinc-950/60 border-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`font-mono font-bold w-12 ${
                      isToday ? 'text-emerald-400' : 'text-zinc-500'
                    }`}
                  >
                    {day.dayName}
                  </span>
                  <span
                    className={`truncate ${
                      day.isRestDay ? 'text-zinc-500 italic' : 'text-zinc-200 font-medium'
                    }`}
                  >
                    {day.session ? day.session.title : 'Récupération active'}
                  </span>
                </div>

                {day.session && (
                  <button
                    onClick={() => onStartSession(day.session)}
                    className="p-1 rounded-lg text-zinc-400 hover:text-emerald-400"
                    title="Voir ou lancer la séance"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
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
              {dailyHabits.weightKg || profile.weightKg} kg
            </span>
          </div>
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
        </div>

        {/* Volume Tonnage Evolution */}
        <div className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Volume de Travail Hebdo (kg)
            </span>
            <span className="text-xs font-mono font-bold text-amber-400">
              {completedLogs.reduce((acc, l) => acc + l.totalVolumeKg, 0) || 11100} kg
            </span>
          </div>
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
        </div>
      </div>
    </div>
  );
};
