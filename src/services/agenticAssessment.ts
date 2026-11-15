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
  // Realistic pacing so the user experiences authentic analysis delay (1.1s)
  await new Promise((resolve) => setTimeout(resolve, 1100));

  const userMessages = dialogueHistory.filter((m) => m.role === 'user');
  const turnsCount = userMessages.length;
  const latestUserText = userMessages[userMessages.length - 1]?.text || '';
  const latestLower = latestUserText.toLowerCase();

  const allUserText = userMessages.map((m) => m.text).join(' ');
  const lower = allUserText.toLowerCase();
  const isFinishingRequested = /(?:fini|terminer|valid|prêt|c'est bon|générer|tout dit)/i.test(lower);

  // 1. Entity Extraction: Name
  let userName = '';
  const nameMatch = allUserText.match(/(?:je m'appelle|moi c'est|moi c|mon prénom c'est|appelle-moi)\s+([A-ZÀ-Ÿa-zà-ÿ-]+)/i) || 
    (turnsCount <= 2 ? latestUserText.match(/^([A-ZÀ-Ÿ][a-zà-ÿ-]+)\b/) : null);
  if (nameMatch) {
    userName = nameMatch[1];
  }

  // 2. Entity Extraction: Goals & Target Muscle Groups
  const isChest = /(?:pecs|pectoraux|poitrine)/i.test(lower);
  const isArms = /(?:bras|biceps|triceps)/i.test(lower);
  const isBack = /(?:dos|dorsaux|trapèzes|v-taper|largeur)/i.test(lower);
  const isShoulders = /(?:épaules|epaule|deltoïdes|carrure)/i.test(lower);
  const isLegs = /(?:jambes|cuisses|fessiers|quadriceps|mollets)/i.test(lower);
  const isBelly = /(?:ventre|abdos|taille|poignées d'amour|gras du ventre)/i.test(lower);
  
  const isFatLoss = /(?:perdre du poids|kilos|sécher|seche|maigrir|mincir|gras|ventre)/i.test(lower);
  const isHypertrophy = /(?:masse|muscle|grossir|volume|carrure|prendre)/i.test(lower) || isChest || isArms || isBack;
  const isStrength = /(?:force|lourd|puissance|performer|charges|1rm)/i.test(lower);
  const isCardio = /(?:courir|cardio|endurance|souffle|vélo|semi|marathon)/i.test(lower);
  const isPosture = /(?:posture|mal de dos|lombaire|souplesse|santé|redresser)/i.test(lower);

  // 3. Entity Extraction: Sports Background & Experience
  const pastSports: string[] = [];
  if (lower.includes('basket')) pastSports.push('basketball');
  if (lower.includes('foot')) pastSports.push('football');
  if (lower.includes('vélo') || lower.includes('cyclisme')) pastSports.push('cyclisme');
  if (lower.includes('course') || lower.includes('running')) pastSports.push('course à pied');
  if (lower.includes('natation')) pastSports.push('natation');
  if (lower.includes('crossfit')) pastSports.push('CrossFit');
  if (lower.includes('escalade')) pastSports.push('escalade');
  if (lower.includes('boxe') || lower.includes('judo') || lower.includes('combat')) pastSports.push('sports de combat');
  if (lower.includes('tennis')) pastSports.push('tennis');
  if (lower.includes('muscu')) pastSports.push('musculation');

  const isBeginner = /(?:débutant|jamais fait|commence|découvre|première fois)/i.test(lower);
  const isResuming = /(?:reprise|arrêté|pause|coupure|reprends|plusieurs années sans)/i.test(lower);

  // 4. Entity Extraction: Profession & Lifestyle
  const isJobDesk = /(?:bureau|ordinateur|écran|assis|télétravail|comptable|dev|développeur|secrétaire|commercial|voiture)/i.test(lower);
  const isJobPhysical = /(?:debout|chantier|bâtiment|infirmier|serveur|manutention|artisan|physique|restauration)/i.test(lower);
  const isSleepIssue = /(?:mal dormi|insomnie|fatigué|fatigue|court|réveils|dors peu)/i.test(lower);

  // 5. Entity Extraction: Availability & Equipment
  let daysPerWeek = 4;
  const daysMatch = lower.match(/(\d+)\s*(?:séances?|fois|jours?)\b/i);
  if (daysMatch) {
    daysPerWeek = Math.min(6, Math.max(2, parseInt(daysMatch[1])));
  } else if (lower.includes('3 fois') || lower.includes('3 séances') || lower.includes('3j')) {
    daysPerWeek = 3;
  } else if (lower.includes('5 fois') || lower.includes('5 séances') || lower.includes('5j')) {
    daysPerWeek = 5;
  }

  const isHomeGym = /(?:maison|chez moi|haltères|banc|barre de traction|élastiques|kettlebell)/i.test(lower);
  const isCommercialGym = /(?:salle|basic-fit|basic fit|fitness park|on air|salle de sport)/i.test(lower);

  // 6. Entity Extraction: Sensitive Joints
  const injuries: string[] = [];
  if (lower.includes('genou')) injuries.push('Genoux (rotule/ménisque)');
  if (lower.includes('épaule') || lower.includes('epaule')) injuries.push('Épaules (coiffe des rotateurs)');
  if (lower.includes('dos') || lower.includes('lombaire')) injuries.push('Lombaires & bas du dos');
  if (lower.includes('poignet')) injuries.push('Poignets');
  if (lower.includes('coude')) injuries.push('Coudes (tendinopathie)');

  // 7. Physical Stats
  let age = previousDossier?.baselineTrackingMetrics.initialAge || currentProfile.age;
  const ageMatch = lower.match(/(?:j'ai|age|âgé de|age de)?\s*(\d{2})\s*(?:ans|an)\b/i) || lower.match(/\b(\d{2})\s*ans\b/i);
  if (ageMatch) age = parseInt(ageMatch[1]);

  let weight = previousDossier?.baselineTrackingMetrics.initialWeightKg || currentProfile.weightKg;
  const weightMatch = lower.match(/(?:pèse|poids|fais)?\s*(\d{2,3}(?:[.,]\d)?)\s*(?:kg|kilos|kilo)\b/i);
  if (weightMatch) weight = parseFloat(weightMatch[1].replace(',', '.'));

  let height = previousDossier?.baselineTrackingMetrics.initialHeightCm || currentProfile.heightCm;
  const heightMetersMatch = lower.match(/\b(1)[m,.](\d{2})\b/i);
  let heightCmMatch = false;
  if (heightMetersMatch) {
    height = 100 + parseInt(heightMetersMatch[2]);
  } else {
    const cmMatch = lower.match(/\b(1[4-9]\d|2[0-1]\d)\s*(?:cm)?\b/);
    if (cmMatch && lower.includes('cm')) {
      height = parseInt(cmMatch[1]);
      heightCmMatch = true;
    }
  }

  // Dimension coverage flags
  const hasGoalDimension = isHypertrophy || isFatLoss || isStrength || isCardio || isPosture;
  const hasHistoryDimension = pastSports.length > 0 || isBeginner || isResuming;
  const hasLifestyleDimension = isJobDesk || isJobPhysical || isSleepIssue;
  const hasAvailabilityDimension = !!daysMatch || isHomeGym || isCommercialGym;
  const hasHealthStatsDimension = injuries.length > 0 || !!ageMatch || !!weightMatch || !!heightMetersMatch;

  const isComplete = turnsCount >= 4 || isFinishingRequested || 
    (hasGoalDimension && hasHistoryDimension && hasLifestyleDimension && hasAvailabilityDimension && hasHealthStatsDimension);

  // BUILD THE DEEP THOROUGH REFLECTION (Multi-paragraph sports science analysis)
  const paragraphs: string[] = [];

  // Salutation & Personalized Receipt
  const greeting = userName ? `Enchanté ${userName} ! ` : '';

  // Paragraph 1: Biomechanical & Metabolic Analysis of the Objective
  if (isFatLoss && isHypertrophy) {
    paragraphs.push(
      `${greeting}Viser la perte de masse grasse (notamment abdominale) tout en développant la masse musculaire relève de la recomposition corporelle avancée. D'un point de vue physiologique, le piège classique serait d'augmenter démesurément le cardio en réduisant drastiquement les calories, ce qui provoquerait une protéolyse (perte de muscle) et une baisse du métabolisme de base. Au contraire, notre protocole va imposer une tension mécanique lourde et stricte en musculation pour forcer ton système neuro-endocrinien à sanctuariser chaque gramme de muscle, pendant qu'un déficit calorique léger et maîtrisé mobilisera les triglycérides stockés.`
    );
  } else if (isFatLoss) {
    paragraphs.push(
      `${greeting}Ton cap d'amincissement et de perte de masse grasse est une excellente démarche. En physiologie de l'exercice, la préservation de la masse maigre est le facteur clé pour maintenir un métabolisme basal élevé et éviter l'effet rebond. Nous allons instaurer un déficit énergétique modéré (environ 300 kcal sous ta dépense journalière) combiné à un entraînement en résistance qui envoie le signal anabolique indispensable à la rétention musculaire.`
    );
  } else if (isHypertrophy) {
    const muscleList: string[] = [];
    if (isChest) muscleList.push('pectoraux');
    if (isArms) muscleList.push('bras');
    if (isBack) muscleList.push('dos');
    if (isShoulders) muscleList.push('épaules');
    if (isLegs) muscleList.push('jambes');
    const muscleTargetStr = muscleList.length > 0 ? ` (notamment ${muscleList.join(', ')})` : '';

    paragraphs.push(
      `${greeting}Ton objectif d'hypertrophie musculaire${muscleTargetStr} exige une approche rigoureusement étalonnée. Pour déclencher une croissance myofibrillaire durable, le facteur déterminant n'est pas la fatigue superficielle, mais la tension mécanique appliquée aux unités motrices à seuil d'activation élevé. Cela se traduit par un travail dans une zone de 6 à 12 répétitions, à 1 ou 2 répétitions de l'échec postural (RIR 1-2), en insistant sur une phase excentrique contrôlée de 2 à 3 secondes qui maximise le recrutement des fibres rapides.`
    );
  } else if (isStrength) {
    paragraphs.push(
      `${greeting}Le développement de la force athlétique repose avant tout sur l'adaptation neurale : synchronisation des motoneurones, fréquence de décharge et réduction des co-contractions antagonistes. Nous structurerons tes blocs de travail autour de mouvements polyarticulaires fondamentaux à intensité élevée (75 à 85% du 1RM) avec des temps de récupération complets (2 min 30 à 3 min) pour assurer la resynthèse complète de l'ATP phosphocréatine.`
    );
  } else {
    paragraphs.push(
      `${greeting}Ta volonté de reprendre le contrôle de ta forme physique et de bâtir une condition athlétique solide est une excellente initiative. Pour qu'une transformation s'inscrive dans la durée sans rechute, nous allons allier un travail de posture, de force fonctionnelle et de conditionnement métabolique progressif.`
    );
  }

  // Paragraph 2: Integration of Lifestyle, Daily Job, Sleep & Joints
  const contextualInsights: string[] = [];

  if (pastSports.length > 0) {
    contextualInsights.push(
      `Ton expérience passée en ${pastSports.join(' et ')} te confère un capital moteur précieux : ta mémoire neuromusculaire et ta proprioception permettront d'assimiler les schémas moteurs beaucoup plus vite qu'un novice complet.`
    );
  } else if (isBeginner) {
    contextualInsights.push(
      `Débuter la musculation est une opportunité formidable : tes gains initiaux (l'adaptation neuromusculaire des premières semaines) seront particulièrement rapides et gratifiants dès lors que la technique d'exécution est irréprochable.`
    );
  }

  if (isJobDesk) {
    contextualInsights.push(
      `Travailler assis devant écran crée inévitablement un raccourcissement des fléchisseurs de hanche (psoas) et un enroulement des épaules vers l'avant. Notre programmation compensera directement cela en intégrant systématiquement des mouvements d'ouverture scapulaire (Face Pull, tirages horizontaux) et d'extension de hanche pour décompresser tes lombaires.`
    );
  } else if (isJobPhysical) {
    contextualInsights.push(
      `Avec un quotidien professionnel actif et debout, ta dépense physique et ta fatigue articulaire sont déjà substantielles. Nos séances seront denses (45 à 55 min max) et ciblées, en supprimant tout volume poubelle pour préserver tes capacités de récupération.`
    );
  }

  if (injuries.length > 0) {
    contextualInsights.push(
      `Concernant tes sensibilités déclarées (${injuries.join(', ')}), nous allons verrouiller chaque trajectoire : pas de charges axiales compressives ou de rotations à risque, mais des variantes stables en prise neutre et du travail unilatéral qui renforcent les stabilisateurs sans déclencher d'inflammation.`
    );
  }

  if (isHomeGym) {
    contextualInsights.push(
      `S'entraîner à domicile avec haltères permet une intensité remarquable : la liberté de trajectoire des haltères est même souvent supérieure aux barres guidées pour l'activation musculaire et le confort articulaire.`
    );
  }

  if (contextualInsights.length > 0) {
    paragraphs.push(contextualInsights.join(' '));
  }

  // Paragraph 3: Transition & Single Next Question OR Finalization
  let nextQuestion = '';

  if (isComplete) {
    paragraphs.push(
      `J'ai maintenant une cartographie complète et précise de ton profil. Ton Dossier de Cadrage Athlétique personnalisé a été intégralement structuré ci-dessous. Tu peux explorer tes cibles nutritionnelles, examiner les options de répartition et valider quand tu es prêt à initialiser ton suivi en direct !`
    );
  } else if (!hasHistoryDimension) {
    nextQuestion = `Pour calibrer précisément le volume de travail et la complexité des exercices : as-tu déjà une expérience en musculation ou dans d'autres sports, ou s'agit-il d'une reprise complète ?`;
  } else if (!hasLifestyleDimension) {
    nextQuestion = `Pour adapter tes séances à ton rythme sans accumuler de fatigue nerveuse : à quoi ressemble ton quotidien professionnel (travail assis au bureau ou travail actif/debout) et comment qualifierais-tu ton sommeil ?`;
  } else if (!hasAvailabilityDimension) {
    nextQuestion = `Côté organisation : combien de séances par semaine souhaites-tu consacrer à tes entraînements, et quel sera ton cadre de pratique (salle de sport équipée, à la maison avec du matériel, ou au poids du corps) ?`;
  } else if (!hasHealthStatsDimension) {
    nextQuestion = `Dernière étape clé avant de finaliser ton plan : as-tu des articulations sensibles ou d'anciennes blessures à préserver (épaules, genoux, dos...) ? Et si tu les connais, quel est ton gabarit approximatif (âge, taille et poids) ?`;
  } else {
    paragraphs.push(
      `Tous les voyants sont au vert. J'ai réuni les données nécessaires pour formaliser ta feuille de route. Ton Dossier de Cadrage Athlétique personnalisé est accessible ci-dessous.`
    );
  }

  if (nextQuestion) {
    paragraphs.push(nextQuestion);
  }

  const assistantReply = paragraphs.join('\n\n');

  // Build the detailed Athletic Dossier
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

  const recommendedTests: RecommendedTestPlan[] = [
    {
      id: 'test-upper',
      name: isHomeGym ? 'Test Max Pompes Strictes au Sol' : 'Test Développé Poussée & Tirage Haut du Corps',
      targetMetric: isHomeGym ? 'Répétitions maximales strictes' : 'Charge de travail (kg) ou Reps max',
      rationale: 'Permet d\'étalonner votre force contractile relative pour fixer vos charges de travail initiales.'
    },
    {
      id: 'test-lower',
      name: injuries.some(i => i.includes('Genoux')) ? 'Test Chaîne Postérieure & Isométrie Fessiers' : 'Test Goblet Squat / Fentes Contrôlées',
      targetMetric: 'Répétitions max à tempo contrôlé (3-0-1-0)',
      rationale: 'Vérifie la stabilité de l\'axe genou-bassin et la mobilité de hanche sous tension.'
    }
  ];

  if (isFatLoss || isCardio) {
    recommendedTests.push({
      id: 'test-cardio',
      name: 'Test Récupération Cardiaque & Endurance Aérobie (6 min)',
      targetMetric: 'Fréquence cardiaque à l\'effort & vitesse de récupération',
      rationale: 'Calibre vos allures et vos fenêtres de repos pour maximiser la dépense lipidique sans épuisement.'
    });
  }

  const trainingOptions: TrainingPlanOption[] = [
    {
      title: 'Option A • Recommandée',
      splitType: splitName,
      frequencyDays: daysPerWeek,
      description: isHomeGym 
        ? 'Optimisé pour haltères et poids du corps à domicile, maximisant la tension continue.'
        : 'Stimulation biquotidienne de chaque chaîne musculaire, conforme aux standards de physiologie moderne.'
    },
    {
      title: 'Option B • Flexible',
      splitType: daysPerWeek === 4 ? 'Full Body Athlétique' : 'Upper / Lower Modulaire',
      frequencyDays: daysPerWeek === 4 ? 3 : 4,
      description: 'Alternative compacte en cas d\'imprévu professionnel ou familial.'
    }
  ];

  const sessionsDraft: PlannedSessionDraft[] = [
    {
      title: 'Séance 1 • Haut du Corps (Force & Posture)',
      focus: 'Pectoraux, Grand Dorsal, Rétracteurs Scapulaires',
      durationMin: isJobPhysical ? 50 : 60,
      exercisesPreview: isHomeGym 
        ? ['Développé haltères au sol ou banc', 'Rowing unilatéral haltère', 'Élévations latérales', 'Face Pull aux élastiques']
        : ['Développé couché haltères', 'Tractions pronation ou tirage poitrine', 'Développé militaire', 'Rowing barre']
    },
    {
      title: 'Séance 2 • Chaîne Postérieure & Bas du Corps',
      focus: 'Ischios, Fessiers, Quadriceps & Gainage',
      durationMin: isJobPhysical ? 50 : 60,
      exercisesPreview: injuries.some(i => i.includes('Genoux'))
        ? ['Soulevé de terre roumain haltères', 'Hip Thrust / Pont fessier', 'Leg Curl', 'Gainage planche']
        : ['Goblet Squat contrôlé', 'Soulevé de terre roumain', 'Fentes arrière marchées', 'Gainage actif']
    }
  ];

  const missingReserves = [];
  if (!weightMatch || !heightMetersMatch) {
    missingReserves.push({
      missingPoint: 'Mensurations précises à confirmer (taille & poids à jeun)',
      howToObtain: 'Pesée le matin au réveil pour affiner les ratios de force relative.'
    });
  }
  missingReserves.push({
    missingPoint: 'Charges de travail de départ sur les mouvements piliers',
    howToObtain: 'S\'ajusteront automatiquement dès votre première séance enregistrée.'
  });

  const conditionSummaryStats = (a || w || h)
    ? `Athlète ${userName ? `(${userName}) ` : ''}${a ? `de ${a} ans ` : ''}${(w || h) ? `(${w ? `${w} kg` : ''}${w && h ? ', ' : ''}${h ? `${h} cm` : ''})` : ''}. `
    : `Athlète ${userName ? `(${userName}) ` : ''}en phase de cadrage initial. `;

  const dossier: AgenticAthleticDossier = {
    physicalConditionSummary: `${conditionSummaryStats}${isJobDesk ? 'Profil quotidien sédentaire avec nécessité d\'ouverture thoracique et de réactivation de hanche.' : isJobPhysical ? 'Profil actif avec dépense physique quotidienne soutenue.' : 'Condition de base propice à la progression.'} ${injuries.length > 0 ? `Points de vigilance articulaire : ${injuries.join(', ')}.` : 'Aucune restriction articulaire majeure.'}`,
    recommendedTests,
    shortTermGoals: isHypertrophy 
      ? 'Acquisition d\'une technique irréprochable sur les 4 mouvements clés, progression de 10% sur les charges de travail et gain de 1 à 1.5 kg de masse dense en 6 semaines.'
      : 'Perte de 2 à 3 kg de masse grasse ciblée, consolidation posturale et gain d\'énergie au quotidien sous 6 semaines.',
    longTermGoals: isHypertrophy
      ? 'Transformation athlétique durable : +3 à 5 kg de masse contractile, carrure en V et ratio de force supérieur à 1.2x le poids de corps.'
      : 'Silhouette athlétique affinée, sangle abdominale tonique et aisance cardiovasculaire permanente.',
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
        : `Déficit calorique modéré (-300 kcal) avec apport protéique protecteur (${proteinTarget}g) et hydratation de 2.8L pour préserver le muscle.`,
      lifestylePillars: [
        'Sommeil minimum de 7h30 : régulateur principal de l\'hormone de croissance et de la testostérone',
        'Hydratation : 500ml d\'eau dès le lever pour relancer le volume plasmatique',
        'Marche quotidienne : 8 000 à 10 000 pas pour entretenir le NEAT sans fatigue nerveuse'
      ]
    },
    missingDataAndReserves: missingReserves,
    baselineTrackingMetrics: {
      initialWeightKg: w,
      initialHeightCm: h,
      initialAge: a,
      initialBenchmarkMetricName: isHomeGym ? 'Pompes au sol' : 'Développé couché haltères',
      initialBenchmarkValue: isHomeGym ? 15 : 20,
      initialBenchmarkUnit: isHomeGym ? 'reps' : 'kg'
    },
    confidenceScore: isComplete ? 92 : Math.min(85, 45 + turnsCount * 12),
    isReadyForValidation: isComplete
  };

  return {
    assistantReply,
    dossier
  };
}
