import React, { useState } from 'react';
import { 
  Dumbbell, 
  Activity, 
  MapPin, 
  Bot, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  Lock,
  Music,
  CheckCircle2
} from 'lucide-react';

interface WelcomeScreenProps {
  onStartOnboarding: () => void;
  onGoogleSignIn: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStartOnboarding,
  onGoogleSignIn
}) => {
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);

  const handleGoogleClick = () => {
    setIsSigningIn(true);
    // Trigger Google Sign-In flow
    setTimeout(() => {
      setIsSigningIn(false);
      onGoogleSignIn();
    }, 600);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between px-5 py-8 max-w-md mx-auto select-none animate-in fade-in duration-300">
      {/* Top Brand Tag */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 text-zinc-950 font-black font-mono flex items-center justify-center text-sm tracking-tighter">
            A
          </div>
          <div>
            <span className="font-bold tracking-tight text-base text-zinc-100 block leading-tight">
              AURA
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              Système Athlétique & Santé
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900/80 border border-zinc-800 rounded-lg text-[10px] font-mono text-zinc-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>v1.0 • PWA</span>
        </div>
      </div>

      {/* Hero Presentation */}
      <div className="my-auto py-6 space-y-6">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-semibold block mb-2">
            Condition Physique & Performance
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100 leading-tight">
            Votre entraînement, calibré avec précision.
          </h1>
          <p className="text-xs text-zinc-400 mt-2.5 leading-relaxed">
            Évaluation initiale exhaustive, adaptation instantanée selon votre salle (Maison vs Club), lecteur musical intégré et coach agentique Gemini avec validation manuelle.
          </p>
        </div>

        {/* Feature Highlights Grid (Clean, zero emojis) */}
        <div className="space-y-2.5">
          <div className="p-3 bg-zinc-900/40 border border-zinc-800/80 rounded-xl flex items-start gap-3">
            <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-emerald-400 shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-zinc-200">État des Lieux & Tests Guidés</h2>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Benchmarks initiaux de force et d aérobie avec chronomètres intégrés.
              </p>
            </div>
          </div>

          <div className="p-3 bg-zinc-900/40 border border-zinc-800/80 rounded-xl flex items-start gap-3">
            <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-cyan-400 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-zinc-200">Gestion Multi-Salles Automatique</h2>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Sélection du lieu avant séance : les exercices s adaptent au matériel présent.
              </p>
            </div>
          </div>

          <div className="p-3 bg-zinc-900/40 border border-zinc-800/80 rounded-xl flex items-start gap-3">
            <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-amber-400 shrink-0">
              <Music className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-zinc-200">Mode Séance & YouTube Music</h2>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Vue plein écran étape par étape, widget musical style Waze et bips de repos.
              </p>
            </div>
          </div>

          <div className="p-3 bg-zinc-900/40 border border-zinc-800/80 rounded-xl flex items-start gap-3">
            <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-purple-400 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-zinc-200">Conseiller IA Gemini avec Contrôle</h2>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Recommandations concrètes activables en 1 clic sous votre validation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons & Authentication */}
      <div className="space-y-3 pt-4">
        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleClick}
          disabled={isSigningIn}
          className="w-full py-3.5 px-4 bg-zinc-100 hover:bg-white active:scale-[0.99] text-zinc-950 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-3 shadow-lg shadow-zinc-950/50"
        >
          {/* Official Google Vector Logo */}
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>
            {isSigningIn ? 'Connexion en cours...' : 'Se connecter avec Google'}
          </span>
        </button>

        {/* Discovery / Direct Assessment Button */}
        <button
          onClick={onStartOnboarding}
          className="w-full py-3.5 px-4 bg-zinc-900 hover:bg-zinc-800/80 active:scale-[0.99] border border-zinc-800 text-zinc-200 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2"
        >
          <span>Démarrer l'État des Lieux (Mode Invité)</span>
          <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
        </button>

        <p className="text-[10px] text-zinc-600 text-center font-mono pt-1">
          Données synchronisées en local et Cloud Firestore sécurisé.
        </p>
      </div>
    </div>
  );
};
