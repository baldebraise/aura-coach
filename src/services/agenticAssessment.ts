import { 
  UserProfile, 
  AgenticAthleticDossier, 
  RecommendedTestPlan,
  TrainingPlanOption,
  PlannedSessionDraft
} from '../types';
import { initializeFirebaseApp } from './firebase';
import { getAI, getGenerativeModel } from 'firebase/ai';

export interface AgenticTurnResult {
  assistantReply: string;
  dossier: AgenticAthleticDossier;
}

// Active Gemini key resolution - strictly user configured, NO silent fake key
export function getActiveGeminiApiKey(profile?: UserProfile): string {
  const fromProfile = profile?.geminiApiKey;
  const fromStorage = typeof window !== 'undefined' 
    ? (localStorage.getItem('aura_gemini_api_key') || localStorage.getItem('gemini_api_key')) 
    : null;
  if (fromProfile && fromProfile.trim()) return fromProfile.trim();
  if (fromStorage && fromStorage.trim()) return fromStorage.trim();
  return '';
}

// Direct Google Gemini API caller (Google AI Studio REST API)
async function callGoogleGeminiDirect(
  apiKey: string,
  prompt: string
): Promise<AgenticTurnResult> {
  const models = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-2.5-flash'];
  let lastErrorDetail = '';

  for (const model of models) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 22000);
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey.trim()
          },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              responseMimeType: 'application/json'
            }
          })
        }
      );
      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const errorMsg = errorData?.error?.message || `HTTP ${res.status} (${res.statusText})`;
        lastErrorDetail = `[Modèle ${model} - Statut ${res.status}] : ${errorMsg}`;
        // If it's an auth error (400, 401, 403), do not retry all models needlessly
        if (res.status === 400 || res.status === 401 || res.status === 403) {
          throw new Error(lastErrorDetail);
        }
        continue;
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error(`Réponse vide reçue du modèle ${model}.`);
      }

      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed && parsed.assistantReply && parsed.dossier) {
        return {
          assistantReply: parsed.assistantReply,
          dossier: parsed.dossier
        };
      } else {
        throw new Error(`Format JSON incomplet retourné par ${model}.`);
      }
    } catch (e: any) {
      if (e?.message?.includes('Statut 401') || e?.message?.includes('Statut 400') || e?.message?.includes('Statut 403')) {
        throw e;
      }
      lastErrorDetail = e?.message || String(e);
    }
  }

  throw new Error(`Échec de connexion à l'API Gemini : ${lastErrorDetail || 'Tous les modèles testés ont échoué.'}`);
}

