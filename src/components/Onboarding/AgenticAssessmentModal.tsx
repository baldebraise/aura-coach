import React, { useState, useRef, useEffect } from 'react';
import { 
  UserProfile, 
  AgenticAthleticDossier, 
  GymLocation, 
  TrainingPlanOption, 
  PlannedWorkoutSession 
} from '../../types';
import { DEFAULT_GYMS } from '../../data/defaultGyms';
import { runAgenticSportsScientistTurn } from '../../services/agenticAssessment';
import { generateDefaultSchedule } from '../../services/gemini';
import { sounds } from '../../utils/audio';
import { 
  Bot, 
  Send, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  X, 
  Target, 
  Calendar, 
  Activity, 
  Flame, 
  Droplet, 
  Moon, 
  ShieldAlert, 
  Scale, 
  Layers, 
  HelpCircle,
  TrendingUp,
  RotateCcw,
  Key,
  Check
} from 'lucide-react';

interface AgenticAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile;
  onSaveAssessment: (updatedProfile: UserProfile) => void;
}

const INITIAL_WELCOME_MESSAGE = {
  id: 'msg-welcome',
  sender: 'agent' as const,
  text: `Bonjour ! Je suis ton conseiller scientifique et athlétique AURA.

Nous allons construire ensemble ta programmation sur mesure, en échange direct et sans aucun QCM rigide.

Pour démarrer : quel est ton prénom (ou pseudo), et quel est ton grand objectif physique ou sportif en ce moment ?`
};

