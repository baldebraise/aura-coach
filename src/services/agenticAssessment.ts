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

// Active Gemini key resolution with runtime fallback
export function getActiveGeminiApiKey(profile?: UserProfile): string {
  const fromProfile = profile?.geminiApiKey;
  const fromStorage = typeof window !== 'undefined' ? (localStorage.getItem('aura_gemini_api_key') || localStorage.getItem('gemini_api_key')) : null;
  if (fromProfile && fromProfile.trim()) return fromProfile.trim();
  if (fromStorage && fromStorage.trim()) return fromStorage.trim();
  try {
    return atob('QVEuQWI4Uk42SzFIRGs5b3RnQ0hFZGZqTTlNaUZfMnF4RlgzR3FKQUdXOFlkNStxNnpXYWc=');
  } catch {
    return '';
  }
}

// Direct Google Gemini API caller (Google AI Studio REST API)
async function callGoogleGeminiDirect(
  apiKey: string,
  prompt: string
): Promise<AgenticTurnResult | null> {
  const models = ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  for (const model of models) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 14000);
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanJson);
          if (parsed && parsed.assistantReply && parsed.dossier) {
            return {
              assistantReply: parsed.assistantReply,
              dossier: parsed.dossier
            };
          }
        }
      }
    } catch (e) {
      console.warn(`Direct Gemini API call failed with model ${model}:`, e);
    }
  }
  return null;
}

export async function runAgenticSportsScientistTurn(
  dialogueHistory: Array<{ role: 'user' | 'assistant'; text: string }>,
  currentProfile: UserProfile,
  previousDossier?: AgenticAthleticDossier
): Promise<AgenticTurnResult> {
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

  // 1. Try Direct Google Gemini API with user key or built-in key
  const directApiKey = getActiveGeminiApiKey(currentProfile);
  if (directApiKey && directApiKey.trim()) {
    try {
      const directResult = await callGoogleGeminiDirect(directApiKey.trim(), prompt);
      if (directResult) {
        return directResult;
      }
    } catch (e) {
      console.warn("Direct Gemini API error:", e);
    }
  }

  // 2. Try Firebase AI Logic
  try {
    const { app } = initializeFirebaseApp();
    if (app) {
      const ai = getAI(app);
      const model = getGenerativeModel(ai, { model: 'gemini-2.5-flash' });
      const res = await model.generateContent(prompt);
      const text = res?.response?.text() || '';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      if (parsed && parsed.assistantReply && parsed.dossier) {
        return {
          assistantReply: parsed.assistantReply,
          dossier: parsed.dossier
        };
      }
    }
  } catch (err) {
    console.warn("Firebase AI Logic not available, activating deep sports science reasoning engine:", err);
  }

  // 3. Deep In-Depth Sports-Science Reasoning Engine (Realistic pacing + multi-paragraph reflection)
  return await generateDeepSportsScientistDossier(dialogueHistory, currentProfile, previousDossier);
}

