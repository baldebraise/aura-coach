export type MuscleGroup = 
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'quadriceps'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'abs'
  | 'cardio'
  | 'mobility';

export type EquipmentType = 
  | 'bodyweight'
  | 'dumbbells'
  | 'barbell'
  | 'pullup_bar'
  | 'resistance_bands'
  | 'cable_machine'
  | 'leg_press'
  | 'lat_pulldown'
  | 'smith_machine'
  | 'kettlebell'
  | 'bench'
  | 'cardio_machine';

export interface Exercise {
  id: string;
  name: string;
  category: 'strength' | 'cardio' | 'mobility' | 'isometric';
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  requiredEquipment: EquipmentType[];
  alternativeExerciseIds: string[];
  setupCues: string[];
  executionCues: string[];
  breathingCues: string;
  commonMistakes: string[];
  svgDiagramId: string;
  defaultRestSeconds: number;
}

export interface GymLocation {
  id: string;
  name: string;
  isDefault?: boolean;
  equipment: EquipmentType[];
  notes?: string;
}

export interface PhysicalTestMetric {
  id: string;
  name: string;
  category: 'strength' | 'cardio' | 'mobility';
  unit: string;
  value?: number;
  date?: string;
  target?: number;
  instructions: string;
  timerSeconds?: number;
}

export interface GoogleAuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface UserProfile {
  id: string;
  name: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  heightCm?: number;
  weightKg?: number;
  bodyFatPercentage?: number;
  injuries: string[];
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'very_active';
  weeklyAvailabilityDays?: number;
  preferredSessionDurationMinutes?: number;
  primaryGoal?: 'recomposition' | 'muscle_gain' | 'strength' | 'endurance' | 'mobility_health';
  secondaryGoals: string[];
  baselineTests: PhysicalTestMetric[];
  gyms: GymLocation[];
  geminiApiKey?: string;
  isGoogleAuthenticated: boolean;
  googleUser?: GoogleAuthUser | null;
  onboardingCompleted: boolean;
  assessmentRawText?: string;
}

export interface PlannedExercise {
  exerciseId: string;
  targetSets: number;
  targetReps: string; // e.g. "8-10" or "45s"
  targetRpe?: number;
  targetWeightKg?: number;
  restSeconds: number;
  notes?: string;
}

export interface PlannedWorkoutSession {
  id: string;
  title: string;
  focusMuscles: MuscleGroup[];
  estimatedDurationMinutes: number;
  warmup: string[];
  exercises: PlannedExercise[];
  cooldown: string[];
}

export interface WeeklyScheduleItem {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  dayName: string;
  session?: PlannedWorkoutSession;
  isRestDay: boolean;
}

export interface WorkoutSetLog {
  setNumber: number;
  repsCompleted: number;
  weightKg: number;
  rpe?: number;
  isCompleted: boolean;
}

export interface ExerciseSessionLog {
  exerciseId: string;
  exerciseName: string;
  sets: WorkoutSetLog[];
  personalRecordBeaten?: boolean;
}

export interface CompletedWorkoutLog {
  id: string;
  date: string;
  gymId: string;
  gymName: string;
  sessionTitle: string;
  durationMinutes: number;
  totalVolumeKg: number;
  exercises: ExerciseSessionLog[];
  personalRecordsBeatenCount: number;
  notes?: string;
}

export interface MacroTarget {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  waterLiters: number;
  isWorkoutDay: boolean;
  bmr: number;
  tdee: number;
  goalDeltaCalories: number;
}

export interface NutritionMealsState {
  breakfast: boolean;
  lunch: boolean;
  snackOrPeri: boolean;
  dinner: boolean;
}

export interface DailyHabits {
  date: string; // YYYY-MM-DD
  weightKg?: number;
  sleepHours?: number;
  waterLiters: number;
  targetWaterLiters: number;
  proteinAdequate: boolean;
  wholeFoodsAdequate: boolean;
  stretchingDone: boolean;
  proteinGramsConsumed?: number;
  mealsCompleted?: NutritionMealsState;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  actionProposal?: {
    id: string;
    type: 'replace_exercise' | 'reschedule_session' | 'adjust_volume' | 'add_rest_day';
    title: string;
    description: string;
    details: any;
    applied?: boolean;
  };
}