export async function runAgenticSportsScientistTurn(
  dialogueHistory: Array<{ role: 'user' | 'assistant'; text: string }>,
  currentProfile: UserProfile,
  previousDossier?: AgenticAthleticDossier
): Promise<AgenticTurnResult> {
  const directApiKey = getActiveGeminiApiKey(currentProfile);

  if (!directApiKey || !directApiKey.trim()) {
    throw new Error(
      "AUCUNE_CLE_FOURNIE : Aucune clé API Google Gemini n'est configurée. " +
      "Veuillez renseigner une clé Google AI Studio (commençant par AIzaSy...) pour activer le Directeur Scientifique AURA."
    );
  }

  const fullConversationText = dialogueHistory
    .map((m) => `${m.role === 'user' ? 'Athlète' : 'Coach AURA'}: ${m.text}`)
    .join('\n\n');

  const userTurns = dialogueHistory.filter((m) => m.role === 'user').length;
  const isFinishingRequested = dialogueHistory.some(m => m.role === 'user' && /(?:fini|terminer|valid|prêt|c'est bon|générer|tout dit)/i.test(m.text));

  const prompt = `Tu es le Directeur Scientifique et Entraîneur de Performance d'élite de l'application AURA.
Tu échanges en direct avec un athlète pour son bilan athlétique initial approfondi.

RÈGLES CAPITALES :
1. ANALYSE APPROFONDIE & PÉDAGOGIQUE : Fournis une réflexion approfondie, riche et structurée (2 à 3 paragraphes complets) en sciences du sport sur tout ce que l'athlète a exprimé jusqu'ici :
   - Analyse biomécanique et physiologique détaillée de ses objectifs (tension mécanique, adaptation motrice, balance énergétique, préservation de masse contractile).
   - Stratégie concrète d'entraînement pour les atteindre (volumes de travail ciblés, RIR 1-2, surcharge progressive, tempo d'exécution).
   - Intégration de son mode de vie et de son métier (impact de la posture assise/bureau ou de la fatigue d'un métier debout, optimisation du sommeil et de la récupération).
   - Prise en compte immédiate de ses articulations sensibles ou antécédents de blessures (substitutions biomécaniques sûres).
2. UNE SEULE QUESTION À LA FOIS : Termine toujours ta réponse par EXACTEMENT UNE SEULE question ciblée pour continuer à explorer méthodiquement son profil :
   - Étape 1 : Objectifs et priorités physiques/musculaires.
   - Étape 2 : Passé sportif et niveau d'expérience actuel (débutant, reprise, régulier).
   - Étape 3 : Métier quotidien (sédentaire vs physique), niveau de fatigue et sommeil.
   - Étape 4 : Disponibilités réelles (nombre de séances/semaine) et lieu/matériel (salle, maison, extérieur).
   - Étape 5 : Gênes articulaires à préserver et gabarit approximatif (âge, taille, poids).
3. NE PROPOSE LA VALIDATION SEULEMENT QUAND C'EST FINI :
   - "isReadyForValidation" DOIT ÊTRE false tant que l'ensemble des dimensions n'est pas exploré (${userTurns < 4 && !isFinishingRequested ? 'actuellement ' + userTurns + ' échanges seulement' : 'sauf si l\'athlète a déjà tout expliqué ou qu\'au moins 4-5 échanges ont eu lieu'}).
   - Quand "isReadyForValidation" est false : ton "assistantReply" offre cette réflexion approfondie puis pose la prochaine question ciblée.
   - Quand "isReadyForValidation" est true : ton "assistantReply" annonce chaleureusement que le bilan est complet et présente son Dossier de Cadrage Athlétique détaillé.

Voici l'historique complet de la discussion :
${fullConversationText}

Tu dois impérativement répondre au format JSON strict suivant (sans balises de code ni texte autour) :
{
  "assistantReply": "Ta réflexion approfondie en sciences du sport (2-3 paragraphes experts, valorisants et concrets) + EXACTEMENT UNE SEULE QUESTION si isReadyForValidation est false, ou annonce du dossier si isReadyForValidation est true.",
  "dossier": {
    "physicalConditionSummary": "Synthèse biomécanique et morphologique de sa condition physique actuelle déduite de ses propos.",
    "recommendedTests": [
      {
        "id": "test-upper | test-lower | test-cardio | test-core",
        "name": "Nom du test",
        "targetMetric": "Variable exacte à mesurer (ex: Répétitions max strictes, Charge 1RM estimée en kg, VMA en km/h)",
        "rationale": "Pourquoi ce test est capital selon son profil et ses objectifs"
      }
    ],
    "shortTermGoals": "Objectifs opérationnels à 4-6 semaines (ex: consolidation posturale, apprentissage moteur, reprise du volume)",
    "longTermGoals": "Objectifs à 6-12 mois (ex: gain de 4kg de masse contractile, palier de force athlétique)",
    "expectedOutcomes": "Projections chiffrées et visuelles réalistes espérées",
    "trainingPlanDraft": {
      "splitName": "Nom de la répartition recommandée (ex: Upper / Lower 4 jours)",
      "rationale": "Pourquoi ce split est idéal pour son emploi du temps et son niveau",
      "options": [
        {
          "title": "Option A - Recommandée",
          "splitType": "Upper / Lower",
          "frequencyDays": 4,
          "description": "Idéal pour maximiser la fréquence par groupe musculaire"
        },
        {
          "title": "Option B - Compacte",
          "splitType": "Full Body",
          "frequencyDays": 3,
          "description": "Si l'emploi du temps professionnel est imprévisible"
        }
      ],
      "sessions": [
        {
          "title": "Séance 1 - Haut du Corps Force",
          "focus": "Pectoraux, Dos, Épaules",
          "durationMin": 60,
          "exercisesPreview": ["Développé couché", "Tractions pronation", "Développé militaire"]
        },
        {
          "title": "Séance 2 - Bas du Corps & Chaîne Postérieure",
          "focus": "Quadriceps, Ischios, Fessiers",
          "durationMin": 60,
          "exercisesPreview": ["Squat gobelet", "Soulevé de terre roumain", "Fentes marchées"]
        }
      ]
    },
    "nutritionLifestyleDraft": {
      "dailyCaloriesTarget": 2400,
      "proteinGramsTarget": 150,
      "waterLitersTarget": 2.8,
      "nutritionStrategy": "Stratégie alimentaire (ex: Léger surplus anabolique de 250 kcal, 2.0g/kg protéines)",
      "lifestylePillars": [
        "Sommeil : 7h30 minimum pour la synthèse protéique",
        "Hydratation : 500ml au réveil + 750ml pendant l'effort"
      ]
    },
    "missingDataAndReserves": [
      {
        "missingPoint": "Élément manquant (ex: Force relative au développé couché)",
        "howToObtain": "À mesurer lors du test de poussée du haut du corps"
      }
    ],
    "baselineTrackingMetrics": {
      "initialWeightKg": 78,
      "initialHeightCm": 180,
      "initialAge": 28,
      "initialBenchmarkMetricName": "Pompes strictes au sol",
      "initialBenchmarkValue": 15,
      "initialBenchmarkUnit": "reps"
    },
    "confidenceScore": 85,
    "isReadyForValidation": ${userTurns >= 4 || isFinishingRequested ? 'true' : 'false'}
  }
}`;

  // Call Google Gemini directly - FAIL FAST if error
  return await callGoogleGeminiDirect(directApiKey.trim(), prompt);
}
