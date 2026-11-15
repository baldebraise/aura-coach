import React, { useState } from 'react';
import { UserProfile, GymLocation } from '../../types';
import { EQUIPMENT_LABELS } from '../../data/defaultGyms';
import { 
  User, 
  MapPin, 
  Award, 
  ShieldCheck, 
  RotateCcw
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

      {/* Google Account & Gemini AI Engine Status (Zero API Key required) */}
      <div className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-zinc-100">Moteur IA Gemini & Compte</h3>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
            profile.isGoogleAuthenticated
              ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
              : 'bg-zinc-950 text-zinc-400 border-zinc-800'
          }`}>
            {profile.isGoogleAuthenticated ? 'Gemini 2.5 Flash • Actif' : 'Session Locale'}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <span className={`w-2 h-2 rounded-full ${profile.isGoogleAuthenticated ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`} />
          <span className="text-xs text-zinc-200 font-medium">
            {profile.isGoogleAuthenticated
              ? `Connecté en tant que ${profile.googleUser?.displayName || profile.googleUser?.email || profile.name}`
              : 'Non connecté avec Google'}
          </span>
        </div>

        <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
          {profile.isGoogleAuthenticated
            ? 'Toutes les analyses et réponses du coach sont traitées directement via votre session Google. Aucune clé API manuelle n est requise.'
            : 'Connectez votre compte Google pour débloquer les réponses interactives du conseiller scientifique.'}
        </p>
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
