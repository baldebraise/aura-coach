import { UserProfile, PlannedWorkoutSession, WeeklyScheduleItem, AIChatMessage } from '../types';
import { EXERCISES_DATABASE } from '../data/exercises';
import { initializeFirebaseApp } from './firebase';
import { getAI, getGenerativeModel } from 'firebase/ai';
import { getActiveGeminiApiKey } from './agenticAssessment';

// Fallback high-performance generator when offline or before Gemini API key is configured
export function generateDefaultSchedule(profile: UserProfile): WeeklyScheduleItem[] {
  const daysCount = profile.weeklyAvailabilityDays || 3;

  // Session 1: Upper Body / Poussée & Tirage
  const sessionUpper: PlannedWorkoutSession = {
    id: 'session-upper',
    title: 'Haut du Corps (Force & Volume)',
    focusMuscles: ['chest', 'back', 'shoulders'],
    estimatedDurationMinutes: profile.preferredSessionDurationMinutes || 60,
    warmup: [
      'Rotations articulaires des épaules & coudes (2 min)',
      'Échauffement scapulaire contre le mur (2 séries)',
      '1 série légère de pompes ou tirage léger'
    ],
    exercises: [
      {
        exerciseId: 'bench-press-dumbbells',
        targetSets: 4,
        targetReps: '8-10',
        targetRpe: 8,
        targetWeightKg: 20,
        restSeconds: 90,
        notes: 'Contrôler la descente 2 secondes'
      },
      {
        exerciseId: 'pullups-pronated',
        targetSets: 4,
        targetReps: '6-8',
        targetRpe: 8,
        restSeconds: 90,
        notes: 'Menton au-dessus de la barre, bras tendus en bas'
      },
      {
        exerciseId: 'overhead-press-dumbbells',
        targetSets: 3,
        targetReps: '10-12',
        targetRpe: 8,
        targetWeightKg: 14,
        restSeconds: 75
      },
      {
        exerciseId: 'dumbbell-row',
        targetSets: 3,
        targetReps: '10-12',
        targetRpe: 8,
        targetWeightKg: 18,
        restSeconds: 75
      },
      {
        exerciseId: 'plank-isometric',
        targetSets: 3,
        targetReps: '45s',
        restSeconds: 60
      }
    ],
    cooldown: ['Étirement passif des pectoraux et dorsaux (3 min)']
  };

  // Session 2: Lower Body / Jambes & Fessiers
  const sessionLower: PlannedWorkoutSession = {
    id: 'session-lower',
    title: 'Bas du Corps & Chaîne Postérieure',
    focusMuscles: ['quadriceps', 'glutes', 'hamstrings'],
    estimatedDurationMinutes: profile.preferredSessionDurationMinutes || 60,
    warmup: [
      'Ouverture des hanches en fente basse (2 min)',
      'Balancements de jambes avant/arrière',
      '10 air squats au ralenti'
    ],
    exercises: [
      {
        exerciseId: 'goblet-squat-dumbbell',
        targetSets: 4,
        targetReps: '10-12',
        targetRpe: 8,
        targetWeightKg: 24,
        restSeconds: 90,
        notes: 'Buste droit, ouvrir les genoux'
      },
      {
        exerciseId: 'romanian-deadlift-dumbbells',
        targetSets: 4,
        targetReps: '10-12',
        targetRpe: 8,
        targetWeightKg: 20,
        restSeconds: 90,
        notes: 'Reculer les fessiers, dos plat'
      },
      {
        exerciseId: 'wall-sit-isometric',
        targetSets: 3,
        targetReps: '45s',
        restSeconds: 60
      },
      {
        exerciseId: 'bodyweight-squat',
        targetSets: 3,
        targetReps: '15',
        restSeconds: 60
      }
    ],
    cooldown: ['Étirement doux des fléchisseurs de hanche et ischios']
  };

  // Session 3: Full Body / Conditionnement Athlétique
  const sessionFullBody: PlannedWorkoutSession = {
    id: 'session-fullbody',
    title: 'Full Body & Puissance Métabolique',
    focusMuscles: ['chest', 'back', 'quadriceps', 'abs'],
    estimatedDurationMinutes: profile.preferredSessionDurationMinutes || 60,
    warmup: ['Mobilité globale du rachis et activation cardiaque (5 min)'],
    exercises: [
      {
        exerciseId: 'pushups-standard',
        targetSets: 4,
        targetReps: '12-15',
        targetRpe: 8,
        restSeconds: 60
      },
      {
        exerciseId: 'dumbbell-row',
        targetSets: 4,
        targetReps: '10',
        targetRpe: 8,
        targetWeightKg: 20,
        restSeconds: 75
      },
      {
        exerciseId: 'goblet-squat-dumbbell',
        targetSets: 3,
        targetReps: '12',
        targetRpe: 8,
        targetWeightKg: 20,
        restSeconds: 75
      },
      {
        exerciseId: 'lateral-raises-dumbbells',
        targetSets: 3,
        targetReps: '15',
        targetRpe: 8,
        targetWeightKg: 8,
        restSeconds: 60
      },
      {
        exerciseId: 'plank-isometric',
        targetSets: 3,
        targetReps: '60s',
        restSeconds: 60
      }
    ],
    cooldown: ['Respiration diaphragmatique et retour au calme']
  };

  const schedule: WeeklyScheduleItem[] = [
    { dayOfWeek: 1, dayName: 'Lundi', session: sessionUpper, isRestDay: false },
    { dayOfWeek: 2, dayName: 'Mardi', isRestDay: true },
    { dayOfWeek: 3, dayName: 'Mercredi', session: sessionLower, isRestDay: false },
    { dayOfWeek: 4, dayName: 'Jeudi', isRestDay: true },
    { dayOfWeek: 5, dayName: 'Vendredi', session: daysCount >= 3 ? sessionFullBody : undefined, isRestDay: daysCount < 3 },
    { dayOfWeek: 6, dayName: 'Samedi', isRestDay: true },
    { dayOfWeek: 0, dayName: 'Dimanche', isRestDay: true }
  ];

  return schedule;
}

