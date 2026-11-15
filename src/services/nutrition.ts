import { UserProfile, MacroTarget } from '../types';
import { initializeFirebaseApp } from './firebase';
import { getAI, getGenerativeModel } from 'firebase/ai';

export function calculateNutritionTargets(profile: UserProfile, isWorkoutDay: boolean): MacroTarget {
  const weight = profile.weightKg || 75;
  const height = profile.heightCm || 175;
  const age = profile.age || 28;
  const isFemale = profile.gender === 'female';

  // 1. Calcul du BMR (Mifflin - St Jeor)
  const bmr = isFemale
    ? Math.round(10 * weight + 6.25 * height - 5 * age - 161)
    : Math.round(10 * weight + 6.25 * height - 5 * age + 5);

  // 2. Facteur d'activité (TDEE)
  let activityMultiplier = 1.45;
  const days = profile.weeklyAvailabilityDays || 3;
  if (days <= 2) activityMultiplier = 1.35;
  else if (days === 3 || days === 4) activityMultiplier = 1.55;
  else if (days >= 5) activityMultiplier = 1.725;

  const tdee = Math.round(bmr * activityMultiplier);

  // 3. Delta selon l'objectif prioritaire
  let goalDelta = 0;
  let proteinPerKg = 2.0;

  switch (profile.primaryGoal) {
    case 'muscle_gain':
      goalDelta = +300; // Léger surplus calorique anabolique
      proteinPerKg = 2.0;
      break;
    case 'strength':
      goalDelta = +150;
      proteinPerKg = 2.0;
      break;
    case 'endurance': // Perte de gras / sèche tout en préservant le muscle
      goalDelta = -350;
      proteinPerKg = 2.2; // Protéines plus élevées pour préserver la masse maigre en déficit
      break;
    case 'recomposition':
      goalDelta = 0; // Maintenance isocalorique
      proteinPerKg = 2.0;
      break;
    case 'mobility_health':
    default:
      goalDelta = 0;
      proteinPerKg = 1.8;
      break;
  }

  // 4. Cyclage énergétique (Jour d'entraînement vs Jour de repos)
  // +150 kcal les jours d'effort pour saturer le glycogène, -150 kcal les jours de repos
  const cyclingDelta = isWorkoutDay ? +150 : -150;
  const totalCalories = Math.max(1400, Math.round(tdee + goalDelta + cyclingDelta));

  // 5. Répartition des macronutriments
  const proteinGrams = Math.round(weight * proteinPerKg);
  const proteinCalories = proteinGrams * 4;

  // Lipides : 0.85g à 1.0g / kg pour l'équilibre hormonal
  const fatGrams = Math.max(45, Math.round(weight * 0.9));
  const fatCalories = fatGrams * 9;

  // Glucides : reliquat calorique
  const remainingCalories = Math.max(200, totalCalories - proteinCalories - fatCalories);
  const carbsGrams = Math.round(remainingCalories / 4);

  // Hydratation : 35ml / kg + surplus d'effort
  const waterLiters = Math.round((weight * 0.035 + (isWorkoutDay ? 0.8 : 0.3)) * 10) / 10;

  return {
    calories: totalCalories,
    proteinGrams,
    carbsGrams,
    fatGrams,
    waterLiters,
    isWorkoutDay,
    bmr,
    tdee,
    goalDeltaCalories: goalDelta
  };
}

export function generateNutritionSummaryAdvice(
  profile: UserProfile, 
  isWorkoutDay: boolean, 
  todaySessionTitle?: string
): { title: string; advice: string; periFocus: string } {
  const goal = profile.primaryGoal || 'recomposition';
  const weight = profile.weightKg || 70;
  const proteinTarget = Math.round(weight * 2.0);

  if (isWorkoutDay) {
    return {
      title: todaySessionTitle ? `Jour d'entraînement : ${todaySessionTitle}` : "Jour d'entraînement actif",
      advice: `Augmentez l'apport en glucides complexes et visez ${proteinTarget}g de protéines réparties sur 3-4 prises pour maximiser la synthèse protéique.`,
      periFocus: "Repas pré-séance 2h avant (riz/avoine + 30g protéines) • Réhydratation immédiate après l'effort."
    };
  } else {
    return {
      title: "Jour de récupération active",
      advice: `Priorité à la réparation musculaire et au sommeil. Réduisez légèrement les glucides rapides au profit de légumes riches en micronutriments et graisses saines.`,
      periFocus: "Hydratation continue (eau minérale/tisane) • Maintien de l'apport en protéines (${proteinTarget}g) pour la reconstruction."
    };
  }
}