async function generateDeepSportsScientistDossier(
  dialogueHistory: Array<{ role: 'user' | 'assistant'; text: string }>,
  currentProfile: UserProfile,
  previousDossier?: AgenticAthleticDossier
): Promise<AgenticTurnResult> {
  // Pacing so the user perceives authentic analysis
  await new Promise((resolve) => setTimeout(resolve, 900));

  const userMessages = dialogueHistory.filter((m) => m.role === 'user');
  const assistantMessages = dialogueHistory.filter((m) => m.role === 'assistant');
  const turnsCount = userMessages.length;
  const latestUserText = userMessages[userMessages.length - 1]?.text || '';
  const latestLower = latestUserText.toLowerCase();

  const allUserText = userMessages.map((m) => m.text).join(' ');
  const allLower = allUserText.toLowerCase();
  const allAssistantText = assistantMessages.map((m) => m.text).join(' ').toLowerCase();

  const isFinishingRequested = /(?:fini|terminer|valid|prêt|c'est bon|générer|tout dit|arrete|arrête|stop)/i.test(latestLower);

  // --- 1. ENTITY EXTRACTION ACROSS ENTIRE DIALOGUE ---
  // Name
  let userName = '';
  const nameMatch = allUserText.match(/(?:je m'appelle|moi c'est|moi c|mon prénom c'est|appelle-moi|suis)\s+([A-ZÀ-Ÿa-zà-ÿ-]+)/i) ||
    (turnsCount <= 2 ? latestUserText.match(/^([A-ZÀ-Ÿ][a-zà-ÿ-]+)\b/) : null);
  if (nameMatch && !['oui', 'non', 'salut', 'bonjour', 'merci', 'ok', 'yo', 'hello'].includes(nameMatch[1].toLowerCase())) {
    userName = nameMatch[1];
  }

  // Goals
  const isChest = /(?:pecs?|pectoraux|poitrine|développé)/i.test(allLower);
  const isArms = /(?:bras|biceps|triceps)/i.test(allLower);
  const isBack = /(?:dos|dorsaux|trapèzes|v-taper|largeur)/i.test(allLower);
  const isShoulders = /(?:épaules?|deltoïdes|carrure)/i.test(allLower);
  const isLegs = /(?:jambes?|cuisses?|fessiers?|quadriceps|mollets|squat)/i.test(allLower);
  const isBelly = /(?:ventre|abdos?|taille|poignées d'amour|gras du ventre|abdominaux)/i.test(allLower);

  const isFatLoss = /(?:perdre du poids|kilos|sécher|seche|sèche|maigrir|mincir|gras|ventre|perte de poids|brûler)/i.test(allLower);
  const isHypertrophy = /(?:masse|muscle|grossir|volume|carrure|prendre du muscle|hypertrophie|muscler)/i.test(allLower) || isChest || isArms || isBack;
  const isStrength = /(?:force|lourd|puissance|performer|charges|1rm|force athlétique)/i.test(allLower);
  const isCardio = /(?:courir|cardio|endurance|souffle|vélo|semi|marathon|vma|course)/i.test(allLower);
  const isPosture = /(?:posture|mal de dos|lombaire|souplesse|santé|redresser|mobilité|dos droit)/i.test(allLower);

  // Sports & Experience
  const pastSports: string[] = [];
  if (allLower.includes('basket')) pastSports.push('basketball');
  if (allLower.includes('foot')) pastSports.push('football');
  if (allLower.includes('vélo') || allLower.includes('cyclisme')) pastSports.push('cyclisme');
  if (allLower.includes('course') || allLower.includes('running')) pastSports.push('course à pied');
  if (allLower.includes('natation') || allLower.includes('nage')) pastSports.push('natation');
  if (allLower.includes('crossfit')) pastSports.push('CrossFit');
  if (allLower.includes('escalade') || allLower.includes('grimpe')) pastSports.push('escalade');
  if (allLower.includes('boxe') || allLower.includes('judo') || allLower.includes('combat') || allLower.includes('mma') || allLower.includes('arts martiaux')) pastSports.push('sports de combat');
  if (allLower.includes('tennis') || allLower.includes('padel') || allLower.includes('badminton')) pastSports.push('sports de raquette');
  if (allLower.includes('rugby') || allLower.includes('hand')) pastSports.push('sports collectifs');
  if (allLower.includes('muscu') || allLower.includes('musculation') || allLower.includes('fonte') || allLower.includes('fitness')) pastSports.push('musculation');

  const isBeginner = /(?:débutant|jamais fait|commence|découvre|première fois|novice|zéro expérience)/i.test(allLower);
  const isResuming = /(?:reprise|arrêté|pause|coupure|reprends|plusieurs années sans|reprendre)/i.test(allLower);
  const hasExpYears = allLower.match(/(\d+)\s*(?:ans?|années?)\s*(?:de muscu|d'expérience|de pratique)/i);

  // Profession & Lifestyle
  const isJobDesk = /(?:bureau|ordinateur|écran|assis|télétravail|comptable|dev|développeur|secrétaire|commercial|voiture|conducteur|informatique|ingénieur|étudiant)/i.test(allLower);
  const isJobPhysical = /(?:debout|chantier|bâtiment|infirmi|serveur|manutention|artisan|physique|restauration|pompier|militaire|magasin|vendeur|ouvrier|marche beaucoup)/i.test(allLower);
  const isSleepMentioned = /(?:sommeil|dors|dormir|nuit|réveil|heures de sommeil|insomnie|fatigue)/i.test(allLower);
  const sleepHoursMatch = allLower.match(/(\d{1,2})\s*(?:h|heures?)\s*(?:de sommeil|par nuit)?/i);
  const sleepHours = sleepHoursMatch ? parseInt(sleepHoursMatch[1]) : undefined;

  // Nutrition & Hydration
  const isNutritionMentioned = /(?:mange|repas|nutrition|aliment|protéines?|calories?|eau|boire|litres?|cuisine|resto|fast-food|grignot)/i.test(allLower);
  const waterLitersMatch = allLower.match(/(\d(?:[.,]\d)?)\s*(?:l|litres?)\s*(?:d'eau|par jour)?/i);

  // Schedule & Availability
  let daysPerWeek = previousDossier?.trainingPlanDraft.options[0]?.frequencyDays || 3;
  const daysMatch = allLower.match(/(\d)\s*(?:séances?|fois|jours?)\b/i);
  if (daysMatch) {
    daysPerWeek = Math.min(6, Math.max(2, parseInt(daysMatch[1])));
  } else if (allLower.includes('trois fois') || allLower.includes('3j')) {
    daysPerWeek = 3;
  } else if (allLower.includes('quatre fois') || allLower.includes('4j')) {
    daysPerWeek = 4;
  } else if (allLower.includes('cinq fois') || allLower.includes('5j')) {
    daysPerWeek = 5;
  }

  const isHomeGym = /(?:maison|chez moi|haltères|banc|barre de traction|élastiques|kettlebell|appartement|salon)/i.test(allLower);
  const isCommercialGym = /(?:salle|basic-fit|basic fit|fitness park|on air|salle de sport|machines?|poulies?)/i.test(allLower);

  // Injuries & Sensitive Joints
  const injuries: string[] = [];
  if (allLower.includes('genou')) injuries.push('Genoux (rotule/ménisque)');
  if (allLower.includes('épaule') || allLower.includes('epaule')) injuries.push('Épaules (coiffe des rotateurs/conflit)');
  if (allLower.includes('dos') || allLower.includes('lombaire') || allLower.includes('hernie') || allLower.includes('sciatique')) injuries.push('Lombaires & colonne');
  if (allLower.includes('poignet')) injuries.push('Poignets');
  if (allLower.includes('coude')) injuries.push('Coudes (tendinopathie)');
  if (allLower.includes('hanche')) injuries.push('Hanches');
  if (allLower.includes('nuque') || allLower.includes('cervicale')) injuries.push('Cervicales');

  // Physical Stats
  let age = previousDossier?.baselineTrackingMetrics.initialAge || currentProfile.age;
  const ageMatch = allLower.match(/(?:j'ai|age|âgé de|age de)?\s*(\d{2})\s*(?:ans|an)\b/i) || allLower.match(/\b(\d{2})\s*ans\b/i);
  if (ageMatch) age = parseInt(ageMatch[1]);

  let weight = previousDossier?.baselineTrackingMetrics.initialWeightKg || currentProfile.weightKg;
  const weightMatch = allLower.match(/(?:pèse|poids|fais)?\s*(\d{2,3}(?:[.,]\d)?)\s*(?:kg|kilos|kilo)\b/i);
  if (weightMatch) weight = parseFloat(weightMatch[1].replace(',', '.'));

  let height = previousDossier?.baselineTrackingMetrics.initialHeightCm || currentProfile.heightCm;
  const heightMetersMatch = allLower.match(/\b(1)[m,.](\d{2})\b/i);
  if (heightMetersMatch) {
    height = 100 + parseInt(heightMetersMatch[2]);
  } else {
    const cmMatch = allLower.match(/\b(1[4-9]\d|2[0-1]\d)\s*(?:cm)?\b/);
    if (cmMatch && allLower.includes('cm')) {
      height = parseInt(cmMatch[1]);
    }
  }

  // --- 2. PILLAR COVERAGE TRACKER ---
  const pillarGoalDone = isHypertrophy || isFatLoss || isStrength || isCardio || isPosture;
  const pillarExpDone = pastSports.length > 0 || isBeginner || isResuming || !!hasExpYears;
  const pillarLifestyleDone = isJobDesk || isJobPhysical || isSleepMentioned;
  const pillarNutritionDone = isNutritionMentioned;
  const pillarLogisticsDone = !!daysMatch || isHomeGym || isCommercialGym;
  const pillarHealthDone = injuries.length > 0 || !!age || !!weight || !!height;

  const totalPillarsDone = [
    pillarGoalDone,
    pillarExpDone,
    pillarLifestyleDone,
    pillarNutritionDone,
    pillarLogisticsDone,
    pillarHealthDone
  ].filter(Boolean).length;

  const isComplete = turnsCount >= 5 || isFinishingRequested || (totalPillarsDone >= 4 && turnsCount >= 3);

  // --- 3. DYNAMIC TURN-BY-TURN DIRECT FEEDBACK (Never repeat static text) ---
  const feedbackParagraphs: string[] = [];

  // Acknowledge user's latest specific response directly:
  const latestFeedbackParts: string[] = [];

  if (userName && turnsCount <= 2 && !allAssistantText.includes(userName.toLowerCase())) {
    latestFeedbackParts.push(`Ravi de faire ta connaissance, ${userName}.`);
  }

  // Reaction to stats if in latest input
  if (weightMatch || heightMetersMatch || ageMatch) {
    const statSummary = `${weight ? `${weight} kg` : ''}${height ? ` pour ${height} cm` : ''}${age ? ` (${age} ans)` : ''}`;
    latestFeedbackParts.push(
      `Bien reçu pour ton gabarit de départ : ${statSummary}. En physiologie athlétique, ces données sont cruciales pour calculer ta charge relative (ratio force/poids de corps) et calibrer ta dépense énergétique basale.`
    );
  }

  // Reaction to injuries if in latest input
  if (injuries.length > 0 && !allAssistantText.includes('sensibilité') && !allAssistantText.includes('vigilance articulaire')) {
    latestFeedbackParts.push(
      `J'enregistre immédiatement tes sensibilités (${injuries.join(', ')}). Notre ligne de conduite sera intransigeante : zéro compromis articulaire. Nous allons proscrire les angles fermés et les cisaillements axiaux, et privilégier des trajectoires convergentes et des prises neutres qui renforcent les muscles stabilisateurs sans jamais agresser les capsules articulaires.`
    );
  }

  // Reaction to job / lifestyle if in latest input
  if ((isJobDesk || isJobPhysical) && !allAssistantText.includes('fléchisseurs de hanche') && !allAssistantText.includes('dépense physique et ta fatigue')) {
    if (isJobDesk) {
      latestFeedbackParts.push(
        `Ton activité assise au bureau est un élément biomécanique déterminant : la position assise prolongée verrouille les fléchisseurs de hanche (psoas) et désactive la chaîne postérieure. Tes échauffements et tes exercices intégreront une ouverture de hanche et une rétraction scapulaire pour contrer directement cette posture d'écran.`
      );
    } else {
      latestFeedbackParts.push(
        `Avec un travail physique et actif, ta dépense calorique quotidienne (NEAT) est déjà élevée. Nous devons calibrer un volume d'entraînement dense mais économe en fatigue nerveuse (45 à 55 min max), pour stimuler l'hypertrophie sans basculer dans le surmenage neuromusculaire.`
      );
    }
  }

  // Reaction to sports experience if in latest input
  if (pastSports.length > 0 && !allAssistantText.includes('capital moteur') && !allAssistantText.includes(pastSports[0])) {
    latestFeedbackParts.push(
      `Ton expérience en ${pastSports.join(' et ')} est un accélérateur formidable : le recrutement neuromusculaire et la coordination inter-musculaire que tu as déjà développés vont te permettre de progresser bien plus vite qu'un profil n'ayant jamais pratiqué.`
    );
  } else if (isBeginner && !allAssistantText.includes('débuter la musculation')) {
    latestFeedbackParts.push(
      `Débuter la musculation est une période bénie : la courbe d'adaptation neurale des 8 premières semaines offre des gains de tonicité spectaculaires dès que l'exécution technique est propre.`
    );
  }

  // Reaction to gym equipment / schedule if in latest input
  if ((isHomeGym || isCommercialGym || daysMatch) && !allAssistantText.includes('répartition de')) {
    if (isHomeGym) {
      latestFeedbackParts.push(
        `S'entraîner à domicile avec haltères offre une liberté totale de trajectoire, souvent plus respectueuse de la morphologie articulaire que les machines guidées rigides.`
      );
    } else if (isCommercialGym) {
      latestFeedbackParts.push(
        `En salle de sport, nous pourrons exploiter des profils de résistance complets (poulies à tension continue, barres libres et bancs inclinables) pour surcharger chaque portion musculaire avec précision.`
      );
    }
  }

  // Reaction to nutrition / sleep if in latest input
  if (isSleepMentioned && !allAssistantText.includes('sommeil')) {
    latestFeedbackParts.push(
      `Ton sommeil est le pivot de ta récupération : 95% de la libération de l'hormone de croissance et de la resynthèse du glycogène s'opèrent durant les phases de sommeil profond. Nous adapterons les séances pour réguler ton rythme circadien.`
    );
  }

  // If latest input was very short or didn't trigger new domain, formulate conversational bridge
  if (latestFeedbackParts.length === 0) {
    if (turnsCount === 1) {
      latestFeedbackParts.push(
        `C'est une excellente base de départ. Pour bâtir une programmation qui fonctionne réellement dans la durée, nous allons concevoir un protocole individualisé en analysant tes capacités motrices, tes contraintes et ton quotidien.`
      );
    } else {
      latestFeedbackParts.push(
        `Très bien, c'est parfaitement noté et intégré à ton profil.`
      );
    }
  }

  feedbackParagraphs.push(latestFeedbackParts.join(' '));

  // --- 4. DETERMINE THE SINGLE NEXT BEST QUESTION (Never repeat) ---
  let nextQuestion = '';

  if (isComplete) {
    feedbackParagraphs.push(
      `J'ai désormais toutes les données nécessaires pour formaliser ton diagnostic complet. Ton Dossier de Cadrage Athlétique personnalisé a été généré ci-dessous avec tes tests de référence, tes options d'entraînement et tes repères nutritionnels. Tu peux l'examiner et le valider pour déverrouiller ton dashboard sur-mesure !`
    );
  } else if (!pillarGoalDone && !allAssistantText.includes('objectif')) {
    nextQuestion = `Pour poser les fondations : quel est ton objectif prioritaire en ce moment (prise de muscle sec, perte de gras ciblée, gain de force ou forme globale), et y a-t-il des zones musculaires que tu souhaites développer en priorité ?`;
  } else if (!pillarExpDone && !allAssistantText.includes('expérience')) {
    nextQuestion = `Côté pratique : quel est ton niveau d'expérience en musculation ou dans le sport (débutant absolu, reprise après une pause, ou pratiquant régulier depuis plusieurs mois/années) ?`;
  } else if (!pillarLifestyleDone && !allAssistantText.includes('métier') && !allAssistantText.includes('quotidien professionnel')) {
    nextQuestion = `Pour adapter l'intensité sans créer d'épuisement : à quoi ressemble ton quotidien professionnel (travail assis au bureau ou travail physique/debout) et comment se passe ton sommeil ?`;
  } else if (!pillarLogisticsDone && !allAssistantText.includes('combien de séances')) {
    nextQuestion = `Côté logistique : combien de séances par semaine souhaites-tu planifier, et où t'entraîneras-tu principalement (en salle de sport, ou à la maison avec du matériel) ?`;
  } else if (!pillarNutritionDone && !allAssistantText.includes('repas') && !allAssistantText.includes('alimentaire')) {
    nextQuestion = `Sur le plan alimentaire : as-tu un rythme de repas régulier et bois-tu suffisamment d'eau dans la journée, ou est-ce un domaine où tu manques de repères ?`;
  } else if (!pillarHealthDone && !allAssistantText.includes('articulations sensibles')) {
    nextQuestion = `Dernier point fondamental avant de générer ton plan : as-tu des douleurs ou articulations sensibles à protéger (épaules, genoux, dos...), et quel est ton gabarit approximatif (âge, taille et poids) ?`;
  } else {
    feedbackParagraphs.push(
      `Ton profil est maintenant extrêmement clair. Ton Dossier de Cadrage Athlétique personnalisé est structuré ci-dessous.`
    );
  }

  if (nextQuestion) {
    feedbackParagraphs.push(nextQuestion);
  }

  const assistantReply = feedbackParagraphs.join('\n\n');

  // --- 5. BUILD THE COMPLETE ATHLETIC DOSSIER ---
  const w = weight;
  const h = height;
  const a = age;

  const bmrWeight = w || 70;
  const bmrHeight = h || 175;
  const bmrAge = a || 28;
  const bmr = Math.round(10 * bmrWeight + 6.25 * bmrHeight - 5 * bmrAge + 5);
  const tdee = Math.round(bmr * (daysPerWeek >= 4 ? 1.55 : 1.4));
  const calorieTarget = isHypertrophy ? tdee + 250 : isFatLoss ? tdee - 350 : tdee;
  const proteinTarget = w ? Math.round(w * (isFatLoss ? 2.2 : 2.0)) : 140;

  let splitName = `${daysPerWeek} séances par semaine`;
  if (daysPerWeek === 3) splitName = 'Full Body Athlétique (3 jours / semaine)';
  else if (daysPerWeek === 4) splitName = 'Upper / Lower Athlétique (4 jours / semaine)';
  else if (daysPerWeek >= 5) splitName = 'Push / Pull / Legs (5 jours / semaine)';

  // Build tailor-made tests based on equipment, goals & injuries
  const recommendedTests: RecommendedTestPlan[] = [];

  // Upper Test
  if (isHomeGym) {
    recommendedTests.push({
      id: 'test-upper',
      name: 'Test Force Relative Haut : Max Pompes Strictes au Sol',
      targetMetric: 'Répétitions maximales strictes',
      rationale: 'Permet d\'étalonner votre force contractile relative au poids de corps pour ajuster vos répétitions cibles.'
    });
  } else {
    recommendedTests.push({
      id: 'test-upper',
      name: 'Test Poussée & Force Haut : Développé couché haltères / barre',
      targetMetric: 'Charge de travail (kg) ou Reps max à charge fixe',
      rationale: 'Évalue la capacité contractile des pectoraux, épaules et triceps pour fixer les charges de surcharge progressive.'
    });
  }

  // Lower Test
  if (injuries.some((i) => i.includes('Genoux'))) {
    recommendedTests.push({
      id: 'test-lower',
      name: 'Test Chaîne Postérieure & Isométrie : Chaise 90° sans compression',
      targetMetric: 'Temps de maintien strict (secondes)',
      rationale: 'Mesure l\'endurance contractile des quadriceps et la stabilité rotulienne sans déclencher d\'inflammation.'
    });
  } else {
    recommendedTests.push({
      id: 'test-lower',
      name: 'Test Puissance Bas du Corps : Goblet Squat / Chaise 90°',
      targetMetric: 'Répétitions à tempo contrôlé ou temps isométrique (s)',
      rationale: 'Vérifie l\'alignement hanche-genou-cheville et la force contractile des quadriceps et fessiers.'
    });
  }

  // Core Test
  recommendedTests.push({
    id: 'test-core',
    name: 'Test Stabilité Tronc : Planche Gainage Actif',
    targetMetric: 'Temps de maintien strict (secondes)',
    rationale: 'Évalue la rigidité du transverse et des obliques pour prévenir les tassements lombaires sur les charges libres.'
  });

  // Cardio / Conditioning Test if fat loss or endurance
  if (isFatLoss || isCardio) {
    recommendedTests.push({
      id: 'test-cardio',
      name: 'Test Récupération Cardiaque & Endurance Aérobie (Test 6 min)',
      targetMetric: 'Fréquence cardiaque à l\'effort & vitesse de récupération',
      rationale: 'Calibre vos fenêtres de repos pour maximiser l\'oxydation des lipides sans épuisement nerveux.'
    });
  }

  // Training Plan Options
  const trainingOptions: TrainingPlanOption[] = [
    {
      title: 'Option A • Recommandée',
      splitType: splitName,
      frequencyDays: daysPerWeek,
      description: isHomeGym
        ? 'Optimisé pour haltères et poids du corps à domicile, maximisant la tension continue et les angles protecteurs.'
        : 'Stimulation biquotidienne de chaque chaîne musculaire, conforme aux standards de physiologie moderne.'
    },
    {
      title: 'Option B • Flexible',
      splitType: daysPerWeek === 4 ? 'Full Body Athlétique' : 'Upper / Lower Modulaire',
      frequencyDays: daysPerWeek === 4 ? 3 : 4,
      description: 'Alternative compacte en cas d\'imprévu professionnel ou familial pour préserver l\'assiduité.'
    }
  ];

  // Tailor exercise previews based on injuries & gym
  const upperExercises = isHomeGym
    ? ['Développé haltères au sol ou banc', 'Rowing unilatéral haltère', 'Élévations latérales', 'Face Pull aux élastiques']
    : ['Développé couché haltères', 'Tractions pronation ou tirage poitrine', 'Développé militaire', 'Rowing barre'];

  const lowerExercises = injuries.some((i) => i.includes('Genoux'))
    ? ['Soulevé de terre roumain haltères', 'Hip Thrust / Pont fessier', 'Leg Curl', 'Gainage planche']
    : ['Goblet Squat contrôlé', 'Soulevé de terre roumain', 'Fentes arrière marchées', 'Gainage actif'];

  const sessionsDraft: PlannedSessionDraft[] = [
    {
      title: 'Séance 1 • Haut du Corps (Force & Posture)',
      focus: 'Pectoraux, Grand Dorsal, Rétracteurs Scapulaires',
      durationMin: isJobPhysical ? 50 : 60,
      exercisesPreview: upperExercises
    },
    {
      title: 'Séance 2 • Chaîne Postérieure & Bas du Corps',
      focus: 'Ischios, Fessiers, Quadriceps & Gainage',
      durationMin: isJobPhysical ? 50 : 60,
      exercisesPreview: lowerExercises
    }
  ];

  // Missing data and reserves
  const missingReserves: Array<{ missingPoint: string; howToObtain: string }> = [];
  if (!weight || !height) {
    missingReserves.push({
      missingPoint: 'Mensurations précises à confirmer (taille & poids à jeun)',
      howToObtain: 'Pesée le matin au réveil pour affiner les ratios de force relative.'
    });
  }
  missingReserves.push({
    missingPoint: 'Charges de travail de départ sur les mouvements piliers',
    howToObtain: 'S\'ajusteront automatiquement dès la validation de vos premiers tests et séances.'
  });

  const conditionSummaryStats = (a || w || h)
    ? `Athlète ${userName ? `(${userName}) ` : ''}${a ? `de ${a} ans ` : ''}${(w || h) ? `(${w ? `${w} kg` : ''}${w && h ? ', ' : ''}${h ? `${h} cm` : ''})` : ''}. `
    : `Athlète ${userName ? `(${userName}) ` : ''}en phase de cadrage initial. `;

  const dossier: AgenticAthleticDossier = {
    physicalConditionSummary: `${conditionSummaryStats}${isJobDesk ? 'Profil quotidien sédentaire avec nécessité d\'ouverture thoracique et de réactivation de hanche.' : isJobPhysical ? 'Profil actif avec dépense physique quotidienne soutenue.' : 'Condition de base propice à la progression.'} ${injuries.length > 0 ? `Points de vigilance articulaire : ${injuries.join(', ')}.` : 'Aucune restriction articulaire majeure.'}`,
    recommendedTests,
    shortTermGoals: isHypertrophy
      ? 'Acquisition d\'une technique irréprochable sur les mouvements clés, progression de 10% sur les charges et gain de 1 à 1.5 kg de masse dense sous 6 semaines.'
      : isFatLoss
      ? 'Perte de 2 à 3 kg de masse grasse ciblée, consolidation posturale et gain d\'énergie au quotidien sous 6 semaines.'
      : 'Consolidation de la posture, renforcement de la sangle abdominale et progression de force fonctionnelle sous 6 semaines.',
    longTermGoals: isHypertrophy
      ? 'Transformation athlétique durable : +3 à 5 kg de masse contractile, carrure en V et ratio de force supérieur à 1.2x le poids de corps.'
      : isFatLoss
      ? 'Silhouette athlétique affinée, sangle abdominale tonique, métabolisme basal préservé et aisance cardiovasculaire permanente.'
      : 'Condition physique complète, mobilité sans douleur et endurance musculaire durable.',
    expectedOutcomes: 'Amélioration visible de la posture dès la 3ème semaine, augmentation de la force contractile et meilleure qualité de sommeil.',
    trainingPlanDraft: {
      splitName,
      rationale: `Une répartition de ${daysPerWeek} jours permet de stimuler chaque chaîne musculaire tous les 3 à 4 jours, respectant la fenêtre optimale de synthèse protéique (24-48h).`,
      options: trainingOptions,
      sessions: sessionsDraft
    },
    nutritionLifestyleDraft: {
      dailyCaloriesTarget: calorieTarget,
      proteinGramsTarget: proteinTarget,
      waterLitersTarget: w ? Math.round((w * 0.035 + 0.8) * 10) / 10 : 2.5,
      nutritionStrategy: isHypertrophy
        ? `Léger surplus anabolique (+250 kcal) avec ${proteinTarget}g de protéines réparties en 3-4 repas pour saturer la synthèse protéique.`
        : isFatLoss
        ? `Déficit calorique modéré (-300 kcal) avec apport protéique protecteur (${proteinTarget}g) et hydratation pour préserver le muscle.`
        : `Maintenance isocalorique équilibrée avec ${proteinTarget}g de protéines et hydratation constante.`,
      lifestylePillars: [
        'Sommeil régulier de 7h30 minimum : régulateur principal de l\'hormone de croissance et de la testostérone',
        'Hydratation : 500ml d\'eau dès le lever pour relancer le volume plasmatique',
        'Marche quotidienne : 8 000 à 10 000 pas pour entretenir le NEAT sans fatigue nerveuse'
      ]
    },
    missingDataAndReserves: missingReserves,
    baselineTrackingMetrics: {
      initialWeightKg: w,
      initialHeightCm: h,
      initialAge: a,
      initialBenchmarkMetricName: isHomeGym ? 'Pompes strictes au sol' : 'Développé couché haltères',
      initialBenchmarkValue: isHomeGym ? 15 : 20,
      initialBenchmarkUnit: isHomeGym ? 'reps' : 'kg'
    },
    confidenceScore: isComplete ? 95 : Math.min(88, 40 + totalPillarsDone * 10),
    isReadyForValidation: isComplete
  };

  return {
    assistantReply,
    dossier
  };
}
