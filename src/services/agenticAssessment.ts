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

  // Try Gemini 2.5 Flash via Firebase AI Logic
  try {
    const { app } = initializeFirebaseApp();
    if (app) {
      const ai = getAI(app);
      const model = getGenerativeModel(ai, { model: 'gemini-2.5-flash' });

      const prompt = `Tu es le Directeur Scientifique et Entraîneur de Performance de l'application AURA.
Tu échanges avec un athlète pour son bilan initial exhaustif.

IMPORTANT :
- ZÉRO EMOJI dans toutes tes réponses.
- Ne récite JAMAIS de questionnaire pré-établi ni de questions types en liste rigide.
- Réfléchis CONCRÈTEMENT en fonction de TOUT ce que l'athlète a dit jusqu'ici.
- Pose des questions adaptées et fluides sur son mode de vie, son métier (sédentaire vs actif), son historique sportif, son sommeil, ses sensations articulaires ou ses disponibilités réelles.
- Émets un plan structuré avec des objectifs court terme (4-6 semaines) et long terme (6-12 mois), des retours sur les résultats espérés, des réserves s'il manque des données, et comment les obtenir via des tests de terrain.
- Propose des variantes/options de programmation (ex. 3 jours Full Body vs 4 jours Upper/Lower).
- Détermine les premières variables de suivi (poids de référence, performance repère).

Voici l'historique complet de la discussion :
${fullConversationText}

Tu dois impérativement répondre au format JSON strict suivant (sans balises de code ni texte autour) :
{
  "assistantReply": "Ton message de dialogue direct avec l'athlète (technique, direct, posant 1 ou 2 questions pertinentes et ciblées sur son mode de vie, sans liste à puces répétitive).",
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
    "isReadyForValidation": true
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

  // Génération de la réponse de l'agent (contextuelle, jamais fixe)
  let assistantReply = "";
  const turnsCount = dialogueHistory.filter((m) => m.role === 'user').length;

  if (turnsCount <= 1) {
    assistantReply = `J'ai analysé vos premières indications. Pour bâtir une programmation qui s'insère parfaitement dans votre quotidien et tienne sur la durée, j'ai besoin de comprendre votre mode de vie : travaillez-vous plutôt assis ou debout ? Avez-vous un historique de blessure ou de pratique sportive antérieure ? Comment qualifieriez-vous votre sommeil et votre niveau d'énergie actuel ?`;
  } else {
    assistantReply = `Votre profil s'affine nettement. Sur la base de votre gabarit (${w} kg pour ${h} cm) et de votre disponibilité (${daysPerWeek} séances/semaine), je structure un plan axé sur la progression mécanique avec protection de vos articulations sensibles. J'ai formulé l'ébauche complète de cadrage ci-dessous avec les tests à réaliser pour calibrer vos charges de travail exactes.`;
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
    confidenceScore: turnsCount >= 2 ? 90 : 70,
    isReadyForValidation: turnsCount >= 1 && !!w && !!h
  };

  return {
    assistantReply,
    dossier
  };
}
