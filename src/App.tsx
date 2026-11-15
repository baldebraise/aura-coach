import React, { useState, useEffect } from 'react';
import { 
  UserProfile, 
  PlannedWorkoutSession, 
  WeeklyScheduleItem, 
  CompletedWorkoutLog, 
  DailyHabits,
  GymLocation,
  GoogleAuthUser
} from './types';
import { DEFAULT_GYMS } from './data/defaultGyms';
import { generateDefaultSchedule } from './services/gemini';
import { Navigation, ActiveTab } from './components/Navigation';
import { WelcomeScreen } from './components/Welcome/WelcomeScreen';
import { DashboardView } from './components/Dashboard/DashboardView';
import { ExerciseLibraryView } from './components/ExerciseLibrary/ExerciseLibraryView';
import { AICoachView } from './components/AICoach/AICoachView';
import { ProfileView } from './components/Profile/ProfileView';
import { OnboardingFlow } from './components/Onboarding/OnboardingFlow';
import { GymPreWorkoutModal } from './components/LiveWorkoutPlayer/GymPreWorkoutModal';
import { LiveWorkoutModal } from './components/LiveWorkoutPlayer/LiveWorkoutModal';
import { AccountModal } from './components/Account/AccountModal';
import { FirebaseConfigModal } from './components/Account/FirebaseConfigModal';
import { ErrorAlertBanner, AppError } from './components/Common/ErrorAlertBanner';

