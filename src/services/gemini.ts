import { UserProfile, PlannedWorkoutSession, WeeklyScheduleItem, AIChatMessage } from '../types';
import { EXERCISES_DATABASE } from '../data/exercises';
import { initializeFirebaseApp } from './firebase';
import { getAI, getGenerativeModel } from 'firebase/ai';

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

  // 1. If user is connected via Google, call Gemini directly via Firebase AI Logic (zero manual API key entry)
  if (profile.isGoogleAuthenticated) {
    try {
      const { app } = initializeFirebaseApp();
      if (app) {
        const ai = getAI(app);
        const model = getGenerativeModel(ai, { model: 'gemini-2.5-flash' });
        const systemPrompt = `Tu es le conseiller scientifique et athlétique d'élite AURA. Réponds de façon concise, précise, encourageante, SANS AUCUN ÉMOJI. Profil athlète : ${profile.name}, ${profile.age} ans, ${profile.weightKg}kg, objectif: ${profile.primaryGoal}, blessures antérieures: ${profile.injuries.length > 0 ? profile.injuries.join(', ') : 'aucune'}. Salles disponibles: ${profile.gyms.map(g => g.name).join(', ')}. Question de l'athlète: ${userPrompt}`;

        const response = await model.generateContent(systemPrompt);
        const answerText = response?.response?.text();
        if (answerText && answerText.trim()) {
          let actionProposal: AIChatMessage['actionProposal'] = undefined;
          if (promptLower.includes('genou') || promptLower.includes('douleur')) {
            actionProposal = {
              id: 'prop-' + Date.now(),
              type: 'replace_exercise',
              title: 'Remplacer Fentes Marchées par Fentes Isométriques Arrière',
              description: 'Décharge le tendon rotulien tout en préservant le recrutement des fessiers.',
              details: { replaceFrom: 'walking-lunges-dumbbells', replaceTo: 'rear-lunge-isometric' }
            };
          } else if (promptLower.includes('30 min') || promptLower.includes('court') || promptLower.includes('presse')) {
            actionProposal = {
              id: 'prop-' + Date.now(),
              type: 'adjust_volume',
              title: 'Condenser la séance à 30 minutes',
              description: 'Conservation des 3 mouvements polyarticulaires majeurs avec 2 séries chacun.',
              details: { targetDuration: 30, maxSets: 2 }
            };
          }

          return {
            id: 'msg-' + Date.now(),
            sender: 'assistant',
            timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            text: answerText.trim(),
            actionProposal
          };
        }
      }
    } catch (err: any) {
      console.warn('Firebase AI Logic fallback to heuristic expert engine:', err.message);
    }
  }

  // 2. High-accuracy expert heuristic responses with action proposals
  if (promptLower.includes('genou') || promptLower.includes('douleur') || promptLower.includes('mal')) {
    return {
      id: 'msg-' + Date.now(),
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      text: 'Face à un signal douloureux, il est impératif d éviter la compression patellaire tout en maintenant l activation musculaire sans impact. Je vous propose de remplacer le squat par du soulevé de terre roumain (axé chaîne postérieure) et de la chaise isométrique contrôlée.',
      actionProposal: {
        id: 'prop-knee-sub',
        type: 'replace_exercise',
        title: 'Substitution Articulaire Sécurisée',
        description: 'Remplacement des squats par Soulevé de Terre Roumain (Ischios) et Chaise Isométrique.',
        details: { replaceFrom: 'goblet-squat-dumbbell', replaceTo: 'romanian-deadlift-dumbbells' }
      }
    };
  }

  if (promptLower.includes('30 min') || promptLower.includes('pressé') || promptLower.includes('court') || promptLower.includes('temps')) {
    return {
      id: 'msg-' + Date.now(),
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      text: 'Optimisation de la séance en format condensé : réduction du volume accessoire, conservation des deux mouvements polyarticulaires majeurs en superset antagoniste (repos réduit à 60s). Densité maximale en 30 minutes chrono.',
      actionProposal: {
        id: 'prop-time-compress',
        type: 'adjust_volume',
        title: 'Compresser la Séance en 30 min',
        description: 'Passe la séance à 3 exercices clés en 3 séries avec 60s de repos.',
        details: { targetDuration: 30, maxSets: 3 }
      }
    };
  }

  if (promptLower.includes('manger') || promptLower.includes('nutrition') || promptLower.includes('repas') || promptLower.includes('protéine')) {
    const proteinTarget = profile.weightKg ? `${(profile.weightKg * 1.8).toFixed(0)}g` : '1.8g / kg de poids de corps';
    const profileLabel = profile.weightKg ? ` (${profile.weightKg} kg)` : '';
    return {
      id: 'msg-' + Date.now(),
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      text: `Guide nutritionnel ciblé pour votre profil${profileLabel} :
1. Cible quotidienne : Visez ${proteinTarget} de protéines réparties en 3 ou 4 prises (environ 30-35g par repas).
2. Repas pré-entraînement (2h avant) : Glucides complexes à index glycémique modéré (riz, flocons d avoine, banane) + protéines digestes.
3. Post-entraînement : Réhydratation immédiate (500ml d eau minérale) + apport protéique pour stopper le catabolisme.
4. Aucun besoin de peser chaque aliment : respectez les repères visuels (1 paume de protéines, 1 poing de féculents, 2 poings de légumes).`
    };
  }

  return {
    id: 'msg-' + Date.now(),
    sender: 'assistant',
    timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    text: `Analyse de votre demande : votre programmation actuelle prend en compte vos objectifs (${profile.primaryGoal || 'forme globale'}) et vos disponibilités (${profile.weeklyAvailabilityDays || 3} séances/semaine). N'hésitez pas à me signaler un imprévu d'emploi du temps, une fatigue anormale ou un manque d'équipement pour que j'ajuste votre calendrier.`
  };
}