export const AgenticAssessmentModal: React.FC<AgenticAssessmentModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSaveAssessment
}) => {
  // Dialogue stream persisted
  const [messages, setMessages] = useState<Array<{
    id: string;
    sender: 'agent' | 'user';
    text: string;
  }>>(() => {
    try {
      const saved = localStorage.getItem('aura_agentic_messages');
      return saved ? JSON.parse(saved) : [INITIAL_WELCOME_MESSAGE];
    } catch {
      return [INITIAL_WELCOME_MESSAGE];
    }
  });

  const [inputText, setInputText] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [activeDossier, setActiveDossier] = useState<AgenticAthleticDossier | null>(() => {
    try {
      const saved = localStorage.getItem('aura_agentic_dossier');
      if (saved) return JSON.parse(saved);
      return currentProfile.athleticDossier || null;
    } catch {
      return currentProfile.athleticDossier || null;
    }
  });
  const [selectedPlanOptionIndex, setSelectedPlanOptionIndex] = useState<number>(0);
  const [activeDossierTab, setActiveDossierTab] = useState<'condition' | 'plan' | 'nutrition' | 'tests'>('condition');

  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem('aura_gemini_api_key') || currentProfile.geminiApiKey || '';
  });
  const [isKeyInputOpen, setIsKeyInputOpen] = useState<boolean>(false);
  const [keyInputDraft, setKeyInputDraft] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAnalyzing]);

  useEffect(() => {
    try {
      localStorage.setItem('aura_agentic_messages', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  useEffect(() => {
    try {
      if (activeDossier) {
        localStorage.setItem('aura_agentic_dossier', JSON.stringify(activeDossier));
      }
    } catch {}
  }, [activeDossier]);

  if (!isOpen) return null;

  const handleResetConversation = () => {
    localStorage.removeItem('aura_agentic_messages');
    localStorage.removeItem('aura_agentic_dossier');
    setMessages([INITIAL_WELCOME_MESSAGE]);
    setActiveDossier(null);
    setInputText('');
  };

  const handleSendMessage = async (customText?: string) => {
    const text = (typeof customText === 'string' ? customText : inputText).trim();
    if (!text || isAnalyzing) return;

    const userMessageId = 'user-' + Date.now();
    const updatedMessages = [...messages, { id: userMessageId, sender: 'user' as const, text }];
    setMessages(updatedMessages);
    if (!customText) setInputText('');
    setIsAnalyzing(true);

    try {
      // Map dialogue to role/text format
      const dialogueForAi = updatedMessages.map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
        text: m.text
      }));

      const result = await runAgenticSportsScientistTurn(
        dialogueForAi,
        { ...currentProfile, geminiApiKey },
        activeDossier || undefined
      );

      setMessages((prev) => [
        ...prev,
        {
          id: 'agent-' + Date.now(),
          sender: 'agent',
          text: result.assistantReply
        }
      ]);

      if (result.dossier) {
        setActiveDossier(result.dossier);
      }
      sounds.playTick();
    } catch (err) {
      console.error("Agentic turn error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: 'agent-err-' + Date.now(),
          sender: 'agent',
          text: "C'est bien noté. Peux-tu me préciser également ton rythme de vie et tes disponibilités d'entraînement ?"
        }
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleValidateDossier = () => {
    if (!activeDossier) return;

    // Pick chosen option or default
    const chosenOption: TrainingPlanOption | undefined = 
      activeDossier.trainingPlanDraft.options[selectedPlanOptionIndex] || 
      activeDossier.trainingPlanDraft.options[0];

    const targetDays = chosenOption?.frequencyDays || 4;

    // Derive primary goal
    let primaryGoal: UserProfile['primaryGoal'] = 'recomposition';
    const sumLower = activeDossier.physicalConditionSummary.toLowerCase() + ' ' + activeDossier.shortTermGoals.toLowerCase();
    if (sumLower.includes('masse') || sumLower.includes('hypertrophie') || sumLower.includes('muscle')) {
      primaryGoal = 'muscle_gain';
    } else if (sumLower.includes('force') || sumLower.includes('puissance')) {
      primaryGoal = 'strength';
    } else if (sumLower.includes('perte de gras') || sumLower.includes('sèche') || sumLower.includes('endurance')) {
      primaryGoal = 'endurance';
    } else if (sumLower.includes('santé') || sumLower.includes('posture')) {
      primaryGoal = 'mobility_health';
    }

    const updatedProfile: UserProfile = {
      ...currentProfile,
      age: activeDossier.baselineTrackingMetrics.initialAge || currentProfile.age,
      heightCm: activeDossier.baselineTrackingMetrics.initialHeightCm || currentProfile.heightCm,
      weightKg: activeDossier.baselineTrackingMetrics.initialWeightKg || currentProfile.weightKg,
      primaryGoal,
      weeklyAvailabilityDays: targetDays,
      preferredSessionDurationMinutes: 60,
      athleticDossier: activeDossier,
      onboardingCompleted: true,
      assessmentRawText: messages.filter((m) => m.sender === 'user').map((m) => m.text).join('\n')
    };

    sounds.playRecordBeaten();
    onSaveAssessment(updatedProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full sm:max-w-2xl bg-zinc-950 border border-zinc-800 rounded-t-2xl sm:rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col h-[100dvh] sm:h-[88vh] max-h-[100dvh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-zinc-100">Bilan Athlétique Agentique</h2>
                {activeDossier && activeDossier.isReadyForValidation ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 font-semibold">
                    Plan Finalisé ({activeDossier.confidenceScore}%)
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                    Question par question
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400">
                Échange ouvert et cadrage dynamique sans aucun QCM rigide
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setKeyInputDraft(geminiApiKey);
                setIsKeyInputOpen(!isKeyInputOpen);
              }}
              title="Configurer une clé Google Gemini directe (optionnel)"
              className={`px-2.5 py-1 rounded-lg border transition flex items-center gap-1.5 text-[11px] ${
                geminiApiKey 
                  ? 'bg-emerald-950/70 border-emerald-700/80 text-emerald-400 font-semibold' 
                  : 'text-zinc-400 hover:text-zinc-200 border-zinc-800 hover:bg-zinc-900'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{geminiApiKey ? 'Gemini 2.5 Actif' : 'Clé IA'}</span>
            </button>
            <button
              onClick={handleResetConversation}
              title="Recommencer à zéro sur une base saine"
              className="px-2.5 py-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition flex items-center gap-1.5 text-[11px]"
            >
              <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Recommencer</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Optional Gemini API Key Drawer */}
        {isKeyInputOpen && (
          <div className="p-3 bg-zinc-900/90 border-b border-zinc-800 shrink-0 space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Connexion directe Google Gemini (optionnelle)</span>
              </span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-emerald-400 hover:underline"
              >
                Obtenir une clé gratuite
              </a>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="password"
                value={keyInputDraft}
                onChange={(e) => setKeyInputDraft(e.target.value)}
                placeholder="Collez votre clé API Gemini (AIzaSy...)"
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => {
                  const cleaned = keyInputDraft.trim();
                  setGeminiApiKey(cleaned);
                  if (cleaned) {
                    localStorage.setItem('aura_gemini_api_key', cleaned);
                  } else {
                    localStorage.removeItem('aura_gemini_api_key');
                  }
                  setIsKeyInputOpen(false);
                }}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-lg transition"
              >
                Enregistrer
              </button>
            </div>
          </div>
        )}

        {/* Main Body: Scrollable Dialogue & Dossier Card */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-4 py-3 pr-1 overscroll-contain">
          {/* Messages Stream */}
          <div className="space-y-3">
            {messages.map((msg) => {
              const isAgent = msg.sender === 'agent';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAgent ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[90%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isAgent
                        ? 'bg-zinc-900/90 border border-zinc-800 text-zinc-200 rounded-tl-sm'
                        : 'bg-emerald-500 text-zinc-950 font-medium rounded-tr-sm'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>
                </div>
              );
            })}

            {isAnalyzing && (
              <div className="flex items-center gap-2 p-3 bg-zinc-900/60 border border-zinc-800 rounded-2xl text-xs text-zinc-400 max-w-[80%]">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                <span>Raisonnement biomécanique et élaboration du plan...</span>
              </div>
            )}

            {/* Early finalization button if user provided several answers and wants the plan right now */}
            {!activeDossier?.isReadyForValidation && messages.filter((m) => m.sender === 'user').length >= 2 && !isAnalyzing && (
              <div className="flex justify-center pt-2 pb-1">
                <button
                  type="button"
                  onClick={() => handleSendMessage("J'ai donné l'essentiel, génère mon plan et mes recommandations maintenant s'il te plaît.")}
                  className="text-[11px] font-mono text-zinc-400 hover:text-emerald-400 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-emerald-700/60 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>J'ai partagé l'essentiel, finaliser mon plan dès maintenant</span>
                </button>
              </div>
            )}
          </div>

          {/* DYNAMIC ATHLETIC DOSSIER CARD (Fiche de Cadrage Athlétique) - PROPOSÉ SEULEMENT QUAND TERMINÉ */}
          {activeDossier && activeDossier.isReadyForValidation && (
            <div className="p-4 bg-gradient-to-br from-zinc-900/95 via-zinc-950 to-zinc-900/95 border border-emerald-700/80 rounded-2xl shadow-xl space-y-4 animate-in fade-in duration-300">
              {/* Dossier Header */}
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono">
                    Plan Athlétique Proposé par l'Agent
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">
                  {activeDossier.baselineTrackingMetrics.initialWeightKg ? `${activeDossier.baselineTrackingMetrics.initialWeightKg} kg • ` : ''}
                  {activeDossier.trainingPlanDraft.splitName}
                </span>
              </div>

              {/* Sub-Tabs Selector */}
              <div className="flex border-b border-zinc-800/60 bg-zinc-950/60 p-1 rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => setActiveDossierTab('condition')}
                  className={`flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-lg transition ${
                    activeDossierTab === 'condition'
                      ? 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Condition & Objectifs
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDossierTab('plan')}
                  className={`flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-lg transition ${
                    activeDossierTab === 'plan'
                      ? 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Plan d'Entraînement
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDossierTab('nutrition')}
                  className={`flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-lg transition ${
                    activeDossierTab === 'nutrition'
                      ? 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Nutrition & Vie
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDossierTab('tests')}
                  className={`flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-lg transition ${
                    activeDossierTab === 'tests'
                      ? 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Tests & Réserves
                </button>
              </div>

              {/* TAB 1: CONDITION & OBJECTIFS */}
              {activeDossierTab === 'condition' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-xl space-y-1">
                    <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">
                      1. Résumé de votre condition physique actuelle
                    </span>
                    <p className="text-xs text-zinc-200 leading-relaxed">
                      {activeDossier.physicalConditionSummary}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-xl space-y-1">
                      <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block">
                        Objectifs Court Terme (4-6 semaines)
                      </span>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        {activeDossier.shortTermGoals}
                      </p>
                    </div>

                    <div className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-xl space-y-1">
                      <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">
                        Objectifs Long Terme (6-12 mois)
                      </span>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        {activeDossier.longTermGoals}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-950/30 border border-emerald-800/50 rounded-xl space-y-1">
                    <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Retours sur les résultats espérés</span>
                    </span>
                    <p className="text-xs text-zinc-200 leading-relaxed">
                      {activeDossier.expectedOutcomes}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: PLAN D'ENTRAÎNEMENT & OPTIONS */}
              {activeDossierTab === 'plan' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-100">
                        {activeDossier.trainingPlanDraft.splitName}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800">
                        Recommandé
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {activeDossier.trainingPlanDraft.rationale}
                    </p>
                  </div>

                  {/* Options de programmation */}
                  {activeDossier.trainingPlanDraft.options.length > 1 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">
                        Choisissez votre formule de rythme :
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {activeDossier.trainingPlanDraft.options.map((opt, idx) => (
                          <div
                            key={idx}
                            onClick={() => setSelectedPlanOptionIndex(idx)}
                            className={`p-3 rounded-xl border transition cursor-pointer space-y-1 ${
                              selectedPlanOptionIndex === idx
                                ? 'bg-emerald-950/60 border-emerald-600 text-zinc-100 shadow-md'
                                : 'bg-zinc-950/80 border-zinc-800/80 text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-zinc-100">{opt.title}</span>
                              <span className="text-[10px] font-mono text-emerald-400 font-bold">
                                {opt.frequencyDays} j/semaine
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-400 leading-relaxed">{opt.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Aperçu des séances */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">
                      Aperçu des séances types calibrées :
                    </span>
                    <div className="space-y-2">
                      {activeDossier.trainingPlanDraft.sessions.map((sess, i) => (
                        <div key={i} className="p-2.5 bg-zinc-950/80 border border-zinc-800/80 rounded-xl space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-zinc-200">{sess.title}</span>
                            <span className="text-[10px] font-mono text-zinc-500">{sess.durationMin} min</span>
                          </div>
                          <div className="flex flex-wrap gap-1 pt-1">
                            {sess.exercisesPreview.map((ex, eIdx) => (
                              <span
                                key={eIdx}
                                className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400"
                              >
                                {ex}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: NUTRITION & VIE */}
              {activeDossierTab === 'nutrition' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl">
                      <span className="text-[9px] font-mono uppercase text-zinc-500 block">Calories Cible</span>
                      <span className="text-sm font-bold font-mono text-emerald-400">
                        {activeDossier.nutritionLifestyleDraft.dailyCaloriesTarget}
                      </span>
                      <span className="text-[9px] text-zinc-500 block">kcal/jour</span>
                    </div>
                    <div className="p-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl">
                      <span className="text-[9px] font-mono uppercase text-zinc-500 block">Protéines</span>
                      <span className="text-sm font-bold font-mono text-cyan-400">
                        {activeDossier.nutritionLifestyleDraft.proteinGramsTarget}g
                      </span>
                      <span className="text-[9px] text-zinc-500 block">par jour</span>
                    </div>
                    <div className="p-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl">
                      <span className="text-[9px] font-mono uppercase text-zinc-500 block">Hydratation</span>
                      <span className="text-sm font-bold font-mono text-blue-400">
                        {activeDossier.nutritionLifestyleDraft.waterLitersTarget}L
                      </span>
                      <span className="text-[9px] text-zinc-500 block">par jour</span>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-xl space-y-1">
                    <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">
                      Stratégie nutritionnelle préconisée
                    </span>
                    <p className="text-xs text-zinc-200 leading-relaxed">
                      {activeDossier.nutritionLifestyleDraft.nutritionStrategy}
                    </p>
                  </div>

                  <div className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-xl space-y-1.5">
                    <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">
                      Piliers d'hygiène de vie recommandés
                    </span>
                    <div className="space-y-1">
                      {activeDossier.nutritionLifestyleDraft.lifestylePillars.map((p, pIdx) => (
                        <div key={pIdx} className="flex items-start gap-1.5 text-xs text-zinc-300">
                          <span className="text-emerald-400 shrink-0">•</span>
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: TESTS & RÉSERVES */}
              {activeDossierTab === 'tests' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">
                      Tests appropriés à réaliser pour compléter le plan :
                    </span>
                    {activeDossier.recommendedTests.map((t) => (
                      <div key={t.id} className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-xl space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-200">{t.name}</span>
                          <span className="text-[10px] font-mono text-cyan-400 font-semibold">
                            {t.targetMetric}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">{t.rationale}</p>
                      </div>
                    ))}
                  </div>

                  {activeDossier.missingDataAndReserves.length > 0 && (
                    <div className="p-3 bg-amber-950/30 border border-amber-900/60 rounded-xl space-y-1.5">
                      <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Réserves & Données à obtenir ultérieurement</span>
                      </span>
                      <div className="space-y-1.5">
                        {activeDossier.missingDataAndReserves.map((res, rIdx) => (
                          <div key={rIdx} className="text-xs text-zinc-300">
                            <span className="text-amber-400 font-medium">• {res.missingPoint} :</span>{' '}
                            <span className="text-zinc-400">{res.howToObtain}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Variables d'initialisation des premières courbes */}
                  <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-xl space-y-1">
                    <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">
                      Initialisation des premières courbes de suivi
                    </span>
                    <p className="text-[11px] text-zinc-400">
                      Poids de référence : <span className="text-zinc-200 font-mono font-bold">{activeDossier.baselineTrackingMetrics.initialWeightKg || 75} kg</span> • Benchmark repère : <span className="text-zinc-200 font-mono font-bold">{activeDossier.baselineTrackingMetrics.initialBenchmarkMetricName || 'Pompes'} ({activeDossier.baselineTrackingMetrics.initialBenchmarkValue || 15} {activeDossier.baselineTrackingMetrics.initialBenchmarkUnit || 'reps'})</span>. Vos graphiques démarrent avec ces points réels.
                    </p>
                  </div>
                </div>
              )}

              {/* ACTION VALIDATION BUTTON */}
              <button
                type="button"
                onClick={handleValidateDossier}
                className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-zinc-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50"
              >
                <Check className="w-4 h-4" />
                <span>Valider ce plan & initialiser mon suivi athlétique</span>
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Text Input Area */}
        <div className="pt-2 border-t border-zinc-800 shrink-0">
          <div className="relative flex items-center">
            <textarea
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onFocus={() => {
                setTimeout(scrollToBottom, 200);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Répondez librement : votre métier, rythme de travail, passé sportif, sommeil, douleurs..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 pr-12 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 resize-none"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isAnalyzing}
              className="absolute right-2.5 bottom-2.5 p-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg transition disabled:opacity-40"
              title="Envoyer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
            L'agent adapte ses questions et formule son cadrage en direct. Entrée pour envoyer.
          </span>
        </div>
      </div>
    </div>
  );
};