export const App: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Screen state when not fully onboarded: 'welcome' | 'onboarding'
  const [authScreen, setAuthScreen] = useState<'welcome' | 'onboarding'>('welcome');

  // Global Error Banner State
  const [currentError, setCurrentError] = useState<AppError | null>(null);

  // Modals State
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [isFirebaseConfigOpen, setIsFirebaseConfigOpen] = useState<boolean>(false);

  // User Profile
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('aura_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Schedule
  const [schedule, setSchedule] = useState<WeeklyScheduleItem[]>(() => {
    try {
      const saved = localStorage.getItem('aura_schedule');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Completed Workout Logs
  const [completedLogs, setCompletedLogs] = useState<CompletedWorkoutLog[]>(() => {
    try {
      const saved = localStorage.getItem('aura_completed_logs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Daily Habits
  const [dailyHabits, setDailyHabits] = useState<DailyHabits>(() => {
    try {
      const saved = localStorage.getItem('aura_daily_habits');
      const todayStr = new Date().toISOString().split('T')[0];
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === todayStr) return parsed;
      }
      return {
        date: todayStr,
        weightKg: profile?.weightKg || 75,
        sleepHours: 7.5,
        waterLiters: 1.5,
        targetWaterLiters: 2.5,
        proteinAdequate: false,
        wholeFoodsAdequate: false,
        stretchingDone: false
      };
    } catch {
      return {
        date: new Date().toISOString().split('T')[0],
        weightKg: 75,
        sleepHours: 7.5,
        waterLiters: 1.5,
        targetWaterLiters: 2.5,
        proteinAdequate: false,
        wholeFoodsAdequate: false,
        stretchingDone: false
      };
    }
  });

  // Live Workout Session Modals
  const [pendingSessionToStart, setPendingSessionToStart] = useState<PlannedWorkoutSession | null>(null);
  const [activeWorkoutSession, setActiveWorkoutSession] = useState<{
    session: PlannedWorkoutSession;
    gym: GymLocation;
  } | null>(null);

  // Sync to localStorage
  useEffect(() => {
    if (profile) {
      localStorage.setItem('aura_profile', JSON.stringify(profile));
    }
  }, [profile]);

  useEffect(() => {
    if (schedule.length > 0) {
      localStorage.setItem('aura_schedule', JSON.stringify(schedule));
    }
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem('aura_completed_logs', JSON.stringify(completedLogs));
  }, [completedLogs]);

  useEffect(() => {
    localStorage.setItem('aura_daily_habits', JSON.stringify(dailyHabits));
  }, [dailyHabits]);

  // Google Sign In Success Handler
  const handleGoogleSignInSuccess = (googleUser: GoogleAuthUser) => {
    if (profile && profile.onboardingCompleted) {
      // Existing profile: update with google user
      setProfile({
        ...profile,
        name: googleUser.displayName || profile.name,
        isGoogleAuthenticated: true,
        googleUser
      });
      setActiveTab('dashboard');
    } else {
      // Create initial profile container with Google User data
      const initialProfile: UserProfile = {
        id: googleUser.uid,
        name: googleUser.displayName || 'Athlète',
        age: 28,
        gender: 'male',
        heightCm: 178,
        weightKg: 75,
        injuries: [],
        activityLevel: 'moderate',
        weeklyAvailabilityDays: 3,
        preferredSessionDurationMinutes: 60,
        primaryGoal: 'recomposition',
        secondaryGoals: [],
        baselineTests: [],
        gyms: DEFAULT_GYMS,
        isGoogleAuthenticated: true,
        googleUser,
        onboardingCompleted: false
      };
      setProfile(initialProfile);
      setAuthScreen('onboarding');
    }
  };

  // Handle Onboarding Completion
  const handleOnboardingComplete = (completedProfile: UserProfile) => {
    const mergedProfile: UserProfile = {
      ...completedProfile,
      googleUser: profile?.googleUser || null,
      isGoogleAuthenticated: !!profile?.isGoogleAuthenticated
    };
    const generatedSchedule = generateDefaultSchedule(mergedProfile);
    setProfile(mergedProfile);
    setSchedule(generatedSchedule);
    setActiveTab('dashboard');
  };

  // Launch Session Process: 1) Trigger Pre-workout Gym Selector
  const handleRequestStartSession = (sessionToStart?: PlannedWorkoutSession) => {
    if (!sessionToStart) {
      const todayDay = new Date().getDay();
      const todayItem = schedule.find((s) => s.dayOfWeek === todayDay && s.session);
      const session = todayItem?.session || schedule.find((s) => s.session)?.session;
      if (session) {
        setPendingSessionToStart(session);
      }
    } else {
      setPendingSessionToStart(sessionToStart);
    }
  };

  // Launch Session Process: 2) Start Live Player with chosen gym
  const handleConfirmStartWithGym = (selectedGym: GymLocation, adaptedSession: PlannedWorkoutSession) => {
    setPendingSessionToStart(null);
    setActiveWorkoutSession({
      session: adaptedSession,
      gym: selectedGym
    });
  };

  // Live Session finished
  const handleFinishWorkout = (log: CompletedWorkoutLog) => {
    setCompletedLogs((prev) => [log, ...prev]);
    setActiveWorkoutSession(null);
  };

  // Coach AI Action Proposals Apply
  const handleApplyActionProposal = (proposal: any) => {
    if (proposal.type === 'replace_exercise') {
      const { replaceFrom, replaceTo } = proposal.details;
      setSchedule((prev) =>
        prev.map((item) => {
          if (!item.session) return item;
          return {
            ...item,
            session: {
              ...item.session,
              exercises: item.session.exercises.map((ex) =>
                ex.exerciseId === replaceFrom ? { ...ex, exerciseId: replaceTo } : ex
              )
            }
          };
        })
      );
    } else if (proposal.type === 'adjust_volume') {
      const { targetDuration, maxSets } = proposal.details;
      setSchedule((prev) =>
        prev.map((item) => {
          if (!item.session) return item;
          return {
            ...item,
            session: {
              ...item.session,
              estimatedDurationMinutes: targetDuration,
              exercises: item.session.exercises.slice(0, 3).map((ex) => ({
                ...ex,
                targetSets: Math.min(ex.targetSets, maxSets),
                restSeconds: 60
              }))
            }
          };
        })
      );
    }
  };

  // 1. If user has no completed profile yet
  if (!profile || !profile.onboardingCompleted) {
    if (authScreen === 'welcome') {
      return (
        <>
          <ErrorAlertBanner
            error={currentError}
            onDismiss={() => setCurrentError(null)}
          />
          <WelcomeScreen
            onStartOnboarding={() => setAuthScreen('onboarding')}
            onGoogleSignInSuccess={handleGoogleSignInSuccess}
            onError={(err) => setCurrentError({ id: 'err-' + Date.now(), ...err })}
            onOpenFirebaseConfig={() => setIsFirebaseConfigOpen(true)}
          />
          <FirebaseConfigModal
            isOpen={isFirebaseConfigOpen}
            onClose={() => setIsFirebaseConfigOpen(false)}
            onConfigSaved={() => {
              setCurrentError(null);
            }}
          />
        </>
      );
    }
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center">
        <ErrorAlertBanner
          error={currentError}
          onDismiss={() => setCurrentError(null)}
        />
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  // 2. Active Application Dashboard & Tabs
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Explicit Global Error Banner */}
      <ErrorAlertBanner
        error={currentError}
        onDismiss={() => setCurrentError(null)}
      />

      {/* Main Top Nav Bar */}
      <header className="sticky top-0 z-30 bg-zinc-950/90 border-b border-zinc-800/80 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 text-zinc-950 font-black font-mono flex items-center justify-center text-xs tracking-tighter">
            A
          </div>
          <span className="font-bold tracking-tight text-sm text-zinc-100">
            AURA
          </span>
          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 ml-1">
            v1.0
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Quick Workout Button */}
          <button
            onClick={() => handleRequestStartSession()}
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold rounded-lg transition shadow-sm"
          >
            Séance
          </button>

          {/* User Photo Avatar / Account Menu Trigger */}
          <button
            onClick={() => setIsAccountModalOpen(true)}
            className="w-8 h-8 rounded-full border-2 border-zinc-700 hover:border-emerald-500 overflow-hidden transition flex items-center justify-center bg-zinc-900"
            title="Gérer mon compte"
          >
            {profile.googleUser?.photoURL ? (
              <img
                src={profile.googleUser.photoURL}
                alt={profile.googleUser.displayName || 'Photo Google'}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs font-mono font-bold text-zinc-300">
                {profile.name.charAt(0).toUpperCase()}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 pt-4">
        {activeTab === 'dashboard' && (
          <DashboardView
            profile={profile}
            schedule={schedule}
            completedLogs={completedLogs}
            dailyHabits={dailyHabits}
            onUpdateHabits={setDailyHabits}
            onStartSession={(s) => handleRequestStartSession(s)}
            onOpenAICoach={() => setActiveTab('ai')}
          />
        )}

        {activeTab === 'workout' && (
          <div className="space-y-4 pb-20">
            <div>
              <h1 className="text-xl font-bold text-zinc-100">Séances & Programmation</h1>
              <p className="text-xs text-zinc-500">
                Planning hebdomadaire calibré sur votre objectif ({profile.primaryGoal})
              </p>
            </div>

            <div className="space-y-3">
              {schedule.map((item) => (
                <div
                  key={item.dayOfWeek}
                  className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl flex items-center justify-between"
                >
                  <div>
                    <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">
                      {item.dayName}
                    </span>
                    <h3 className="text-sm font-semibold text-zinc-100">
                      {item.session ? item.session.title : 'Récupération & Repos'}
                    </h3>
                    {item.session && (
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {item.session.exercises.length} exercices • {item.session.estimatedDurationMinutes} min
                      </p>
                    )}
                  </div>

                  {item.session && (
                    <button
                      onClick={() => handleRequestStartSession(item.session)}
                      className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold rounded-xl transition"
                    >
                      Démarrer
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'library' && <ExerciseLibraryView />}

        {activeTab === 'ai' && (
          <AICoachView
            profile={profile}
            schedule={schedule}
            onApplyAction={handleApplyActionProposal}
            onUpdateProfile={setProfile}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            profile={profile}
            onUpdateProfile={setProfile}
            onResetOnboarding={() => {
              localStorage.removeItem('aura_profile');
              setProfile(null);
              setAuthScreen('welcome');
            }}
          />
        )}
      </main>

      {/* Account Management Modal */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        profile={profile}
        onUpdateProfile={setProfile}
        onLogout={() => {
          setProfile({
            ...profile,
            isGoogleAuthenticated: false,
            googleUser: null
          });
        }}
        onShowFirebaseConfig={() => {
          setIsAccountModalOpen(false);
          setIsFirebaseConfigOpen(true);
        }}
      />

      {/* Firebase Config Modal */}
      <FirebaseConfigModal
        isOpen={isFirebaseConfigOpen}
        onClose={() => setIsFirebaseConfigOpen(false)}
        onConfigSaved={() => {
          setCurrentError(null);
        }}
      />

      {/* Pre-Workout Gym Selector Modal */}
      {pendingSessionToStart && (
        <GymPreWorkoutModal
          gyms={profile.gyms || DEFAULT_GYMS}
          session={pendingSessionToStart}
          isOpen={true}
          onClose={() => setPendingSessionToStart(null)}
          onConfirmStart={handleConfirmStartWithGym}
          onAddNewGym={(newGym) => {
            setProfile({
              ...profile,
              gyms: [...profile.gyms, newGym]
            });
          }}
        />
      )}

      {/* Fullscreen Live Workout Player */}
      {activeWorkoutSession && (
        <LiveWorkoutModal
          session={activeWorkoutSession.session}
          gym={activeWorkoutSession.gym}
          isOpen={true}
          onClose={() => setActiveWorkoutSession(null)}
          onFinishWorkout={handleFinishWorkout}
        />
      )}

      {/* Bottom Mobile Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isWorkoutActive={!!activeWorkoutSession}
      />
    </div>
  );
};

export default App;
