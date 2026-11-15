import React, { useState } from 'react';
import { StoredFirebaseConfig, getStoredFirebaseConfig, saveStoredFirebaseConfig } from '../../services/firebase';
import { Key, X, Database, ShieldAlert, ArrowRight, ExternalLink } from 'lucide-react';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved
}) => {
  const existing = getStoredFirebaseConfig();
  const [apiKey, setApiKey] = useState<string>(existing?.apiKey || '');
  const [authDomain, setAuthDomain] = useState<string>(existing?.authDomain || '');
  const [projectId, setProjectId] = useState<string>(existing?.projectId || '');
  const [rawJson, setRawJson] = useState<string>('');

  if (!isOpen) return null;

  const handleParseJson = () => {
    try {
      // Extract from object format
      const cleanJson = rawJson.replace(/const\s+firebaseConfig\s*=\s*/, '').replace(/;$/, '');
      const parsed = JSON.parse(cleanJson);
      if (parsed.apiKey) setApiKey(parsed.apiKey);
      if (parsed.authDomain) setAuthDomain(parsed.authDomain);
      if (parsed.projectId) setProjectId(parsed.projectId);
      setRawJson('');
    } catch {
      alert("Format JSON invalide. Collez l'objet firebaseConfig complet.");
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim() || !authDomain.trim() || !projectId.trim()) {
      alert("Veuillez renseigner au minimum l'API Key, l'Auth Domain et le Project ID.");
      return;
    }

    const config: StoredFirebaseConfig = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      projectId: projectId.trim()
    };

    saveStoredFirebaseConfig(config);
    onConfigSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md bg-zinc-950 border border-zinc-800 rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-zinc-100">Liaison Google Firebase</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-500 hover:text-zinc-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-3 text-xs text-zinc-400 space-y-3">
          <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-1">
            <span className="font-semibold text-zinc-200 block">Pourquoi cette étape ?</span>
            <p className="text-[11px] text-zinc-400">
              Pour déclencher l'authentification officielle Google avec votre avatar et synchroniser vos données dans le Cloud Firestore, vos identifiants Firebase de projet sont nécessaires.
            </p>
          </div>

          {/* Quick Paste JSON */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
              Option rapide : Coller votre objet firebaseConfig
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder='{ apiKey: "...", authDomain: "..." }'
                value={rawJson}
                onChange={(e) => setRawJson(e.target.value)}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
              <button
                type="button"
                onClick={handleParseJson}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-lg"
              >
                Remplir
              </button>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-3 pt-1">
            <div>
              <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                API Key
              </label>
              <input
                type="text"
                required
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                Auth Domain
              </label>
              <input
                type="text"
                required
                placeholder="mon-projet.firebaseapp.com"
                value={authDomain}
                onChange={(e) => setAuthDomain(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                Project ID
              </label>
              <input
                type="text"
                required
                placeholder="mon-projet"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 mt-2"
            >
              <span>Enregistrer et activer Google Sign-In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <a
            href="https://console.firebase.google.com/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 hover:text-emerald-400 pt-1"
          >
            <span>Ouvrir la console Firebase</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
