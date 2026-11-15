import React, { useState, useEffect } from 'react';
import { 
  UserProfile, 
  PlannedWorkoutSession, 
  WeeklyScheduleItem, 
  CompletedWorkoutLog, 
  DailyHabits,
  GymLocation,
  GoogleAuthUser,
  PhysicalTestMetric
} from './types';
import { DEFAULT_GYMS } from './data/defaultGyms';
import { generateDefaultSchedule } from './services/gemini';
import { subscribeToAuthChanges, checkRedirectResult } from './services/firebase';
import { sounds } from './utils/audio';
import { Navigation, ActiveTab } from './components/Navigation';
import { WelcomeScreen } from './components/Welcome/WelcomeScreen';
import { DashboardView } from './components/Dashboard/DashboardView';
import { ExerciseLibraryView } from './components/ExerciseLibrary/ExerciseLibraryView';
import { AICoachView } from './components/AICoach/AICoachView';
import { ProfileView } from './components/Profile/ProfileView';
import { OnboardingFlow } from './components/Onboarding/OnboardingFlow';
import { AgenticAssessmentModal } from './components/Onboarding/AgenticAssessmentModal';
import { GymPreWorkoutModal } from './components/LiveWorkoutPlayer/GymPreWorkoutModal';
import { LiveWorkoutModal } from './components/LiveWorkoutPlayer/LiveWorkoutModal';
import { AccountModal } from './components/Account/AccountModal';
import { FirebaseConfigModal } from './components/Account/FirebaseConfigModal';
import { GuidedTestModal, TestDefinitionId, TEST_DEFINITIONS } from './components/Dashboard/GuidedTestModal';
import { ErrorAlertBanner, AppError } from './components/Common/ErrorAlertBanner';
import { X, Check, ArrowLeft, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("Erreur critique capturée par ErrorBoundary:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 flex flex-col justify-center items-center text-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-400 font-bold flex items-center justify-center mb-4 text-lg">
            !
          </div>
          <h2 className="text-base font-bold mb-2">Erreur d'affichage interceptée</h2>
          <p className="text-xs text-rose-300 bg-rose-950/40 p-3 rounded-xl border border-rose-900/60 mb-5 font-mono text-left max-h-32 overflow-y-auto">
            {this.state.error?.message || "Erreur de rendu inattendue."}
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('aura_profile');
              localStorage.removeItem('aura_schedule');
              window.location.reload();
            }}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl transition"
          >
            Réinitialiser les données et recharger
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const App: React.FC = () => {
  // Navigation State with history persisted across restarts
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    try {
      const saved = localStorage.getItem('aura_active_tab');
      if (saved && ['dashboard', 'workout', 'library', 'ai', 'profile'].includes(saved)) {
        return saved as ActiveTab;
      }
    } catch {}
    return 'dashboard';
  });

  const [tabHistory, setTabHistory] = useState<ActiveTab[]>(() => {
    try {
      const saved = localStorage.getItem('aura_tab_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Screen state when not fully onboarded: 'welcome' | 'onboarding'
  const [authScreen, setAuthScreen] = useState<'welcome' | 'onboarding'>('welcome');

  // Global Error Banner State
  const [currentError, setCurrentError] = useState<AppError | null>(null);

  // Auth Success Notification Toast
  const [authSuccessToast, setAuthSuccessToast] = useState<{
    message: string;
    photoURL?: string | null;
    displayName?: string | null;
  } | null>(null);

  // Modals State persisted
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [isFirebaseConfigOpen, setIsFirebaseConfigOpen] = useState<boolean>(false);
  const [activeTestModal, setActiveTestModal] = useState<TestDefinitionId | null>(() => {
    try {
      const saved = localStorage.getItem('aura_active_test_modal');
      return saved ? (saved as TestDefinitionId) : null;
    } catch {
      return null;
    }
  });
  const [isGymModalDirectOpen, setIsGymModalDirectOpen] = useState<boolean>(false);
  const [isAgenticAssessmentOpen, setIsAgenticAssessmentOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem('aura_agentic_assessment_open') === 'true';
    } catch {
      return false;
    }
  });

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
        weightKg: profile?.weightKg,
        sleepHours: 0,
        waterLiters: 0,
        targetWaterLiters: 2.5,
        proteinAdequate: false,
        wholeFoodsAdequate: false,
        stretchingDone: false
      };
    } catch {
      return {
        date: new Date().toISOString().split('T')[0],
        weightKg: undefined,
        sleepHours: 0,
        waterLiters: 0,
        targetWaterLiters: 2.5,
        proteinAdequate: false,
        wholeFoodsAdequate: false,
        stretchingDone: false
      };
    }
  });

  // Live Workout Session Modals persisted
  const [pendingSessionToStart, setPendingSessionToStart] = useState<PlannedWorkoutSession | null>(null);
  const [activeWorkoutSession, setActiveWorkoutSession] = useState<{
    session: PlannedWorkoutSession;
    gym: GymLocation;
  } | null>(() => {
    try {
      const saved = localStorage.getItem('aura_active_workout_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('aura_active_tab', activeTab);
    } catch {}
  }, [activeTab]);

  useEffect(() => {
    try {
      localStorage.setItem('aura_tab_history', JSON.stringify(tabHistory));
    } catch {}
  }, [tabHistory]);

  useEffect(() => {
    try {
      if (activeTestModal) {
        localStorage.setItem('aura_active_test_modal', activeTestModal);
      } else {
        localStorage.removeItem('aura_active_test_modal');
      }
    } catch {}
  }, [activeTestModal]);

  useEffect(() => {
    try {
      if (isAgenticAssessmentOpen) {
        localStorage.setItem('aura_agentic_assessment_open', 'true');
      } else {
        localStorage.removeItem('aura_agentic_assessment_open');
      }
    } catch {}
  }, [isAgenticAssessmentOpen]);

  useEffect(() => {
    try {
      if (activeWorkoutSession) {
        localStorage.setItem('aura_active_workout_session', JSON.stringify(activeWorkoutSession));
      } else {
        localStorage.removeItem('aura_active_workout_session');
      }
    } catch {}
  }, [activeWorkoutSession]);

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

  // Clean Reset for a Fresh Healthy Base ("Base saine")
  useEffect(() => {
    const CLEAN_SLATE_KEY = 'aura_clean_slate_base_saine_v1';
    if (!localStorage.getItem(CLEAN_SLATE_KEY)) {
      localStorage.removeItem('aura_profile');
      localStorage.removeItem('aura_schedule');
      localStorage.removeItem('aura_daily_habits');
      localStorage.removeItem('aura_agentic_messages');
      localStorage.removeItem('aura_agentic_dossier');
      localStorage.removeItem('aura_completed_logs');
      localStorage.removeItem('aura_active_test_modal');
      localStorage.removeItem('aura_active_workout_session');
      localStorage.removeItem('aura_agentic_assessment_open');
      localStorage.setItem(CLEAN_SLATE_KEY, 'true');
      setProfile(null);
      setSchedule([]);
      setCompletedLogs([]);
      setDailyHabits({
        date: new Date().toISOString().split('T')[0],
        weightKg: undefined,
        sleepHours: 0,
        waterLiters: 0,
        targetWaterLiters: 2.5,
        proteinAdequate: false,
        wholeFoodsAdequate: false,
        stretchingDone: false
      });
    }
  }, []);

  // Subscribe to Firebase Auth State changes (persists login across refreshes)
  useEffect(() => {
    // 1. Process redirect result if page was reloaded by Google OAuth redirect
    checkRedirectResult().then((user) => {
      if (user) {
        handleGoogleSignInSuccess({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        });
      }
    }).catch((err) => {
      console.error("Redirect auth error:", err);
      setCurrentError({
        id: 'err-redirect-' + Date.now(),
        title: 'Erreur retour Google',
        message: err.message || 'Échec de retour d authentification Google.',
        code: err.code || 'REDIRECT_AUTH_ERROR'
      });
    });

    // 2. Listen to active auth session
    const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
      if (firebaseUser) {
        const googleUser: GoogleAuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        };
        setProfile((prev) => {
          if (!prev) {
            const initial: UserProfile = {
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
              onboardingCompleted: true
            };
            return initial;
          }
          return {
            ...prev,
            isGoogleAuthenticated: true,
            googleUser,
            name: (!prev.name || prev.name === 'Athlète') ? (googleUser.displayName || prev.name) : prev.name
          };
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Google Sign In Success Handler
  const handleGoogleSignInSuccess = (googleUser: GoogleAuthUser) => {
    sounds.playRecordBeaten();
    const existing = profile;
    const isAlreadyOnboarded = !!existing?.onboardingCompleted;

    const initialProfile: UserProfile = {
      id: googleUser.uid,
      name: googleUser.displayName || existing?.name || 'Athlète',
      age: existing?.age,
      gender: existing?.gender,
      heightCm: existing?.heightCm,
      weightKg: existing?.weightKg,
      injuries: existing?.injuries || [],
      activityLevel: existing?.activityLevel,
      weeklyAvailabilityDays: existing?.weeklyAvailabilityDays,
      preferredSessionDurationMinutes: existing?.preferredSessionDurationMinutes || 60,
      primaryGoal: existing?.primaryGoal,
      secondaryGoals: existing?.secondaryGoals || [],
      baselineTests: existing?.baselineTests || [],
      gyms: existing?.gyms || DEFAULT_GYMS,
      isGoogleAuthenticated: true,
      googleUser,
      onboardingCompleted: isAlreadyOnboarded
    };

    setProfile(initialProfile);

    setAuthSuccessToast({
      message: `Compte Google connecté : ${googleUser.displayName || googleUser.email}`,
      photoURL: googleUser.photoURL,
      displayName: googleUser.displayName
    });

    if (isAlreadyOnboarded) {
      if (!schedule || schedule.length === 0) {
        setSchedule(generateDefaultSchedule(initialProfile));
      }
      setActiveTab('dashboard');
    } else {
      // Guide the user directly to the agentic conversational questionnaire
      setIsAgenticAssessmentOpen(true);
      setActiveTab('dashboard');
    }
  };

  // Agentic Assessment Completion Handler
  const handleSaveAgenticAssessment = (updatedProfile: UserProfile) => {
    let baselineTestsUpdated = updatedProfile.baselineTests || profile?.baselineTests || [];

    if (updatedProfile.athleticDossier?.baselineTrackingMetrics) {
      const bMetrics = updatedProfile.athleticDossier.baselineTrackingMetrics;
      if (bMetrics.initialWeightKg) {
        setDailyHabits((prev) => ({
          ...prev,
          weightKg: bMetrics.initialWeightKg
        }));
      }
      if (bMetrics.initialBenchmarkValue && bMetrics.initialBenchmarkMetricName) {
        const initialBenchmark: PhysicalTestMetric = {
          id: 'test-upper',
          name: bMetrics.initialBenchmarkMetricName,
          category: 'strength',
          unit: bMetrics.initialBenchmarkUnit || 'reps',
          value: bMetrics.initialBenchmarkValue,
          date: new Date().toISOString(),
          instructions: 'Initialisé lors du bilan agentique de cadrage'
        };
        baselineTestsUpdated = [
          ...baselineTestsUpdated.filter((t) => t.id !== 'test-upper'),
          initialBenchmark
        ];
      }
    }

    const mergedProfile: UserProfile = {
      ...updatedProfile,
      baselineTests: baselineTestsUpdated,
      id: profile?.id || updatedProfile.id || 'athlete-user',
      name: profile?.name || updatedProfile.name || 'Athlète',
      isGoogleAuthenticated: !!profile?.isGoogleAuthenticated,
      googleUser: profile?.googleUser || null,
      onboardingCompleted: true
    };
    const generatedSchedule = generateDefaultSchedule(mergedProfile);
    setProfile(mergedProfile);
    setSchedule(generatedSchedule);
    try {
      localStorage.setItem('aura_profile', JSON.stringify(mergedProfile));
      localStorage.setItem('aura_schedule', JSON.stringify(generatedSchedule));
    } catch {
      // LocalStorage fallback
    }
    setAuthSuccessToast({
      message: `Profil & objectifs validés : ${mergedProfile.age ? `${mergedProfile.age} ans` : ''} ${mergedProfile.weightKg ? `• ${mergedProfile.weightKg} kg` : ''} ${mergedProfile.primaryGoal ? `• ${mergedProfile.primaryGoal}` : ''}`.trim(),
      displayName: mergedProfile.name
    });
    setIsAgenticAssessmentOpen(false);
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
  const handleConfirmStartWithGym = (selectedGym: GymLocation, adaptedSession?: PlannedWorkoutSession) => {
    setPendingSessionToStart(null);
    if (adaptedSession) {
      setActiveWorkoutSession({
        session: adaptedSession,
        gym: selectedGym
      });
    }
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

  // Navigation Handlers with Back/Home history
  const navigateToTab = (newTab: ActiveTab) => {
    if (newTab !== activeTab) {
      setTabHistory((prev) => [...prev, activeTab]);
      setActiveTab(newTab);
    }
  };

  const handleGoBack = () => {
    if (activeTestModal) {
      setActiveTestModal(null);
      return;
    }
    if (authScreen === 'onboarding') {
      setAuthScreen('welcome');
      return;
    }
    if (tabHistory.length > 0) {
      const prev = tabHistory[tabHistory.length - 1];
      setTabHistory((old) => old.slice(0, -1));
      setActiveTab(prev);
    } else if (activeTab !== 'dashboard') {
      setActiveTab('dashboard');
    }
  };

  const handleGoHome = () => {
    if (authScreen === 'onboarding') {
      setAuthScreen('welcome');
    }
    setActiveTab('dashboard');
    setTabHistory([]);
  };

  const canGoBack = (authScreen === 'onboarding') || (activeTab !== 'dashboard') || (tabHistory.length > 0);

  // Save Baseline Physical Test result and immediately unlock corresponding categories
  const handleSaveTestResult = (
    testId: TestDefinitionId,
    score: number,
    levelName: string
  ) => {
    const currentProfile = profile || activeOrGuestProfile;
    const existingTests = currentProfile.baselineTests || [];
    const otherTests = existingTests.filter((t) => t.id !== testId);
    const testDef = TEST_DEFINITIONS[testId] || TEST_DEFINITIONS['test-upper'];

    const updatedTests: PhysicalTestMetric[] = [
      ...otherTests,
      {
        id: testId,
        name: testDef.title,
        category: (testDef.category === 'cardio' ? 'cardio' : 'strength') as any,
        unit: testDef.unit,
        value: score,
        date: new Date().toISOString(),
        instructions: levelName
      }
    ];

    const updatedProfile: UserProfile = {
      ...currentProfile,
      baselineTests: updatedTests
    };

    setProfile(updatedProfile);
    try {
      localStorage.setItem('aura_profile', JSON.stringify(updatedProfile));
    } catch {
      // Ignored
    }

    try {
      sounds.playRecordBeaten();
    } catch {
      // Audio optional
    }

    setAuthSuccessToast({
      message: `Test validé : ${score} ${testDef.unit} (${levelName}) ! Séances correspondantes débloquées.`,
      photoURL: currentProfile.googleUser?.photoURL,
      displayName: currentProfile.name
    });
    setActiveTestModal(null);
  };

  const activeOrGuestProfile: UserProfile = profile || {
    id: 'guest',
    name: 'Athlète',
    age: undefined,
    gender: undefined,
    heightCm: undefined,
    weightKg: undefined,
    injuries: [],
    activityLevel: undefined,
    weeklyAvailabilityDays: undefined,
    preferredSessionDurationMinutes: 60,
    primaryGoal: undefined,
    secondaryGoals: [],
    baselineTests: [],
    gyms: DEFAULT_GYMS,
    isGoogleAuthenticated: false,
    googleUser: null,
    onboardingCompleted: false
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Explicit Global Error Banner */}
      <ErrorAlertBanner
        error={currentError}
        onDismiss={() => setCurrentError(null)}
      />

      {/* Auth Success Notification Toast */}
      {authSuccessToast && (
        <div className="sticky top-2 z-50 mx-4 mb-2 p-3 bg-zinc-900 border border-emerald-500/60 rounded-xl shadow-xl flex items-center justify-between animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2.5 min-w-0">
            {authSuccessToast.photoURL ? (
              <img
                src={authSuccessToast.photoURL}
                alt=""
                className="w-7 h-7 rounded-full border border-emerald-500 shrink-0 object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-zinc-950 font-bold text-xs flex items-center justify-center shrink-0">
                {authSuccessToast.displayName?.charAt(0) || 'G'}
              </div>
            )}
            <div className="min-w-0">
              <span className="text-xs font-semibold text-zinc-100 block truncate">
                {authSuccessToast.message}
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">
                Compte Google actif & synchronisé
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsAccountModalOpen(true)}
              className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-[11px] rounded-lg transition"
            >
              Gérer
            </button>
            <button
              onClick={() => setAuthSuccessToast(null)}
              className="p-1 text-zinc-400 hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Top Nav Bar - ALWAYS DISPLAYED */}
      <header className="sticky top-0 z-30 bg-zinc-950/90 border-b border-zinc-800/80 backdrop-blur-md px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Back Button (Page précédente) */}
          {canGoBack && (
            <button
              onClick={handleGoBack}
              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:border-zinc-700 transition flex items-center gap-1 text-xs"
              title="Page précédente"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-[11px] font-mono hidden sm:inline">Retour</span>
            </button>
          )}

          {/* Logo & Brand (Clicking returns Home / Dashboard) */}
          <button
            onClick={handleGoHome}
            className="flex items-center gap-2 group text-left"
            title="Retour à l'accueil"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-500 text-zinc-950 font-black font-mono flex items-center justify-center text-xs tracking-tighter group-hover:bg-emerald-400 transition">
              A
            </div>
            <span className="font-bold tracking-tight text-sm text-zinc-100 group-hover:text-emerald-300 transition">
              AURA
            </span>
          </button>

          {/* Home Icon button (Direct return to Home) */}
          {activeTab !== 'dashboard' && profile?.onboardingCompleted && (
            <button
              onClick={handleGoHome}
              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-emerald-400 hover:border-emerald-800 transition"
              title="Retour à l'accueil"
            >
              <Home className="w-3.5 h-3.5" />
            </button>
          )}

          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500">
            v1.0
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {profile?.onboardingCompleted && (
            <button
              onClick={() => handleRequestStartSession()}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold rounded-lg transition shadow-sm"
            >
              Séance
            </button>
          )}

          {/* User Photo Avatar / Account Menu Trigger */}
          <button
            onClick={() => setIsAccountModalOpen(true)}
            className="w-8 h-8 rounded-full border-2 border-zinc-700 hover:border-emerald-500 overflow-hidden transition flex items-center justify-center bg-zinc-900 relative"
            title="Gérer mon compte"
          >
            {activeOrGuestProfile.googleUser?.photoURL ? (
              <img
                src={activeOrGuestProfile.googleUser.photoURL}
                alt={activeOrGuestProfile.googleUser.displayName || 'Photo Google'}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs font-mono font-bold text-zinc-300">
                {activeOrGuestProfile.name.charAt(0).toUpperCase()}
              </span>
            )}
            {activeOrGuestProfile.isGoogleAuthenticated && (
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-zinc-950" />
            )}
          </button>
        </div>
      </header>

      {/* Screen Body */}
      {(!profile || !profile.onboardingCompleted) ? (
        authScreen === 'welcome' ? (
          <WelcomeScreen
            onStartOnboarding={() => setIsAgenticAssessmentOpen(true)}
            onGoogleSignInSuccess={handleGoogleSignInSuccess}
            onError={(err) => setCurrentError({ id: 'err-' + Date.now(), ...err })}
            onOpenFirebaseConfig={() => setIsFirebaseConfigOpen(true)}
            profile={profile}
            onOpenAccountModal={() => setIsAccountModalOpen(true)}
            onEnterApp={() => {
              const baseProfile = profile || activeOrGuestProfile;
              const completed: UserProfile = {
                ...baseProfile,
                onboardingCompleted: true
              };
              setProfile(completed);
              const activeSchedule = (schedule && schedule.length > 0)
                ? schedule
                : generateDefaultSchedule(completed);
              setSchedule(activeSchedule);
              setActiveTab('dashboard');
            }}
          />
        ) : (
          <div className="flex-1 flex flex-col justify-center">
            <OnboardingFlow onComplete={handleOnboardingComplete} />
          </div>
        )
      ) : (
        /* Main Application Tabs */
        <main className="flex-1 max-w-lg mx-auto w-full px-4 pt-4">
        {activeTab === 'dashboard' && (
          <DashboardView
            profile={profile || activeOrGuestProfile}
            schedule={(schedule && schedule.length > 0) ? schedule : generateDefaultSchedule(profile || activeOrGuestProfile)}
            completedLogs={completedLogs}
            dailyHabits={dailyHabits}
            onUpdateHabits={setDailyHabits}
            onStartSession={(s) => handleRequestStartSession(s)}
            onOpenAICoach={() => navigateToTab('ai')}
            onOpenGuidedTest={(testId) => setActiveTestModal(testId)}
            onOpenGymConfig={() => setIsGymModalDirectOpen(true)}
            onOpenAgenticAssessment={() => setIsAgenticAssessmentOpen(true)}
            onReconfigureProfile={() => setIsAgenticAssessmentOpen(true)}
          />
        )}

        {activeTab === 'workout' && (
          <div className="space-y-4 pb-20">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-zinc-100">Séances & Programmation</h1>
                <p className="text-xs text-zinc-500">
                  Planning hebdomadaire calibré sur votre objectif ({(profile || activeOrGuestProfile).primaryGoal})
                </p>
              </div>
              <button
                onClick={handleGoHome}
                className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition text-xs flex items-center gap-1 font-mono"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Accueil</span>
              </button>
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

        {activeTab === 'library' && (
          <ExerciseLibraryView
            profile={profile || activeOrGuestProfile}
            onBack={handleGoBack}
            onOpenTest={(testId) => setActiveTestModal(testId as TestDefinitionId)}
          />
        )}

        {activeTab === 'ai' && (
          <AICoachView
            profile={profile || activeOrGuestProfile}
            schedule={(schedule && schedule.length > 0) ? schedule : generateDefaultSchedule(profile || activeOrGuestProfile)}
            onApplyAction={handleApplyActionProposal}
            onUpdateProfile={setProfile}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            profile={profile || activeOrGuestProfile}
            onUpdateProfile={setProfile}
            onResetOnboarding={() => {
              localStorage.removeItem('aura_profile');
              setProfile(null);
              setAuthScreen('welcome');
            }}
          />
        )}
      </main>
    )}

      {/* Account Management Modal */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        profile={activeOrGuestProfile}
        onUpdateProfile={setProfile}
        onLogout={() => {
          if (profile) {
            setProfile({
              ...profile,
              isGoogleAuthenticated: false,
              googleUser: null
            });
          }
          setAuthSuccessToast(null);
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

      {/* Guided Athletic Test Studio Modal */}
      {activeTestModal && (
        <GuidedTestModal
          testId={activeTestModal}
          profile={profile || activeOrGuestProfile}
          isOpen={true}
          onClose={() => setActiveTestModal(null)}
          onSaveTestResult={handleSaveTestResult}
        />
      )}

      {/* Direct Gym Configuration Modal */}
      {isGymModalDirectOpen && (
        <GymPreWorkoutModal
          gyms={profile?.gyms || DEFAULT_GYMS}
          isOpen={true}
          onClose={() => setIsGymModalDirectOpen(false)}
          onConfirmStart={() => setIsGymModalDirectOpen(false)}
          onAddNewGym={(newGym) => {
            if (profile) {
              setProfile({
                ...profile,
                gyms: [...profile.gyms, newGym]
              });
            }
          }}
        />
      )}

      {/* Pre-Workout Gym Selector Modal */}
      {pendingSessionToStart && (
        <GymPreWorkoutModal
          gyms={profile?.gyms || DEFAULT_GYMS}
          session={pendingSessionToStart}
          isOpen={true}
          onClose={() => setPendingSessionToStart(null)}
          onConfirmStart={handleConfirmStartWithGym}
          onAddNewGym={(newGym) => {
            if (profile) {
              setProfile({
                ...profile,
                gyms: [...profile.gyms, newGym]
              });
            }
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

      {/* Agentic Conversational Assessment Modal */}
      {isAgenticAssessmentOpen && (
        <AgenticAssessmentModal
          isOpen={isAgenticAssessmentOpen}
          onClose={() => setIsAgenticAssessmentOpen(false)}
          currentProfile={profile || activeOrGuestProfile}
          onSaveAssessment={handleSaveAgenticAssessment}
        />
      )}

      {/* Bottom Mobile Navigation */}
      {profile?.onboardingCompleted && (
        <Navigation
          activeTab={activeTab}
          onTabChange={navigateToTab}
          isWorkoutActive={!!activeWorkoutSession}
        />
      )}
    </div>
  );
};

export default App;
