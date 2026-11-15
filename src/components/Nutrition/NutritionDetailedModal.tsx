import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, DailyHabits } from '../../types';
import { calculateNutritionTargets, analyzeMealAgentically } from '../../services/nutrition';
import { sounds } from '../../utils/audio';
import { 
  X, 
  Bot, 
  Sparkles, 
  Send, 
  Flame, 
  Droplet, 
  Clock, 
  Utensils, 
  CheckCircle2, 
  Info, 
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Scale
} from 'lucide-react';

interface NutritionDetailedModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  dailyHabits: DailyHabits;
  onUpdateHabits: (updated: DailyHabits) => void;
  isWorkoutDay: boolean;
  sessionTitle?: string;
}

export const NutritionDetailedModal: React.FC<NutritionDetailedModalProps> = ({
  isOpen,
  onClose,
  profile,
  dailyHabits,
  onUpdateHabits,
  isWorkoutDay,
  sessionTitle
}) => {
  const [activeTab, setActiveTab] = useState<'macros' | 'peri' | 'assistant' | 'portions'>('macros');
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatLog, setChatLog] = useState<Array<{
    id: string;
    sender: 'user' | 'assistant';
    text: string;
    nutritionEstimate?: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      actionTips: string[];
    };
  }>>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Bonjour ${profile.name || 'Athlète'}. Décrivez-moi un repas en texte libre (ex: "200g de poulet, 150g de riz basmati, brocolis et 1 filet d'huile d'olive") ou posez-moi une question sur votre alimentation d'aujourd'hui. J'analyse vos apports sans formulaire rigide.`
    }
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollChatToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'assistant') {
      scrollChatToBottom();
    }
  }, [chatLog, isAnalyzing, activeTab]);

  if (!isOpen) return null;

  const targets = calculateNutritionTargets(profile, isWorkoutDay);

  const goalLabels: Record<string, string> = {
    muscle_gain: 'Prise de masse & Hypertrophie (+300 kcal)',
    strength: 'Développement de la force (+150 kcal)',
    recomposition: 'Recomposition corporelle (Isocalorique)',
    endurance: 'Sèche & Perte de masse grasse (-350 kcal)',
    mobility_health: 'Maintien & Santé globale (Isocalorique)'
  };

  const handleSendMealAnalysis = async () => {
    if (!inputText.trim() || isAnalyzing) return;
    const textToSend = inputText.trim();
    setInputText('');

    setChatLog((prev) => [
      ...prev,
      { id: 'user-' + Date.now(), sender: 'user', text: textToSend }
    ]);

    setIsAnalyzing(true);
    try {
      const result = await analyzeMealAgentically(textToSend, profile, isWorkoutDay);
      setChatLog((prev) => [
        ...prev,
        {
          id: 'assistant-' + Date.now(),
          sender: 'assistant',
          text: result.feedbackText,
          nutritionEstimate: {
            calories: result.estimatedCalories,
            protein: result.estimatedProteinGrams,
            carbs: result.estimatedCarbsGrams,
            fat: result.estimatedFatGrams,
            actionTips: result.actionTips
          }
        }
      ]);
      sounds.playTick();
    } catch {
      setChatLog((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'assistant',
          text: "J'ai bien noté votre repas. Veillez à maintenir une bonne hydratation et un apport régulier en protéines."
        }
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddProteinToDaily = (grams: number) => {
    const current = dailyHabits.proteinGramsConsumed || 0;
    onUpdateHabits({
      ...dailyHabits,
      proteinGramsConsumed: current + grams,
      proteinAdequate: (current + grams) >= (targets.proteinGrams * 0.8)
    });
    sounds.playRecordBeaten();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full sm:max-w-2xl bg-zinc-950 border border-zinc-800 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col h-[100dvh] sm:h-[86vh] max-h-[100dvh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800/80 flex items-center justify-between shrink-0 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-zinc-100">Nutrition & Métabolisme Athlétique</h2>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  isWorkoutDay 
                    ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-400' 
                    : 'bg-indigo-950/60 border-indigo-800/80 text-indigo-400'
                }`}>
                  {isWorkoutDay ? "Jour d'Entraînement" : 'Jour de Repos'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Cibles personnalisées basées sur vos métriques réelles ({profile.weightKg || 75} kg)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/30 px-3 shrink-0">
          <button
            onClick={() => setActiveTab('macros')}
            className={`py-2.5 px-3.5 text-xs font-semibold border-b-2 transition ${
              activeTab === 'macros'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Cibles & Métabolisme
          </button>
          <button
            onClick={() => setActiveTab('assistant')}
            className={`py-2.5 px-3.5 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'assistant'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Assistant Repas IA</span>
          </button>
          <button
            onClick={() => setActiveTab('peri')}
            className={`py-2.5 px-3.5 text-xs font-semibold border-b-2 transition ${
              activeTab === 'peri'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Timing Péri-Séance
          </button>
          <button
            onClick={() => setActiveTab('portions')}
            className={`py-2.5 px-3.5 text-xs font-semibold border-b-2 transition ${
              activeTab === 'portions'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Repères Visuels
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* TAB 1: MACROS & METABOLISM */}
          {activeTab === 'macros' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Daily Energy Summary Card */}
              <div className="p-4 bg-gradient-to-br from-emerald-950/30 via-zinc-900/60 to-zinc-950 border border-emerald-800/60 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-zinc-100">Dépense & Cible Énergétique du Jour</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
                    {profile.primaryGoal ? goalLabels[profile.primaryGoal] : 'Équilibre'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 pt-2">
                  <div className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-xl text-center">
                    <span className="text-[10px] font-mono uppercase text-zinc-500 block">BMR (Basal)</span>
                    <span className="text-sm font-bold font-mono text-zinc-200">{targets.bmr}</span>
                    <span className="text-[9px] text-zinc-500 block">kcal/jour</span>
                  </div>
                  <div className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-xl text-center">
                    <span className="text-[10px] font-mono uppercase text-zinc-500 block">TDEE (Maintien)</span>
                    <span className="text-sm font-bold font-mono text-zinc-200">{targets.tdee}</span>
                    <span className="text-[9px] text-zinc-500 block">kcal/jour</span>
                  </div>
                  <div className="p-3 bg-emerald-950/60 border border-emerald-700/80 rounded-xl text-center">
                    <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">Cible du Jour</span>
                    <span className="text-base font-black font-mono text-emerald-300">{targets.calories}</span>
                    <span className="text-[9px] text-emerald-400 block">kcal</span>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-400 mt-3 leading-relaxed">
                  {isWorkoutDay 
                    ? `Jour d'entraînement actif (+150 kcal cyclées) : vos réserves de glycogène sont prioritaires pour soutenir l'intensité et la synthèse musculaire.` 
                    : `Jour de repos (-150 kcal cyclées) : le corps utilise préférentiellement les lipides et focalise l'énergie sur la récupération articulaire et nerveuse.`}
                </p>
              </div>

              {/* 4 Macros Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* Protein */}
                <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Protéines</span>
                    <span className="text-[10px] font-mono text-emerald-400">4 kcal/g</span>
                  </div>
                  <div className="text-xl font-black font-mono text-zinc-100">
                    {targets.proteinGrams}<span className="text-xs text-zinc-500 ml-0.5">g</span>
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    {targets.proteinGrams * 4} kcal • ~{Math.round((targets.proteinGrams * 4 / targets.calories) * 100)}%
                  </div>
                  <div className="text-[10px] text-emerald-400/90 font-mono pt-1">
                    ~{(targets.proteinGrams / (profile.weightKg || 75)).toFixed(1)}g / kg
                  </div>
                </div>

                {/* Carbs */}
                <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Glucides</span>
                    <span className="text-[10px] font-mono text-cyan-400">4 kcal/g</span>
                  </div>
                  <div className="text-xl font-black font-mono text-zinc-100">
                    {targets.carbsGrams}<span className="text-xs text-zinc-500 ml-0.5">g</span>
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    {targets.carbsGrams * 4} kcal • ~{Math.round((targets.carbsGrams * 4 / targets.calories) * 100)}%
                  </div>
                  <div className="text-[10px] text-cyan-400/90 font-mono pt-1">
                    Énergie contractile
                  </div>
                </div>

                {/* Fats */}
                <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Lipides</span>
                    <span className="text-[10px] font-mono text-amber-400">9 kcal/g</span>
                  </div>
                  <div className="text-xl font-black font-mono text-zinc-100">
                    {targets.fatGrams}<span className="text-xs text-zinc-500 ml-0.5">g</span>
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    {targets.fatGrams * 9} kcal • ~{Math.round((targets.fatGrams * 9 / targets.calories) * 100)}%
                  </div>
                  <div className="text-[10px] text-amber-400/90 font-mono pt-1">
                    Hormones & articulations
                  </div>
                </div>

                {/* Water */}
                <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Eau</span>
                    <Droplet className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="text-xl font-black font-mono text-zinc-100">
                    {targets.waterLiters}<span className="text-xs text-zinc-500 ml-0.5">L</span>
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    35ml/kg + effort
                  </div>
                  <div className="text-[10px] text-blue-400/90 font-mono pt-1">
                    Hydratation cellulaire
                  </div>
                </div>
              </div>

              {/* Protein Daily Intake Progress */}
              <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-200">Suivi des Protéines du Jour</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {dailyHabits.proteinGramsConsumed || 0}g / {targets.proteinGrams}g
                  </span>
                </div>
                <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (((dailyHabits.proteinGramsConsumed || 0) / targets.proteinGrams) * 100))}%`
                    }}
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-zinc-500">Ajout rapide :</span>
                  <div className="flex items-center gap-1.5">
                    {[15, 25, 35].map((g) => (
                      <button
                        key={g}
                        onClick={() => handleAddProteinToDaily(g)}
                        className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-mono transition"
                      >
                        +{g}g
                      </button>
                    ))}
                    <button
                      onClick={() => onUpdateHabits({ ...dailyHabits, proteinGramsConsumed: 0 })}
                      className="px-1.5 py-0.5 text-zinc-500 hover:text-zinc-300 text-[10px] font-mono"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ASSISTANT EN TEXTE LIBRE */}
          {activeTab === 'assistant' && (
            <div className="space-y-3 animate-in fade-in duration-150 flex flex-col h-full min-h-0">
              <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl flex items-center gap-2.5 shrink-0">
                <Bot className="w-4 h-4 text-emerald-400 shrink-0" />
                <p className="text-xs text-zinc-300">
                  Décrivez vos repas avec vos propres mots. L'agent analyse les nutriments, compare à vos cibles ({targets.calories} kcal • {targets.proteinGrams}g P) et formule des ajustements pratiques.
                </p>
              </div>

              {/* Chat Stream */}
              <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1 overscroll-contain">
                {chatLog.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3.5 rounded-2xl text-xs space-y-2 ${
                      msg.sender === 'user'
                        ? 'bg-emerald-950/40 border border-emerald-800/80 text-zinc-100 ml-8'
                        : 'bg-zinc-900/80 border border-zinc-800 text-zinc-200 mr-8'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.text}</p>
                    
                    {msg.nutritionEstimate && (
                      <div className="pt-2 border-t border-zinc-800/80 space-y-2">
                        <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[11px]">
                          <div className="p-1.5 bg-zinc-950 rounded-lg border border-zinc-800">
                            <span className="text-[9px] text-zinc-500 block">Kcal</span>
                            <span className="font-bold text-zinc-200">{msg.nutritionEstimate.calories}</span>
                          </div>
                          <div className="p-1.5 bg-emerald-950/60 rounded-lg border border-emerald-800/60">
                            <span className="text-[9px] text-emerald-400 block">Prot</span>
                            <span className="font-bold text-emerald-300">{msg.nutritionEstimate.protein}g</span>
                          </div>
                          <div className="p-1.5 bg-cyan-950/60 rounded-lg border border-cyan-800/60">
                            <span className="text-[9px] text-cyan-400 block">Gluc</span>
                            <span className="font-bold text-cyan-300">{msg.nutritionEstimate.carbs}g</span>
                          </div>
                          <div className="p-1.5 bg-amber-950/60 rounded-lg border border-amber-800/60">
                            <span className="text-[9px] text-amber-400 block">Lip</span>
                            <span className="font-bold text-amber-300">{msg.nutritionEstimate.fat}g</span>
                          </div>
                        </div>

                        {msg.nutritionEstimate.actionTips.length > 0 && (
                          <div className="space-y-1 pt-1">
                            {msg.nutritionEstimate.actionTips.map((tip, idx) => (
                              <div key={idx} className="flex items-start gap-1.5 text-[11px] text-zinc-400">
                                <span className="text-emerald-400">•</span>
                                <span>{tip}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => handleAddProteinToDaily(msg.nutritionEstimate!.protein)}
                            className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-lg text-[10px] transition flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Ajouter {msg.nutritionEstimate.protein}g au total du jour</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Input Form */}
              <div className="pt-2 shrink-0">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onFocus={() => {
                      setTimeout(scrollChatToBottom, 200);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendMealAnalysis();
                    }}
                    placeholder="Ex: 3 oeufs au plat, 2 tranches de pain complet, 1 café et 1 fruit..."
                    className="flex-1 px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={handleSendMealAnalysis}
                    disabled={!inputText.trim() || isAnalyzing}
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs transition disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                  >
                    {isAnalyzing ? (
                      <Sparkles className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Analyser</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TIMING PERI-WORKOUT */}
          {activeTab === 'peri' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs text-zinc-300 font-medium">
                  {isWorkoutDay 
                    ? `Protocole optimisé pour la séance : ${sessionTitle || 'Séance du jour'}` 
                    : "Protocole de nutrition pour la journée de récupération"}
                </span>
              </div>

              {/* Timeline Steps */}
              <div className="space-y-3">
                {/* Pre-workout */}
                <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-cyan-400">
                      Étape 1 • H - 2 heures
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">Repas pré-séance</span>
                  </div>
                  <h4 className="text-xs font-bold text-zinc-100">Saturation du glycogène et acides aminés</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Privilégiez des glucides complexes à digestion facile (riz basmati, flocons d'avoine, patate douce) associés à 25-35g de protéines digestes (poulet, poisson blanc, œufs ou tofu). Limitez les graisses lourdes pour éviter tout inconfort digestif pendant l'effort.
                  </p>
                </div>

                {/* Intra-workout */}
                <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-blue-400">
                      Étape 2 • Pendant l'effort
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">Intra-workout</span>
                  </div>
                  <h4 className="text-xs font-bold text-zinc-100">Hydratation & homéostasie osmotique</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Buvez 500 à 750ml d'eau par heure d'entraînement par petites gorgées régulières entre les séries. Si votre séance dépasse 60 minutes avec forte transpiration, une pincée de sel de mer ou des électrolytes préviennent les baisses de tension.
                  </p>
                </div>

                {/* Post-workout */}
                <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-400">
                      Étape 3 • Dans les 90 minutes
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">Fenêtre anabolique</span>
                  </div>
                  <h4 className="text-xs font-bold text-zinc-100">Récupération & synthèse musculaire</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Réhydratez-vous avec 500ml d'eau et apportez au moins 30g de protéines pour stopper le catabolisme et stimuler la voie mTOR. Associez-y des glucides pour relancer la recharge glycogénique.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PORTIONS VISUELLES SANS BALANCE */}
          {activeTab === 'portions' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-400 shrink-0" />
                <p className="text-xs text-zinc-300">
                  Pas besoin de peser chaque aliment au gramme près : la méthode des repères de la main offre une précision suffisante pour progresser sans contrainte mentale.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-1">
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">1 Paume = Protéines</span>
                  <p className="text-xs font-semibold text-zinc-200">Viande, poisson, tofu, 3 œufs</p>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Équivaut à environ 20 à 30g de protéines pures. Visez 1 à 1.5 paume à chaque repas principal.
                  </p>
                </div>

                <div className="p-3.5 bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-1">
                  <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block">1 Poing = Légumes & Fibres</span>
                  <p className="text-xs font-semibold text-zinc-200">Légumes verts, crudités, salades</p>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Apporte les micronutriments, antioxydants et fibres nécessaires au microbiote. 1 à 2 poings par repas.
                  </p>
                </div>

                <div className="p-3.5 bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-1">
                  <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">1 Main Creuse = Glucides</span>
                  <p className="text-xs font-semibold text-zinc-200">Riz, pâtes, avoine, quinoa, légumineuses</p>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Représente environ 25 à 35g de glucides cuits. Augmentez la portion les jours d'entraînement lourd.
                  </p>
                </div>

                <div className="p-3.5 bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-1">
                  <span className="text-[10px] font-mono uppercase text-purple-400 font-bold block">1 Pouce = Graisses Saines</span>
                  <p className="text-xs font-semibold text-zinc-200">Huile d'olive, avocat, noix, amandes</p>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Équivaut à 7-10g de lipides de qualité. Essentiel pour la production de testostérone et l'assimilation des vitamines liposolubles.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
