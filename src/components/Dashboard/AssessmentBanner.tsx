import React from 'react';
import { UserProfile } from '../../types';
import { Bot, Sparkles, CheckCircle2, ArrowRight, AlertCircle, Edit3 } from 'lucide-react';

interface AssessmentBannerProps {
  profile: UserProfile;
  onOpenAgenticAssessment: () => void;
}

export const AssessmentBanner: React.FC<AssessmentBannerProps> = ({
  profile,
  onOpenAgenticAssessment
}) => {
  const isProfileComplete = !!(profile.age && profile.weightKg && profile.primaryGoal);

  const goalLabels: Record<string, string> = {
    muscle_gain: 'Prise de masse',
    strength: 'Force athlétique',
    recomposition: 'Recomposition',
    endurance: 'Perte de gras / Endurance',
    mobility_health: 'Santé & Mobilité'
  };

  return (
    <div className={`p-4 rounded-2xl border transition relative overflow-hidden ${
      isProfileComplete
        ? 'bg-zinc-900/40 border-zinc-800/80'
        : 'bg-gradient-to-br from-emerald-950/40 via-zinc-900/90 to-zinc-950 border-emerald-600/60 shadow-xl'
    }`}>
      {/* Background Accent */}
      {!isProfileComplete && (
        <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-xl border shrink-0 ${
            isProfileComplete
              ? 'bg-zinc-950 border-zinc-800 text-zinc-400'
              : 'bg-emerald-950/80 border-emerald-700/80 text-emerald-400 shadow-sm'
          }`}>
            <Bot className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-400">
                Étape 1 • État des Lieux
              </span>
              {isProfileComplete ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                  <CheckCircle2 className="w-3 h-3" />
                  Profil Validé
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                  <AlertCircle className="w-3 h-3 text-amber-400" />
                  Prioritaire
                </span>
              )}
            </div>

            <h3 className="text-sm font-bold text-zinc-100 mt-0.5">
              {isProfileComplete
                ? 'Questionnaire Initial & Objectifs'
                : 'Répondre au Questionnaire Initial'}
            </h3>

            {isProfileComplete ? (
              <p className="text-xs text-zinc-400 mt-1">
                {profile.age} ans • {profile.heightCm} cm • {profile.weightKg} kg • {profile.primaryGoal ? goalLabels[profile.primaryGoal] : ''} • {profile.weeklyAvailabilityDays || 3} séances/semaine
                {profile.injuries && profile.injuries.length > 0 && ` • Douleurs prises en compte : ${profile.injuries.join(', ')}`}
              </p>
            ) : (
              <p className="text-xs text-zinc-300/90 mt-1 leading-relaxed">
                Avant de passer vos tests physiques, décrivez votre profil en <strong>texte libre</strong> à l'agent AURA (âge, poids réel, objectifs, douleurs et salle) sans aucun QCM rigide.
              </p>
            )}
          </div>
        </div>

        <button
          onClick={onOpenAgenticAssessment}
          className={`shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
            isProfileComplete
              ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
              : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950'
          }`}
        >
          {isProfileComplete ? (
            <>
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Modifier</span>
            </>
          ) : (
            <>
              <span>Commencer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
