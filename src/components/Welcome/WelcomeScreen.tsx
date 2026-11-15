import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Activity, 
  MapPin, 
  Bot, 
  ArrowRight, 
  ShieldCheck, 
  Download, 
  Music, 
  Smartphone, 
  X,
  AlertCircle
} from 'lucide-react';
import { loginWithGoogle } from '../../services/firebase';
import { GoogleAuthUser, UserProfile } from '../../types';

interface WelcomeScreenProps {
  onStartOnboarding: () => void;
  onGoogleSignInSuccess: (googleUser: GoogleAuthUser) => void;
  onError: (error: { title: string; message: string; code?: string; actionText?: string; onAction?: () => void }) => void;
  onOpenFirebaseConfig: () => void;
  profile?: UserProfile | null;
  onOpenAccountModal?: () => void;
  onEnterApp?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStartOnboarding,
  onGoogleSignInSuccess,
  onError,
  onOpenFirebaseConfig,
  profile,
  onOpenAccountModal,
  onEnterApp
}) => {
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallGuide, setShowInstallGuide] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowInstallGuide(true);
    }
  };

  const handleGoogleClick = async () => {
    setIsSigningIn(true);
    try {
      const firebaseUser = await loginWithGoogle();
      const googleUser: GoogleAuthUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL
      };
      onGoogleSignInSuccess(googleUser);
    } catch (err: any) {
      const message = err.message || "Échec lors de l'authentification avec Google.";
      const isMissingConfig = message.includes('CONFIGURATION_MANQUANTE');

      onError({
        title: isMissingConfig ? 'Configuration Firebase Requise' : 'Erreur de Connexion Google',
        message: message,
        code: err.code || (isMissingConfig ? 'FIREBASE_NOT_CONFIGURED' : 'AUTH_ERROR'),
        actionText: isMissingConfig ? 'Configurer Firebase maintenant' : undefined,
        onAction: isMissingConfig ? onOpenFirebaseConfig : undefined
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between px-5 py-6 max-w-md mx-auto select-none animate-in fade-in duration-300">
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

        {!isStandalone && (
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-emerald-900/80 hover:border-emerald-500 text-emerald-400 rounded-lg text-xs font-medium transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Installer l'app</span>
          </button>
        )}
      </div>

      {/* Hero Presentation */}
      <div className="my-auto py-4 space-y-5">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-semibold block mb-2">
            Condition Physique & Performance
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-100 leading-tight">
            Votre entraînement, calibré avec précision.
          </h1>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            Évaluation initiale exhaustive, adaptation automatique selon votre salle (Maison vs Club), lecteur musical style Waze et coach IA avec validation manuelle.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="space-y-2">
          <div className="p-3 bg-zinc-900/40 border border-zinc-800/80 rounded-xl flex items-start gap-3">
            <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-emerald-400 shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-zinc-200">État des Lieux & Tests Guidés</h2>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Batterie de tests initiaux de force et d aérobie avec chronomètres intégrés.
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
                Plein écran étape par étape, widget musical style Waze et bips de repos.
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
                Recommandations concrètes activables sous votre validation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons & Authentication */}
      <div className="space-y-2.5 pt-2">
        {/* If already authenticated with Google */}
        {profile?.isGoogleAuthenticated && profile.googleUser ? (
          <div className="p-3.5 bg-zinc-900 border border-emerald-500/50 rounded-2xl space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                {profile.googleUser.photoURL ? (
                  <img
                    src={profile.googleUser.photoURL}
                    alt=""
                    className="w-10 h-10 rounded-full border-2 border-emerald-500 object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-zinc-950 font-bold flex items-center justify-center shrink-0">
                    {profile.googleUser.displayName?.charAt(0) || 'G'}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-zinc-100 truncate block">
                      {profile.googleUser.displayName || profile.name}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded">
                      Connecté
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 truncate block">
                    {profile.googleUser.email}
                  </span>
                </div>
              </div>

              {onOpenAccountModal && (
                <button
                  onClick={onOpenAccountModal}
                  className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition"
                >
                  Mon Compte
                </button>
              )}
            </div>

            <button
              onClick={onEnterApp || onStartOnboarding}
              className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-zinc-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Accéder à Mon Espace Athlète</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {/* Real Google Sign-In Button */}
            <button
              onClick={handleGoogleClick}
              disabled={isSigningIn}
              className="w-full py-3.5 px-4 bg-zinc-100 hover:bg-white active:scale-[0.99] text-zinc-950 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-3 shadow-lg shadow-zinc-950/50 disabled:opacity-50"
            >
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
                {isSigningIn ? 'Authentification Google en cours...' : 'Se connecter avec Google'}
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
          </>
        )}
      </div>

      {/* Install Guide Modal */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full sm:max-w-sm bg-zinc-950 border border-zinc-800 rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-zinc-100">Installer l'application</h3>
              </div>
              <button
                onClick={() => setShowInstallGuide(false)}
                className="p-1 text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                <span className="font-semibold text-zinc-200 block mb-1">Sur iPhone (Safari) :</span>
                <ol className="list-decimal pl-4 space-y-1 text-zinc-400 text-[11px]">
                  <li>Appuyez sur le bouton de <strong>Partage</strong> en bas de l'écran.</li>
                  <li>Faites défiler et touchez <strong>« Sur l'écran d'accueil »</strong>.</li>
                  <li>Appuyez sur <strong>Ajouter</strong> en haut à droite.</li>
                </ol>
              </div>

              <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                <span className="font-semibold text-zinc-200 block mb-1">Sur Android (Chrome) :</span>
                <ol className="list-decimal pl-4 space-y-1 text-zinc-400 text-[11px]">
                  <li>Touchez les <strong>trois petits points (⋮)</strong> en haut à droite.</li>
                  <li>Appuyez sur <strong>« Installer l'application »</strong>.</li>
                </ol>
              </div>
            </div>

            <button
              onClick={() => setShowInstallGuide(false)}
              className="w-full mt-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl"
            >
              Compris
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
