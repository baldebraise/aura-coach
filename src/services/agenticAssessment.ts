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

  // Try Gemini 2.5 Flash via Firebase AI Logic
  try {
    const { app } = initializeFirebaseApp();
    if (app) {
      const ai = getAI(app);
      const model = getGenerativeModel(ai, { model: 'gemini-2.5-flash' });

      const prompt = `Tu es le Directeur Scientifique et Entraîneur de Performance de l'application AURA.
Tu échanges avec un athlète pour son cadrage initial.

RÈGLES ABSOLUES DU DIALOGUE :
1. POSE LES QUESTIONS STRICTEMENT UNE À UNE. Ne pose JAMAIS deux questions dans la même réponse. Ne fais AUCUNE liste à puces de questions.
2. Réagis d'abord brièvement à ce que l'athlète vient d'exprimer (1-2 phrases courtes, valorisantes, techniques et empathiques).
3. Pose ensuite LA SEULE ET UNIQUE question suivante pour approfondir son profil :
   - Étape 1 : Son objectif principal et sa motivation (s'il ne l'a pas encore dit).
   - Étape 2 : Son passé sportif et son niveau actuel (débutant, reprise, années de muscu, sports pratiqués).
   - Étape 3 : Son métier et son rythme de vie au quotidien (bureau/assis, physique/debout, sommeil et niveau de fatigue).
   - Étape 4 : Ses disponibilités réelles (nombre de séances par semaine) et son matériel/lieu (salle de musculation complète, maison avec haltères, ou poids du corps).
   - Étape 5 : Ses éventuelles douleurs, articulations sensibles ou blessures passées (épaules, dos, genoux...) et son gabarit approximatif (âge, taille, poids).
4. NE PROPOSE LA VALIDATION SEULEMENT QUAND C'EST FINI :
   - Tant que toutes ces dimensions n'ont pas été abordées (${userTurns < 4 && !isFinishingRequested ? 'actuellement ' + userTurns + ' échanges seulement' : 'sauf si l\'athlète a déjà tout expliqué ou qu\'au moins 4-5 échanges ont eu lieu'}), "isReadyForValidation" DOIT ÊTRE false.
   - Quand "isReadyForValidation" est false : ton "assistantReply" pose uniquement la prochaine question ciblée (1 question seulement).
   - Quand "isReadyForValidation" est true : ton "assistantReply" annonce chaleureusement que le diagnostic est terminé et que son dossier complet d'entraînement et de nutrition a été généré ci-dessous.

Voici l'historique complet de la discussion :
${fullConversationText}

Tu dois impérativement répondre au format JSON strict suivant (sans balises de code ni texte autour) :
{
  "assistantReply": "Ton message : réaction concise + EXACTEMENT UNE SEULE QUESTION si isReadyForValidation est false, ou annonce enthousiaste du dossier final si isReadyForValidation est true.",
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
    console.warn("Gemini agentic turn fallback:", err);
  }

  // Intelligent Contextual Sports-Science Fallback Engine
  return generateContextualFallbackDossier(dialogueHistory, currentProfile, previousDossier);
}

function generateContextualFallbackDossier(
  dialogueHistory: Array<{ role: 'user' | 'assistant'; text: string }>,
  currentProfile: UserProfile,
  previousDossier?: AgenticAthleticDossier
): AgenticTurnResult {
  const allUserText = dialogueHistory
    .filter((m) => m.role === 'user')
    .map((m) => m.text)
    .join(' ');
  const lower = allUserText.toLowerCase();
  const turnsCount = dialogueHistory.filter((m) => m.role === 'user').length;
  const isFinishingRequested = /(?:fini|terminer|valid|prêt|c'est bon|générer|tout dit)/i.test(lower);

  // Check what has already been covered
  const hasGoal = /(?:muscle|masse|force|perte|gras|sécher|seche|kilos|silhouette|forme|endurance|cardio|recomposition|santé|vitalité|puissance)/i.test(lower);
  const hasHistory = /(?:débutant|reprise|expérience|jamais|pratique|ans|année|musculation|crossfit|course|vélo|natation|foot|sport)/i.test(lower);
  const hasLifestyle = /(?:bureau|assis|debout|travail|métier|sédentaire|sommeil|dors|dort|fatigue|rythme|énergie|nuit)/i.test(lower);
  const hasAvailability = /(?:séance|fois|jour|semaine|lundi|mercredi|vendredi|salle|basic|fitness|maison|domicile|haltère|poids du corps)/i.test(lower);
  const hasHealthStats = /(?:douleur|blessure|mal|sensib|épaule|epaule|genou|dos|lombaire|tendon|pèse|poids|taille|kg|cm|ans)/i.test(lower);

  // Extraction de données physiques réelles
  let age = previousDossier?.baselineTrackingMetrics.initialAge || currentProfile.age;
  const ageMatch = lower.match(/(?:j'ai|age|âgé de|age de)?\s*(\d{2})\s*(?:ans|an)\b/i) || lower.match(/\b(\d{2})\s*ans\b/i);
  if (ageMatch) age = parseInt(ageMatch[1]);

  let weight = previousDossier?.baselineTrackingMetrics.initialWeightKg || currentProfile.weightKg;
  const weightMatch = lower.match(/(?:pèse|poids|fais)?\s*(\d{2,3}(?:[.,]\d)?)\s*(?:kg|kilos|kilo)\b/i);
  if (weightMatch) weight = parseFloat(weightMatch[1].replace(',', '.'));

  let height = previousDossier?.baselineTrackingMetrics.initialHeightCm || currentProfile.heightCm;
  const heightMetersMatch = lower.match(/\b(1)[m,.](\d{2})\b/i);
  if (heightMetersMatch) {
    height = 100 + parseInt(heightMetersMatch[2]);
  } else {
    const heightCmMatch = lower.match(/\b(1[4-9]\d|2[0-1]\d)\s*(?:cm)?\b/);
    if (heightCmMatch && lower.includes('cm')) height = parseInt(heightCmMatch[1]);
  }

  // Détection des douleurs / antécédents
  const injuries: string[] = [];
  if (lower.includes('genou')) injuries.push('Sensibilité aux genoux');
  if (lower.includes('épaule') || lower.includes('epaule')) injuries.push('Instabilité ou gêne aux épaules');
  if (lower.includes('dos') || lower.includes('lombaire')) injuries.push('Tension des lombaires');
  if (lower.includes('poignet')) injuries.push('Faiblesse des poignets');

  // Objectif & orientation
  let isStrength = lower.includes('force') || lower.includes('lourd') || lower.includes('puissance');
  let isHypertrophy = lower.includes('masse') || lower.includes('muscle') || lower.includes('volume') || lower.includes('grossir');
  let isFatLoss = lower.includes('gras') || lower.includes('sécher') || lower.includes('seche') || lower.includes('perdre du poids') || lower.includes('cardio');

  let splitName = 'Upper / Lower (4 séances / semaine)';
  let daysPerWeek = 4;
  if (lower.includes('3 fois') || lower.includes('3 séances') || lower.includes('3j')) {
    splitName = 'Full Body Athlétique (3 séances / semaine)';
    daysPerWeek = 3;
  } else if (lower.includes('5 fois') || lower.includes('5 séances') || lower.includes('5j')) {
    splitName = 'Push / Pull / Legs (5 séances / semaine)';
    daysPerWeek = 5;
  }

  const w = weight || 75;
  const h = height || 178;
  const a = age || 28;

  // Calcul BMR & cibles
  const bmr = Math.round(10 * w + 6.25 * h - 5 * a + 5);
  const tdee = Math.round(bmr * (daysPerWeek >= 4 ? 1.55 : 1.4));
  const calorieTarget = isHypertrophy ? tdee + 250 : isFatLoss ? tdee - 350 : tdee;
  const proteinTarget = Math.round(w * (isFatLoss ? 2.2 : 2.0));

  // Détermination de la progression et de la prochaine question unique (UNE SEULE QUESTION À LA FOIS)
  let assistantReply = "";
  let isReadyForValidation = false;

  const isComplete = turnsCount >= 4 || isFinishingRequested || (hasGoal && hasHistory && hasLifestyle && hasAvailability && hasHealthStats);

  if (isComplete) {
    isReadyForValidation = true;
    assistantReply = `C'est un excellent cadrage. J'ai réuni l'ensemble des éléments clés sur ton mode de vie, tes antécédents et tes objectifs.

J'ai généré ton Dossier de Cadrage Athlétique personnalisé ci-dessous. Explore les onglets, choisis l'option de répartition qui te convient le mieux, et valide ton plan pour démarrer ton suivi en direct !`;
  } else if (!hasGoal) {
    assistantReply = `C'est un plaisir d'échanger avec toi. Quel est le grand objectif physique ou sportif qui te motive le plus en ce moment ?`;
  } else if (!hasHistory) {
    assistantReply = `C'est un excellent cap. Pour calibrer précisément l'intensité et le volume de travail : quel est ton passé sportif et ton niveau actuel ? (Tu débutes en musculation, tu pratiques déjà régulièrement, ou c'est une reprise après une pause ?)`;
  } else if (!hasLifestyle) {
    assistantReply = `C'est bien noté. Pour que le programme s'intègre parfaitement à ton quotidien sans épuiser ta récupération : à quoi ressemble ton rythme de vie professionnel (travail sédentaire de bureau ou travail physique debout) et comment qualifierais-tu ton sommeil ?`;
  } else if (!hasAvailability) {
    assistantReply = `Compris, ce paramètre est capital pour la régularité. Côté organisation : combien de séances par semaine peux-tu réellement consacrer à tes entraînements, et dans quel cadre vas-tu t'entraîner (salle de sport équipée, à domicile avec matériel, ou sans équipement) ?`;
  } else if (!hasHealthStats) {
    assistantReply = `Très clair. Sur le plan corporel et articulaire : as-tu des sensibilités ou d'anciennes blessures à préserver (épaules, genoux, dos...) ? Et si tu les connais, quel est ton gabarit approximatif (taille, poids et âge) ?`;
  } else {
    isReadyForValidation = true;
    assistantReply = `Parfait, j'ai maintenant toutes les données nécessaires pour structurer ton plan sur mesure. Ton Dossier de Cadrage Athlétique est prêt ci-dessous. Découvre tes cibles et valide dès que tu es prêt à attaquer !`;
  }

  const recommendedTests: RecommendedTestPlan[] = [
    {
      id: 'test-upper',
      name: 'Test de Force Poussée & Tirage Haut du Corps',
      targetMetric: 'Répétitions max ou charge de travail (kg)',
      rationale: 'Permet d\'étalonner le volume de vos séries de développé et tirage sans risquer la blessure scapulaire.'
    },
    {
      id: 'test-lower',
      name: 'Test de Puissance & Mobilité Chaîne Postérieure',
      targetMetric: 'Répétitions max au squat gobelet ou fentes',
      rationale: 'Nécessaire pour vérifier la stabilité du bassin et la trajectoire du genou.'
    }
  ];

  if (isFatLoss || lower.includes('cardio') || lower.includes('endurance') || lower.includes('vma')) {
    recommendedTests.push({
      id: 'test-cardio',
      name: 'Test Aérobie & Récupération Cardiaque (6 min)',
      targetMetric: 'Distance totale (m) ou Fréquence cardiaque de récupération',
      rationale: 'Calibre vos allures et vos temps de récupération entre les séries lourdes.'
    });
  }

  const trainingOptions: TrainingPlanOption[] = [
    {
      title: 'Option A • Recommandée',
      splitType: splitName,
      frequencyDays: daysPerWeek,
      description: 'Optimise la récupération nerveuse et la synthèse protéique musculaire.'
    },
    {
      title: 'Option B • Flexible',
      splitType: daysPerWeek === 4 ? 'Full Body Athlétique' : 'Upper / Lower',
      frequencyDays: daysPerWeek === 4 ? 3 : 4,
      description: 'Alternative en cas d\'imprévu professionnel ou familial.'
    }
  ];

  const sessionsDraft: PlannedSessionDraft[] = [
    {
      title: 'Séance 1 • Haut du Corps (Force & Hypertrophie)',
      focus: 'Pectoraux, Grand Dorsal, Deltoïdes',
      durationMin: 60,
      exercisesPreview: ['Développé couché haltères', 'Tractions pronation', 'Développé militaire', 'Rowing unilatéral']
    },
    {
      title: 'Séance 2 • Bas du Corps & Chaîne Postérieure',
      focus: 'Quadriceps, Ischio-jambiers, Fessiers',
      durationMin: 60,
      exercisesPreview: ['Goblet Squat', 'Soulevé de terre roumain', 'Fentes marchées', 'Gainage planche']
    }
  ];

  if (daysPerWeek >= 3) {
    sessionsDraft.push({
      title: 'Séance 3 • Puissance & Volume Tronc',
      focus: 'Dos, Bras & Ceinture Abdominale',
      durationMin: 55,
      exercisesPreview: ['Dips barres parallèles', 'Tirage poitrine poulie', 'Curl haltères', 'Relevé de genoux']
    });
  }

  const missingReserves = [];
  if (!weight || !height) {
    missingReserves.push({
      missingPoint: 'Taille ou poids exact non précisé',
      howToObtain: 'Mesure à jeun le matin au réveil pour calibrer les ratios de force relative.'
    });
  }
  missingReserves.push({
    missingPoint: 'Endurance de force musculaire initiale',
    howToObtain: 'Sera mesurée précisément dès votre premier test physique dans le Studio AURA.'
  });

  const dossier: AgenticAthleticDossier = {
    physicalConditionSummary: `Athlète de ${a} ans (${w} kg, ${h} cm) disposant d'une base propice à la progression. ${injuries.length > 0 ? `Points d'attention biomécaniques : ${injuries.join(', ')}.` : 'Aucune contre-indication articulaire majeure déclarée.'} Le profil nécessite une surcharge progressive contrôlée pour stimuler l'hypertrophie myofibrillaire sans saturation nerveuse.`,
    recommendedTests,
    shortTermGoals: isHypertrophy 
      ? 'Consolidation technique sur les 4 mouvements piliers, acquisition du rythme d\'exécution (tempo 3-0-1-0) et gain de 1 à 1.5 kg de masse maigre en 6 semaines.'
      : 'Augmentation de 15% de la force contractile sur les séries de travail et régulation du rythme de récupération.',
    longTermGoals: isHypertrophy
      ? 'Transformation athlétique durable : +3 à 5 kg de masse musculaire dense, équilibre postural parfait et amélioration des performances 1RM.'
      : 'Atteinte d\'un niveau athlétique robuste avec ratio de force relative supérieur à 1.2x le poids de corps au développé couché.',
    expectedOutcomes: `Gain notable en densité musculaire, diminution des douleurs d'inconfort au bureau, et augmentation de 20% de l'endurance à l'effort sous 8 semaines.`,
    trainingPlanDraft: {
      splitName,
      rationale: `La fréquence de ${daysPerWeek} séances permet de stimuler chaque chaîne musculaire deux fois par tranche de 7 jours, ce qui constitue le gold standard de la littérature en physiologie de l'exercice.`,
      options: trainingOptions,
      sessions: sessionsDraft
    },
    nutritionLifestyleDraft: {
      dailyCaloriesTarget: calorieTarget,
      proteinGramsTarget: proteinTarget,
      waterLitersTarget: Math.round((w * 0.035 + 0.8) * 10) / 10,
      nutritionStrategy: isHypertrophy 
        ? `Léger surplus de +250 kcal avec saturation glycogénique péri-séance et ${proteinTarget}g de protéines réparties en 3 à 4 prises.`
        : `Maintenance isocalorique orientée recomposition avec apport protéique strict (${proteinTarget}g) et hydratation soutenue.`,
      lifestylePillars: [
        'Sommeil régulier de 7h30 à 8h : premier facteur anabolique naturel',
        'Repas pré-séance 2h avant l\'effort (glucides lents + 30g protéines)',
        'Hydratation minimale de 2.5L à 3L les jours d\'entraînement'
      ]
    },
    missingDataAndReserves: missingReserves,
    baselineTrackingMetrics: {
      initialWeightKg: w,
      initialHeightCm: h,
      initialAge: a,
      initialBenchmarkMetricName: 'Pompes strictes au sol',
      initialBenchmarkValue: 15,
      initialBenchmarkUnit: 'reps'
    },
    confidenceScore: isReadyForValidation ? 90 : Math.min(80, 40 + turnsCount * 12),
    isReadyForValidation: isReadyForValidation
  };

  return {
    assistantReply,
    dossier
  };
}
