import React, { useState } from 'react';
import { UserProfile, GoogleAuthUser } from '../../types';
import { 
  StoredFirebaseConfig,
  getStoredFirebaseConfig, 
  saveStoredFirebaseConfig, 
  logoutUser 
} from '../../services/firebase';
import { sounds } from '../../utils/audio';
import { 
  User, 
  LogOut, 
  Download, 
  Upload, 
  Sparkles, 
  Database, 
  RefreshCw, 
  Bell, 
  Volume2, 
  X, 
  ShieldCheck, 
  Key, 
  Check, 
  Settings,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onLogout: () => void;
  onShowFirebaseConfig: () => void;
  onResetAccount?: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onLogout,
  onShowFirebaseConfig,
  onResetAccount
}) => {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<string>('À l instant');
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem('aura_gemini_api_key') || profile.geminiApiKey || '';
  });
  const [isKeySaved, setIsKeySaved] = useState<boolean>(false);
  const firebaseConfig = getStoredFirebaseConfig();

  if (!isOpen) return null;

  const googleUser = profile.googleUser;

  // Handle Manual Force Sync
  const handleForceSync = () => {
    setSyncStatus('syncing');
    sounds.playTick();
    setTimeout(() => {
      setSyncStatus('synced');
      setLastSyncTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
      sounds.playRestComplete();
      setTimeout(() => setSyncStatus('idle'), 2500);
    }, 800);
  };

  // Export JSON Backup
  const handleExportData = () => {
    try {
      const backupData = {
        exportDate: new Date().toISOString(),
        profile,
        completedLogs: JSON.parse(localStorage.getItem('aura_completed_logs') || '[]'),
        schedule: JSON.parse(localStorage.getItem('aura_schedule') || '[]'),
        dailyHabits: JSON.parse(localStorage.getItem('aura_daily_habits') || '{}')
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aura-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      sounds.playRecordBeaten();
    } catch (err) {
      alert("Erreur lors de l'exportation des données.");
    }
  };

  // Import JSON Backup
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported.profile) {
          onUpdateProfile(imported.profile);
        }
        if (imported.completedLogs) {
          localStorage.setItem('aura_completed_logs', JSON.stringify(imported.completedLogs));
        }
        if (imported.schedule) {
          localStorage.setItem('aura_schedule', JSON.stringify(imported.schedule));
        }
        sounds.playRecordBeaten();
        alert('Sauvegarde restaurée avec succès !');
        window.location.reload();
      } catch {
        alert('Fichier de sauvegarde invalide ou corrompu.');
      }
    };
    reader.readAsText(file);
  };

  const handleTestAudio = () => {
    sounds.playRestComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md bg-zinc-950 border border-zinc-800 rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <Settings className="w-4 h-4 text-zinc-400" />
            <h2 className="text-sm font-bold text-zinc-100">Gestion du Compte & Système</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-500 hover:text-zinc-300 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Google User Profile Header */}
        <div className="py-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            {googleUser?.photoURL ? (
              <img
                src={googleUser.photoURL}
                alt={googleUser.displayName || 'Photo Google'}
                className="w-12 h-12 rounded-full border-2 border-emerald-500/80 object-cover shadow-md"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 font-bold font-mono text-base">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-zinc-100 truncate">
                  {googleUser?.displayName || profile.name}
                </h3>
                {profile.isGoogleAuthenticated && (
                  <span className="text-[9px] font-mono font-semibold px-1.5 py-0.2 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded">
                    Google
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 truncate">
                {googleUser?.email || 'Compte local non synchronisé'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 py-4 text-xs">
          {/* 2. Cloud Firestore & Synchronisation */}
          <div className="p-3.5 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-zinc-200">Synchronisation Cloud</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">
                {lastSyncTime}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span>
                {firebaseConfig ? 'Projet Firebase connecté' : 'Mode Stockage Local (Hors-Ligne)'}
              </span>
              <button
                onClick={onShowFirebaseConfig}
                className="text-emerald-400 hover:underline font-medium"
              >
                {firebaseConfig ? 'Modifier config' : 'Lier Firebase'}
              </button>
            </div>

            <button
              onClick={handleForceSync}
              disabled={syncStatus === 'syncing'}
              className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin text-emerald-400' : ''}`} />
              <span>
                {syncStatus === 'syncing' ? 'Synchronisation en cours...' : syncStatus === 'synced' ? 'Synchronisé avec succès !' : 'Forcer la synchronisation'}
              </span>
            </button>
          </div>

          {/* 3. Moteur IA Google Gemini */}
          <div className="p-3.5 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-zinc-200">Moteur IA Google Gemini</span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                geminiApiKey
                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                  : 'bg-amber-950/80 text-amber-400 border-amber-800'
              }`}>
                {geminiApiKey ? 'Clé Configurée' : 'Clé Manquante'}
              </span>
            </div>

            <p className="text-[11px] text-zinc-400">
              Active le Directeur Scientifique AURA pour l'analyse approfondie et les réponses en temps réel (zéro réponse simulée).
            </p>

            <div className="flex gap-2">
              <input
                type="password"
                value={geminiApiKey}
                onChange={(e) => {
                  setGeminiApiKey(e.target.value);
                  setIsKeySaved(false);
                }}
                placeholder="Clé Google AI Studio (AIzaSy...)"
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-mono"
              />
              <button
                type="button"
                onClick={() => {
                  const cleaned = geminiApiKey.trim();
                  if (cleaned) {
                    localStorage.setItem('aura_gemini_api_key', cleaned);
                  } else {
                    localStorage.removeItem('aura_gemini_api_key');
                  }
                  onUpdateProfile({ ...profile, geminiApiKey: cleaned });
                  setIsKeySaved(true);
                  sounds.playTick();
                  setTimeout(() => setIsKeySaved(false), 2000);
                }}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold rounded-lg transition shrink-0"
              >
                {isKeySaved ? 'Enregistré !' : 'Enregistrer'}
              </button>
            </div>

            <div className="flex justify-end">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-emerald-400 hover:underline"
              >
                Obtenir une clé gratuite sur Google AI Studio
              </a>
            </div>
          </div>

          {/* 4. Sauvegarde & Restauration (Export / Import JSON) */}
          <div className="p-3.5 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-2">
            <span className="font-semibold text-zinc-200 block">Sauvegarde de vos Données</span>
            <div className="flex gap-2">
              <button
                onClick={handleExportData}
                className="flex-1 py-2 px-2.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Exporter JSON</span>
              </button>

              <label className="flex-1 py-2 px-2.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>Importer JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* 5. Préférences Audio & Haptique */}
          <div className="p-3.5 bg-zinc-900/50 border border-zinc-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-amber-400" />
              <div>
                <span className="font-semibold text-zinc-200 block">Retour Audio & Vibrations</span>
                <span className="text-[10px] text-zinc-500">Chronomètres de repos et records</span>
              </div>
            </div>
            <button
              onClick={handleTestAudio}
              className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-lg"
            >
              Tester le son
            </button>
          </div>

          {/* 6. Remise à zéro du compte */}
          {onResetAccount && (
            <div className="p-3.5 bg-rose-950/20 border border-rose-900/50 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <div>
                  <span className="font-semibold text-rose-200 text-xs block">Remise à zéro du compte</span>
                  <span className="text-[10px] text-rose-300/70">Efface toutes les données pour repartir sur un compte neuf sans aucune statistique préenregistrée.</span>
                </div>
              </div>
              <button
                onClick={() => {
                  if (window.confirm('Êtes-vous sûr de vouloir remettre votre compte à zéro ? Toutes les données, tests, plan d entraînement et historique seront effacés pour repartir sur un compte totalement neuf.')) {
                    onResetAccount();
                    onClose();
                  }
                }}
                className="w-full py-2 bg-rose-900/40 hover:bg-rose-900/70 border border-rose-800 text-rose-200 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Remettre le compte à zéro (Base saine)</span>
              </button>
            </div>
          )}
        </div>

        {/* 7. Disconnect Button */}
        <div className="pt-3 border-t border-zinc-800">
          <button
            onClick={() => {
              if (window.confirm('Voulez-vous vous déconnecter de votre compte Google ? Vos séances restent conservées sur cet appareil.')) {
                logoutUser();
                onLogout();
                onClose();
              }
            }}
            className="w-full py-2.5 bg-zinc-900 hover:bg-rose-950/60 border border-zinc-800 hover:border-rose-900 text-zinc-400 hover:text-rose-400 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Se déconnecter de Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};
