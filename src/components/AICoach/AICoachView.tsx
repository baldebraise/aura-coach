import React, { useState } from 'react';
import { UserProfile, AIChatMessage, WeeklyScheduleItem } from '../../types';
import { queryGeminiCoach } from '../../services/gemini';
import { sounds } from '../../utils/audio';
import { 
  Bot, 
  Send, 
  Check, 
  Sparkles, 
  Key, 
  Sliders, 
  Zap,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface AICoachViewProps {
  profile: UserProfile;
  schedule: WeeklyScheduleItem[];
  onApplyAction: (action: any) => void;
  onUpdateProfile: (profile: UserProfile) => void;
}

export const AICoachView: React.FC<AICoachViewProps> = ({
  profile,
  schedule,
  onApplyAction,
  onUpdateProfile
}) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      timestamp: 'Maintenant',
      text: `Bonjour ${profile.name}. Je suis votre conseiller scientifique et athlétique AURA. Votre programmation est calibrée pour votre objectif (${profile.primaryGoal}). Vous pouvez me solliciter à tout moment pour ajuster une séance, compenser une douleur ou optimiser votre nutrition.`
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);

  const quickPrompts = [
    'J ai une gêne au genou aujourd hui',
    'Je n ai que 30 min pour m entraîner',
    'Que manger 2h avant ma séance ?',
    'Comment organiser ma récupération ?'
  ];

  const handleSendMessage = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text) return;

    const userMsg: AIChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      text
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    try {
      const response = await queryGeminiCoach(text, profile);
      setMessages((prev) => [...prev, response]);
      sounds.playTick();
    } finally {
      setIsThinking(false);
    }
  };

  const handleApplyActionProposal = (msgId: string, proposal: any) => {
    onApplyAction(proposal);
    sounds.playRecordBeaten();

    // Mark as applied in chat
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === msgId && m.actionProposal) {
          return {
            ...m,
            actionProposal: {
              ...m.actionProposal,
              applied: true
            }
          };
        }
        return m;
      })
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-lg mx-auto pb-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between py-2 border-b border-zinc-800 shrink-0 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
              <span>Conseiller IA Gemini</span>
              <span className="text-[10px] font-mono font-normal px-1.5 py-0.2 bg-zinc-800 text-zinc-400 rounded">
                Validation Manuelle
              </span>
            </h2>
            <p className="text-[11px] text-zinc-500">Moteur scientifique de performance</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-xs text-emerald-400 font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{profile.isGoogleAuthenticated ? 'Gemini 2.5 Flash' : 'Moteur AURA'}</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  isUser
                    ? 'bg-emerald-500 text-zinc-950 font-medium rounded-tr-sm'
                    : 'bg-zinc-900/80 border border-zinc-800 text-zinc-200 rounded-tl-sm'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>
                <span
                  className={`text-[9px] font-mono mt-1 block ${
                    isUser ? 'text-zinc-800 text-right' : 'text-zinc-500'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>

              {/* Action Proposal Card (Validation Manuelle) */}
              {msg.actionProposal && (
                <div className="mt-2 w-full max-w-[88%] p-3.5 bg-zinc-950 border border-emerald-900/60 rounded-xl shadow-lg">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs mb-1">
                    <Zap className="w-3.5 h-3.5" />
                    <span>{msg.actionProposal.title}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mb-3">
                    {msg.actionProposal.description}
                  </p>

                  {msg.actionProposal.applied ? (
                    <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono font-medium">
                      <Check className="w-3.5 h-3.5" />
                      <span>Modification appliquée avec succès au planning</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleApplyActionProposal(msg.id, msg.actionProposal)}
                      className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5"
                    >
                      <span>Appliquer cette modification</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {isThinking && (
          <div className="flex items-center gap-2 p-3 bg-zinc-900/60 border border-zinc-800 rounded-2xl text-xs text-zinc-400 max-w-[70%]">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
            <span>Analyse biomécanique en cours...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts Chips */}
      <div className="flex gap-1.5 overflow-x-auto py-2 shrink-0 no-scrollbar">
        {quickPrompts.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(q)}
            className="px-2.5 py-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-400 hover:text-zinc-200 rounded-lg whitespace-nowrap transition"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        className="flex items-center gap-2 pt-1 shrink-0"
      >
        <input
          type="text"
          placeholder="Posez une question ou demandez un ajustement..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="p-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:hover:bg-emerald-500 text-zinc-950 rounded-xl transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

