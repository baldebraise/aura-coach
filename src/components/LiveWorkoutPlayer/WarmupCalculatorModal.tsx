import React, { useState } from 'react';
import { X, Calculator, ArrowRight, ShieldCheck } from 'lucide-react';

interface WarmupCalculatorModalProps {
  exerciseName: string;
  defaultWorkingWeightKg?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const WarmupCalculatorModal: React.FC<WarmupCalculatorModalProps> = ({
  exerciseName,
  defaultWorkingWeightKg = 60,
  isOpen,
  onClose
}) => {
  const [workingWeight, setWorkingWeight] = useState<number>(defaultWorkingWeightKg);

  if (!isOpen) return null;

  // Pyramid warmup calculations
  const warmupSteps = [
    {
      percentage: 'Barre à vide / Poids plume',
      weight: Math.min(20, Math.round(workingWeight * 0.3)),
      reps: 10,
      purpose: 'Mobilisation articulaire & température'
    },
    {
      percentage: '50% Charge de travail',
      weight: Math.round((workingWeight * 0.5) / 2.5) * 2.5,
      reps: 5,
      purpose: 'Calage de la trajectoire biomécanique'
    },
    {
      percentage: '70% Charge de travail',
      weight: Math.round((workingWeight * 0.7) / 2.5) * 2.5,
      reps: 3,
      purpose: 'Recrutement neuromusculaire'
    },
    {
      percentage: '85-90% Charge de travail',
      weight: Math.round((workingWeight * 0.88) / 2.5) * 2.5,
      reps: 1,
      purpose: 'Potentiation sans fatigue métabolique'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md bg-zinc-950 border border-zinc-800 rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-950/60 border border-emerald-800/80 rounded-lg text-emerald-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">Montée en Charge</h3>
              <p className="text-xs text-zinc-500">{exerciseName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-500 hover:text-zinc-300 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Weight Input */}
        <div className="mb-5 p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl">
          <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
            Charge effective de travail visée (kg)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              step="2.5"
              value={workingWeight}
              onChange={(e) => setWorkingWeight(Math.max(0, parseFloat(e.target.value) || 0))}
              className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-lg font-mono font-bold text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
            <div className="flex gap-1.5">
              {[50, 70, 90, 110].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWorkingWeight(w)}
                  className="px-2.5 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-mono rounded-lg transition"
                >
                  {w}k
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pyramid Steps */}
        <div className="space-y-2 mb-5">
          {warmupSteps.map((step, idx) => (
            <div
              key={idx}
              className="p-3 bg-zinc-900/40 border border-zinc-800/80 rounded-xl flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] font-mono text-emerald-400 block">
                  {step.percentage}
                </span>
                <span className="text-xs text-zinc-400">{step.purpose}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-mono font-bold text-zinc-100">
                  {step.weight} kg
                </span>
                <span className="text-xs text-zinc-500 font-mono ml-1.5">
                  × {step.reps} reps
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-emerald-950/30 border border-emerald-900/50 rounded-xl flex items-center gap-2.5 text-xs text-emerald-400 mb-4">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Prenez 60 à 90 secondes de repos après le dernier palier avant d attaquer vos séries de travail.</span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl transition"
        >
          Fermer et reprendre
        </button>
      </div>
    </div>
  );
};
