import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, EquipmentType, GymLocation } from '../../types';
import { DEFAULT_GYMS } from '../../data/defaultGyms';
import { initializeFirebaseApp } from '../../services/firebase';
import { getAI, getGenerativeModel } from 'firebase/ai';
import { sounds } from '../../utils/audio';
import { 
  Bot, 
  Send, 
  Check, 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  X, 
  ShieldCheck, 
  User, 
  Target, 
  Calendar, 
  MapPin, 
  AlertTriangle 
} from 'lucide-react';

interface ExtractedData {
  name?: string;
  age?: number;
  heightCm?: number;
  weightKg?: number;
  primaryGoal?: 'recomposition' | 'muscle_gain' | 'strength' | 'endurance' | 'mobility_health';
  weeklyAvailabilityDays?: number;
  preferredDurationMinutes?: number;
  injuries: string[];
  gymType?: 'home' | 'commercial' | 'both';
  gymEquipment: EquipmentType[];
  confidence: number;
}

export function parseNaturalLanguageAssessment(text: string, currentData?: Partial<ExtractedData>): ExtractedData {
  const lower = text.toLowerCase();
  const data: ExtractedData = {
    name: currentData?.name,
    age: currentData?.age,
    heightCm: currentData?.heightCm,
    weightKg: currentData?.weightKg,
    primaryGoal: currentData?.primaryGoal,
    weeklyAvailabilityDays: currentData?.weeklyAvailabilityDays,
    preferredDurationMinutes: currentData?.preferredDurationMinutes,
    injuries: currentData?.injuries ? [...currentData.injuries] : [],
    gymType: currentData?.gymType,
    gymEquipment: currentData?.gymEquipment ? [...currentData.gymEquipment] : ['bodyweight'],
    confidence: 0
  };

  // 1. Age extraction (e.g. "32 ans", "j'ai 28 ans", "24ans", "age 30")
  const ageMatch = lower.match(/(?:j'ai|age|âgé de|age de)?\s*(\d{2})\s*(?:ans|an)\b/i) || lower.match(/\b(\d{2})\s*ans\b/i);
  if (ageMatch) {
    const parsedAge = parseInt(ageMatch[1]);
    if (parsedAge >= 14 && parsedAge <= 90) {
      data.age = parsedAge;
    }
  }

  // 2. Height extraction (e.g. "1m83", "1,83m", "1.75m", "175 cm", "180cm")
  const heightMetersMatch = lower.match(/\b(1)[m,.](\d{2})\b/i);
  if (heightMetersMatch) {
    data.heightCm = 100 + parseInt(heightMetersMatch[2]);
  } else {
    const heightCmMatch = lower.match(/\b(1[4-9]\d|2[0-1]\d)\s*(?:cm)?\b/);
    // Disambiguate from weight if it looks like cm
    if (heightCmMatch && lower.includes('cm')) {
      data.heightCm = parseInt(heightCmMatch[1]);
    }
  }

  // 3. Weight extraction (e.g. "78kg", "78 kg", "82 kilos", "pèse 80")
  const weightMatch = lower.match(/(?:pèse|poids|fais)?\s*(\d{2,3}(?:[.,]\d)?)\s*(?:kg|kilos|kilo)\b/i);
  if (weightMatch) {
    data.weightKg = parseFloat(weightMatch[1].replace(',', '.'));
  }

  // 4. Primary Goal extraction
  if (lower.includes('masse') || lower.includes('muscle') || lower.includes('hypertrophie') || lower.includes('grossir') || lower.includes('volume')) {
    data.primaryGoal = 'muscle_gain';
  } else if (lower.includes('force') || lower.includes('lourd') || lower.includes('puissance') || lower.includes('power')) {
    data.primaryGoal = 'strength';
  } else if (lower.includes('gras') || lower.includes('sécher') || lower.includes('seche') || lower.includes('perdre du poids') || lower.includes('mincir') || lower.includes('cardio') || lower.includes('endurance')) {
    data.primaryGoal = 'endurance';
  } else if (lower.includes('santé') || lower.includes('posture') || lower.includes('mobilité') || lower.includes('souplesse') || lower.includes('bien-être')) {
    data.primaryGoal = 'mobility_health';
  } else if (lower.includes('recomposition') || lower.includes('tonifier') || lower.includes('silhouette') || lower.includes('forme')) {
    data.primaryGoal = 'recomposition';
  }

  // 5. Weekly availability extraction (e.g. "3 fois", "4 séances", "5 jours", "3j/7")
  const freqMatch = lower.match(/\b([1-6])\s*(?:fois|séances|seances|jours|j)\b/i) || lower.match(/\b([1-6])j\b/i);
  if (freqMatch) {
    data.weeklyAvailabilityDays = parseInt(freqMatch[1]);
  }

  // 6. Session duration extraction (e.g. "45 min", "1h", "1 heure", "1h30", "60 minutes")
  if (lower.includes('1h30') || lower.includes('90 min')) {
    data.preferredDurationMinutes = 90;
  } else if (lower.includes('1h') || lower.includes('60 min') || lower.includes('1 heure')) {
    data.preferredDurationMinutes = 60;
  } else if (lower.includes('45 min')) {
    data.preferredDurationMinutes = 45;
  } else if (lower.includes('30 min')) {
    data.preferredDurationMinutes = 30;
  }

  // 7. Injuries & pain extraction
  const injuryKeywords: { keyword: string; label: string }[] = [
    { keyword: 'genou', label: 'Genou' },
    { keyword: 'rotulien', label: 'Tendon rotulien' },
    { keyword: 'épaule', label: 'Épaule' },
    { keyword: 'epaule', label: 'Épaule' },
    { keyword: 'coiffe', label: 'Coiffe des rotateurs' },
    { keyword: 'lombaire', label: 'Lombaires / Bas du dos' },
    { keyword: 'dos', label: 'Dos' },
    { keyword: 'hernie', label: 'Hernie discale' },
    { keyword: 'coude', label: 'Coude / Tendinite' },
    { keyword: 'poignet', label: 'Poignet' },
    { keyword: 'nuque', label: 'Nuque / Cervicales' },
    { keyword: 'cheville', label: 'Cheville' }
  ];

  injuryKeywords.forEach((item) => {
    if (lower.includes(item.keyword) && !data.injuries.includes(item.label)) {
      data.injuries.push(item.label);
    }
  });

  // 8. Gym / Equipment detection
  if (lower.includes('fitness park') || lower.includes('basic fit') || lower.includes('salle de sport') || lower.includes('salle de muscu') || lower.includes('club')) {
    data.gymType = 'commercial';
    data.gymEquipment = [
      'bodyweight',
      'dumbbells',
      'barbell',
      'pullup_bar',
      'cable_machine',
      'leg_press',
      'lat_pulldown',
      'smith_machine',
      'bench',
      'cardio_machine'
    ];
  } else if (lower.includes('maison') || lower.includes('chez moi') || lower.includes('domicile') || lower.includes('salon')) {
    data.gymType = 'home';
    const equip: EquipmentType[] = ['bodyweight'];
    if (lower.includes('haltère') || lower.includes('haltere')) equip.push('dumbbells');
    if (lower.includes('barre') && !lower.includes('traction')) equip.push('barbell');
    if (lower.includes('traction')) equip.push('pullup_bar');
    if (lower.includes('élastique') || lower.includes('elastique') || lower.includes('bande')) equip.push('resistance_bands');
    if (lower.includes('banc')) equip.push('bench');
    if (lower.includes('kettlebell')) equip.push('kettlebell');
    data.gymEquipment = equip;
  }

  // Calculate confidence score
  let score = 0;
  if (data.age) score += 20;
  if (data.weightKg) score += 20;
  if (data.heightCm) score += 20;
  if (data.primaryGoal) score += 20;
  if (data.weeklyAvailabilityDays) score += 20;
  data.confidence = score;

  return data;
}

interface AgenticAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile;
  onSaveAssessment: (updatedProfile: UserProfile) => void;
}

export const AgenticAssessmentModal: React.FC<AgenticAssessmentModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSaveAssessment
}) => {
  const [messages, setMessages] = useState<{ id: string; sender: 'agent' | 'user'; text: string; proposal?: ExtractedData }[]>([
    {
      id: 'msg-init',
      sender: 'agent',
      text: `Bonjour ! Je suis votre conseiller athlétique AURA. Pour calibrer votre programme sans formulaire rigide ni QCM, parlez-moi librement en texte libre :

• Votre âge, taille et poids actuel
• Votre objectif principal (prise de muscle, force, perte de gras, tonification, santé/posture)
• Vos blessures, douleurs ou articulations sensibles (épaules, genoux, lombaires...)
• Vos équipements ou votre salle (Maison, Basic-Fit, Fitness Park...)
• Le nombre de séances par semaine que vous pouvez tenir`
    }
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [currentExtraction, setCurrentExtraction] = useState<ExtractedData>(() => ({
    name: currentProfile.name !== 'Athlète' ? currentProfile.name : undefined,
    age: currentProfile.age,
    heightCm: currentProfile.heightCm,
    weightKg: currentProfile.weightKg,
    primaryGoal: currentProfile.primaryGoal,
    weeklyAvailabilityDays: currentProfile.weeklyAvailabilityDays,
    preferredDurationMinutes: currentProfile.preferredSessionDurationMinutes,
    injuries: currentProfile.injuries || [],
    gymEquipment: currentProfile.gyms?.[0]?.equipment || ['bodyweight'],
    confidence: 0
  }));

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAnalyzing]);

  if (!isOpen) return null;

  const handleSendResponse = async () => {
    const text = inputText.trim();
    if (!text || isAnalyzing) return;

    const userMsgId = 'user-' + Date.now();
    setMessages((prev) => [...prev, { id: userMsgId, sender: 'user', text }]);
    setInputText('');
    setIsAnalyzing(true);

    try {
      // 1. Run local robust entity parser
      const updatedExtraction = parseNaturalLanguageAssessment(text, currentExtraction);
      setCurrentExtraction(updatedExtraction);

      // 2. Try Gemini 2.5 Flash via Firebase AI Logic if available
      let aiFeedback = '';
      if (currentProfile.isGoogleAuthenticated) {
        try {
          const { app } = initializeFirebaseApp();
          if (app) {
            const ai = getAI(app);
            const model = getGenerativeModel(ai, { model: 'gemini-2.5-flash' });
            const prompt = `Tu es l'agent sportif expert AURA. L'athlète vient de décrire sa situation : "${text}".
Données déjà extraites : âge=${updatedExtraction.age || 'inconnu'}, poids=${updatedExtraction.weightKg || 'inconnu'}kg, taille=${updatedExtraction.heightCm || 'inconnu'}cm, objectif=${updatedExtraction.primaryGoal || 'inconnu'}, séances/semaine=${updatedExtraction.weeklyAvailabilityDays || 'inconnu'}, blessures=${updatedExtraction.injuries.join(', ') || 'aucune'}.
Réponds en 2 à 3 phrases très professionnelles et encourageantes en français, SANS AUCUN EMOJI. Résume ce que tu as compris et ce qu'il reste à préciser si besoin.`;

            const res = await model.generateContent(prompt);
            aiFeedback = res?.response?.text() || '';
          }
        } catch {
          // Fallback to local synthesis
        }
      }

      if (!aiFeedback) {
        const missingFields: string[] = [];
        if (!updatedExtraction.age) missingFields.push('votre âge');
        if (!updatedExtraction.weightKg) missingFields.push('votre poids');
        if (!updatedExtraction.heightCm) missingFields.push('votre taille');
        if (!updatedExtraction.primaryGoal) missingFields.push('votre objectif prioritaire');
        if (!updatedExtraction.weeklyAvailabilityDays) missingFields.push('votre nombre de séances par semaine');

        if (missingFields.length === 0) {
          aiFeedback = `Parfait, j ai extrait toutes les informations nécessaires pour générer votre programmation. Vérifiez la proposition ci-dessous et validez-la d un clic pour l enregistrer.`;
        } else {
          aiFeedback = `Bien reçu. J ai bien pris en compte vos éléments. Si vous le souhaitez, précisez-moi également : ${missingFields.join(', ')}. Vous pouvez déjà valider la proposition ci-dessous si elle vous convient.`;
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: 'agent-' + Date.now(),
          sender: 'agent',
          text: aiFeedback.trim(),
          proposal: updatedExtraction
        }
      ]);
      sounds.playTick();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleValidateProposal = (dataToSave: ExtractedData) => {
    const gyms: GymLocation[] = [];
    if (dataToSave.gymType === 'commercial') {
      gyms.push(DEFAULT_GYMS[1]); // Fitness Park / Salle complète
    } else {
      gyms.push({
        id: 'gym-custom-' + Date.now(),
        name: dataToSave.gymType === 'home' ? 'Maison / Salon' : 'Lieu d entraînement',
        isDefault: true,
        equipment: dataToSave.gymEquipment.length > 0 ? dataToSave.gymEquipment : ['bodyweight'],
        notes: 'Configuré via entretien agentique'
      });
    }

    const updated: UserProfile = {
      ...currentProfile,
      age: dataToSave.age,
      heightCm: dataToSave.heightCm,
      weightKg: dataToSave.weightKg,
      primaryGoal: dataToSave.primaryGoal || 'recomposition',
      weeklyAvailabilityDays: dataToSave.weeklyAvailabilityDays || 3,
      preferredSessionDurationMinutes: dataToSave.preferredDurationMinutes || 60,
      injuries: dataToSave.injuries,
      gyms: gyms.length > 0 ? gyms : currentProfile.gyms,
      onboardingCompleted: true,
      assessmentRawText: messages.filter((m) => m.sender === 'user').map((m) => m.text).join('\n')
    };

    sounds.playRecordBeaten();
    onSaveAssessment(updated);
    onClose();
  };

  const goalLabels: Record<string, string> = {
    muscle_gain: 'Prise de masse musculaire & Hypertrophie',
    strength: 'Développement de la force athlétique',
    recomposition: 'Recomposition corporelle (Muscle & Silhouette)',
    endurance: 'Perte de masse grasse & Endurance aérobie',
    mobility_health: 'Santé articulaire, Posture & Mobilité'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full sm:max-w-xl bg-zinc-950 border border-zinc-800 rounded-t-2xl sm:rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col h-[100dvh] sm:h-[84vh] max-h-[100dvh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                <span>Évaluation Agentique Initiale</span>
                <span className="text-[10px] font-mono font-normal px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-emerald-400">
                  Texte Libre
                </span>
              </h2>
              <p className="text-[11px] text-zinc-500">Pas de QCM rigide : décrivez simplement votre profil</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-500 hover:text-zinc-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conversation Stream */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-3 py-3 pr-1 overscroll-contain">
          {messages.map((msg) => {
            const isAgent = msg.sender === 'agent';

            return (
              <div key={msg.id} className={`flex flex-col ${isAgent ? 'items-start' : 'items-end'}`}>
                <div
                  className={`max-w-[90%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    isAgent
                      ? 'bg-zinc-900/90 border border-zinc-800 text-zinc-200 rounded-tl-sm'
                      : 'bg-emerald-500 text-zinc-950 font-medium rounded-tr-sm'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>

                {/* Agentic Extraction Card with Instant Validation */}
                {msg.proposal && (
                  <div className="mt-2.5 w-full max-w-[92%] p-4 bg-zinc-900/90 border border-emerald-800/80 rounded-2xl shadow-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs font-mono uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Proposition Agentique Détectée</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400">
                        Confiance : {msg.proposal.confidence}%
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-zinc-300">
                      <div className="flex items-center justify-between py-1 border-b border-zinc-800/60">
                        <span className="text-zinc-500">Morphométrie :</span>
                        <span className="font-semibold text-zinc-200 font-mono">
                          {msg.proposal.age ? `${msg.proposal.age} ans` : '-- ans'} •{' '}
                          {msg.proposal.heightCm ? `${msg.proposal.heightCm} cm` : '-- cm'} •{' '}
                          {msg.proposal.weightKg ? `${msg.proposal.weightKg} kg` : '-- kg'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-zinc-800/60">
                        <span className="text-zinc-500">Objectif :</span>
                        <span className="font-semibold text-emerald-400">
                          {msg.proposal.primaryGoal ? goalLabels[msg.proposal.primaryGoal] : 'À préciser'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-zinc-800/60">
                        <span className="text-zinc-500">Rythme :</span>
                        <span className="font-semibold text-zinc-200">
                          {msg.proposal.weeklyAvailabilityDays
                            ? `${msg.proposal.weeklyAvailabilityDays} séances / semaine (${msg.proposal.preferredDurationMinutes || 60} min)`
                            : '3 séances / semaine'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-zinc-800/60">
                        <span className="text-zinc-500">Zone(s) sensible(s) :</span>
                        <span className="font-semibold text-amber-300">
                          {msg.proposal.injuries.length > 0
                            ? msg.proposal.injuries.join(', ')
                            : 'Aucune douleur signalée'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-1">
                        <span className="text-zinc-500">Environnement :</span>
                        <span className="font-semibold text-cyan-400">
                          {msg.proposal.gymType === 'commercial' ? 'Salle complète (Club)' : 'Entraînement Maison'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3.5 pt-3 border-t border-zinc-800 flex gap-2">
                      <button
                        onClick={() => handleValidateProposal(msg.proposal!)}
                        className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-zinc-950 font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Valider & Enregistrer ce profil</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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
                  handleSendResponse();
                }
              }}
              placeholder="Ex: J'ai 31 ans, 1m81 pour 79kg. Je vise la prise de muscle 4x par semaine chez Basic-Fit. J'ai une douleur au genou droit..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 pr-12 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 resize-none"
            />
            <button
              onClick={handleSendResponse}
              disabled={!inputText.trim() || isAnalyzing}
              className="absolute right-2.5 bottom-2.5 p-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg transition disabled:opacity-40"
              title="Envoyer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
            Entrée pour envoyer • Tapez votre réponse en texte libre en une ou plusieurs fois.
          </span>
        </div>
      </div>
    </div>
  );
};