export async function queryGeminiCoach(
  userPrompt: string,
  profile: UserProfile,
  activeSession?: PlannedWorkoutSession
): Promise<AIChatMessage> {
  const promptLower = userPrompt.toLowerCase();

  // 1. Direct Google Gemini API caller
  const apiKey = getActiveGeminiApiKey(profile);
  if (!apiKey || !apiKey.trim()) {
    return {
      id: 'msg-err-' + Date.now(),
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      text: "⚠️ [ERREUR IA : Clé absente] Aucune clé API Google Gemini n'est configurée. Veuillez renseigner votre clé Google AI Studio (commençant par AIzaSy...) dans les paramètres pour dialoguer avec le coach."
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 16000);
    const systemPrompt = `Tu es le conseiller scientifique et athlétique d'élite AURA. Réponds de façon concise, précise, encourageante, SANS AUCUN ÉMOJI. Profil athlète : ${profile.name || 'Athlète'}, ${profile.age || 28} ans, ${profile.weightKg || 75}kg, objectif: ${profile.primaryGoal || 'forme globale'}, blessures antérieures: ${profile.injuries && profile.injuries.length > 0 ? profile.injuries.join(', ') : 'aucune'}. Salles disponibles: ${profile.gyms ? profile.gyms.map(g => g.name).join(', ') : 'Maison'}. Question de l'athlète: ${userPrompt}`;
    
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }]
        })
      }
    );
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      const errorMsg = errorData?.error?.message || `HTTP ${res.status} (${res.statusText})`;
      return {
        id: 'msg-err-' + Date.now(),
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        text: `⚠️ [ERREUR API GEMINI ${res.status}] : ${errorMsg}. Vérifiez votre clé Google AI Studio dans les paramètres.`
      };
    }

    const data = await res.json();
    const answerText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (answerText && answerText.trim()) {
      return {
        id: 'msg-' + Date.now(),
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        text: answerText.trim()
      };
    } else {
      return {
        id: 'msg-err-' + Date.now(),
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        text: "⚠️ [ERREUR API GEMINI] Réponse vide reçue du modèle."
      };
    }
  } catch (err: any) {
    return {
      id: 'msg-err-' + Date.now(),
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      text: `⚠️ [ERREUR DE CONNEXION GEMINI] : ${err?.message || String(err)}`
    };
  }
}