export async function analyzeMealAgentically(
  userText: string,
  profile: UserProfile,
  isWorkoutDay: boolean
): Promise<{
  estimatedCalories: number;
  estimatedProteinGrams: number;
  estimatedCarbsGrams: number;
  estimatedFatGrams: number;
  feedbackText: string;
  actionTips: string[];
}> {
  const lower = userText.toLowerCase();

  // Try Firebase AI Logic (Gemini 2.5 Flash) first
  try {
    const { app } = initializeFirebaseApp();
    if (app) {
      const ai = getAI(app);
      const model = getGenerativeModel(ai, { model: 'gemini-2.5-flash' });
      const prompt = `Tu es l'analyste nutritionnel sportif et bienveillant de l'application d'entraînement AURA.
L'athlète te décrit en texte libre son repas ou pose une question nutritionnelle : "${userText}".
Profil athlète :
- Poids : ${profile.weightKg || 75} kg
- Objectif : ${profile.primaryGoal || 'recomposition'}
- Statut du jour : ${isWorkoutDay ? "Jour d'entraînement" : "Jour de repos/récupération"}

Fournis une réponse au format JSON strict avec les clés suivantes :
{
  "estimatedCalories": number,
  "estimatedProteinGrams": number,
  "estimatedCarbsGrams": number,
  "estimatedFatGrams": number,
  "feedbackText": string (explication concise, encourageante et technique en 2 ou 3 phrases),
  "actionTips": [string, string] (2 conseils d'optimisation concrets et sans rigidité)
}
Ne génère que le JSON pur, sans balises markdown ni texte superflu.`;

      const response = await model.generateContent(prompt);
      const rawText = response?.response?.text() || '';
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed && typeof parsed.estimatedCalories === 'number') {
        return {
          estimatedCalories: Math.round(parsed.estimatedCalories),
          estimatedProteinGrams: Math.round(parsed.estimatedProteinGrams || 25),
          estimatedCarbsGrams: Math.round(parsed.estimatedCarbsGrams || 40),
          estimatedFatGrams: Math.round(parsed.estimatedFatGrams || 15),
          feedbackText: parsed.feedbackText,
          actionTips: Array.isArray(parsed.actionTips) ? parsed.actionTips : ['Maintenir une bonne hydratation']
        };
      }
    }
  } catch (err) {
    console.warn('Gemini nutrition fallback:', err);
  }

  // Local Intelligent Sports-Science Fallback Extractor
  let calories = 550;
  let protein = 30;
  let carbs = 55;
  let fat = 16;
  const tips: string[] = [];

  // Proteins detection
  if (lower.includes('poulet') || lower.includes('dinde') || lower.includes('blanc de poulet')) {
    protein += 25;
    calories += 130;
    tips.push("Excellente source de protéines maigres à haute valeur biologique.");
  } else if (lower.includes('oeuf') || lower.includes('œufs') || lower.includes('omelette')) {
    protein += 18;
    fat += 14;
    calories += 200;
    tips.push("Profil complet en acides aminés et excellente source de choline.");
  } else if (lower.includes('steak') || lower.includes('boeuf') || lower.includes('viande')) {
    protein += 28;
    fat += 12;
    calories += 240;
    tips.push("Riche en fer héminique et créatine naturelle.");
  } else if (lower.includes('saumon') || lower.includes('thon') || lower.includes('poisson')) {
    protein += 24;
    fat += 10;
    calories += 200;
    tips.push("Apport optimal en oméga-3 anti-inflammatoires.");
  } else if (lower.includes('shaker') || lower.includes('whey') || lower.includes('protéine')) {
    protein += 26;
    calories += 120;
    tips.push("Assimilation rapide idéale en post-entraînement.");
  }

  // Carbs detection
  if (lower.includes('riz') || lower.includes('basmati')) {
    carbs += 45;
    calories += 190;
    tips.push("Glucides complexes digestes, parfaits pour recharger le glycogène.");
  } else if (lower.includes('pâtes') || lower.includes('pates') || lower.includes('spaghetti')) {
    carbs += 50;
    calories += 220;
  } else if (lower.includes('flocons') || lower.includes('avoine') || lower.includes('porridge')) {
    carbs += 40;
    protein += 6;
    calories += 210;
    tips.push("Index glycémique modéré et fibres solubles (bêta-glucanes).");
  } else if (lower.includes('banane') || lower.includes('pomme') || lower.includes('fruit')) {
    carbs += 25;
    calories += 100;
  }

  // Veggies / Healthy Fats
  if (lower.includes('légume') || lower.includes('salade') || lower.includes('brocoli') || lower.includes('haricot')) {
    tips.push("Bon apport en fibres et micronutriments favorisant la satiété.");
  }
  if (lower.includes('avocat') || lower.includes('huile d olive') || lower.includes('amandes') || lower.includes('noix')) {
    fat += 10;
    calories += 90;
  }

  if (tips.length === 0) {
    tips.push("Pensez à associer une source de protéines à chaque prise principale.");
    tips.push("Hydratez-vous avec au moins un grand verre d'eau autour de ce repas.");
  }

  return {
    estimatedCalories: calories,
    estimatedProteinGrams: protein,
    estimatedCarbsGrams: carbs,
    estimatedFatGrams: fat,
    feedbackText: `Repas cohérent avec vos besoins actuels (${profile.primaryGoal || 'forme athlétique'}). Les macronutriments sont bien équilibrés pour soutenir votre métabolisme.`,
    actionTips: tips.slice(0, 2)
  };
}
