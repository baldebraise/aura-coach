import React, { useState } from 'react';
import { UserProfile, GymLocation } from '../../types';
import { EQUIPMENT_LABELS } from '../../data/defaultGyms';
import { 
  User, 
  MapPin, 
  Award, 
  Settings, 
  Plus, 
  ShieldCheck, 
  RotateCcw,
  Key,
  Check
} from 'lucide-react';

interface ProfileViewProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onResetOnboarding: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onUpdateProfile,
  onResetOnboarding
}) => {
  const [isEditingKey, setIsEditingKey] = useState<boolean>(false);
  const [keyInput, setKeyInput] = useState<string>(profile.geminiApiKey || '');

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Profile Header */}
      <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 font-bold font-mono text-lg">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-base font-bold text-zinc-100">{profile.name}</h1>
            <p className="text-xs text-zinc-500">
              {profile.age} ans • {profile.heightCm} cm • {profile.weightKg} kg
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono uppercase px-2 py-1 bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 rounded-lg">
          {profile.primaryGoal}
        </span>
      </div>

      {/* Google Account & Gemini AI Status */}
      <div className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-zinc-100">Compte Google & Clé Gemini</h3>
          </div>
          <button
            onClick={() => setIsEditingKey(!isEditingKey)}
            className="text-xs text-emerald-400 hover:underline"
          >
            {isEditingKey ? 'Fermer' : 'Modifier'}
          </button>
        </div>

        {isEditingKey ? (
          <div className="mt-3 space-y-2">
            <input
              type="password"
              placeholder="Clé API Gemini (Google AI Studio)..."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono"
            />
            <button
              onClick={() => {
                onUpdateProfile({
                  ...profile,
                  geminiApiKey: keyInput.trim(),
                  isGoogleAuthenticated: true
                });
                setIsEditingKey(false);
              }}
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-semibold rounded-lg transition"
            >
              Enregistrer la clé
            </button>
          </div>
        ) : (
          <p className="text-xs text-zinc-400">
            {profile.geminiApiKey
              ? 'Clé Gemini active : les réponses et analyses personnalisées sont connectées à votre compte.'
              : 'Mode heuristique actif. Ajoutez votre clé Gemini pour un raisonnement multimodal avancé.'}
          </p>
        )}
      </div>

      {/* Configured Gym Locations */}
      <div className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-zinc-100">Mes Salles d'Entraînement</h3>
          </div>
          <span className="text-xs font-mono text-zinc-500">
            {profile.gyms.length} configurée{profile.gyms.length > 1 ? 's' : ''}
          </span>
        </div>

        <div className="space-y-2">
          {profile.gyms.map((gym) => (
            <div
              key={gym.id}
              className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-xl"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-zinc-200">{gym.name}</span>
                {gym.isDefault && (
                  <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded">
                    Défaut
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {gym.equipment.map((eq) => (
                  <span
                    key={eq}
                    className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800"
                  >
                    {EQUIPMENT_LABELS[eq] || eq}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Baseline Physical Test Scores */}
      <div className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl">
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-zinc-100">Tests Physiques de Référence</h3>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {profile.baselineTests.map((t) => (
            <div
              key={t.id}
              className="p-2.5 bg-zinc-950/80 border border-zinc-800/80 rounded-xl text-xs"
            >
              <span className="text-zinc-400 block truncate text-[11px]">{t.name}</span>
              <span className="text-sm font-mono font-bold text-zinc-100 mt-0.5 block">
                {t.value || '-'} {t.unit}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Reset Onboarding Option */}
      <div className="pt-2">
        <button
          onClick={() => {
            if (window.confirm('Voulez-vous réinitialiser le questionnaire d état des lieux ?')) {
              onResetOnboarding();
            }
          }}
          className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-medium rounded-xl transition flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refaire l'état des lieux & questionnaire</span>
        </button>
      </div>
    </div>
  );
};
