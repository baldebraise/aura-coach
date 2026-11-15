import React from 'react';
import { UserProfile } from '../../types';
import { TestDefinitionId, TEST_DEFINITIONS } from './GuidedTestModal';
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  ArrowRight, 
  Dumbbell, 
  MapPin, 
  Activity, 
  Zap, 
  Heart, 
  Layers 
} from 'lucide-react';

interface CalibrationBannerProps {
  profile: UserProfile;
  onOpenTest: (testId: TestDefinitionId) => void;
  onOpenGymConfig?: () => void;
}

export const CalibrationBanner: React.FC<CalibrationBannerProps> = ({
  profile,
  onOpenTest,
  onOpenGymConfig
}) => {
  const tests: { id: TestDefinitionId; shortName: string; categoryLabel: string; icon: any }[] = [
    { id: 'test-upper', shortName: 'Haut & Poussée', categoryLabel: 'Pompes', icon: Dumbbell },
    { id: 'test-lower', shortName: 'Bas & Cuisses', categoryLabel: 'Chaise 90°', icon: Zap },
    { id: 'test-core', shortName: 'Gainage & Tronc', categoryLabel: 'Planche', icon: Layers },
    { id: 'test-cardio', shortName: 'Cardio & VMA', categoryLabel: 'Test 6 min', icon: Heart }
  ];

  const completedTests = profile.baselineTests || [];
  const completedCount = tests.filter((t) => completedTests.some((b) => b.id === t.id && b.value !== undefined)).length;
  const progressPercent = Math.round((completedCount / tests.length) * 100);

  return (
    <div className="p-4 bg-gradient-to-br from-zinc-900/90 via-zinc-950 to-zinc-950 border border-zinc-800 rounded-2xl shadow-lg relative overflow-hidden">
      {/* Background Accent Lines */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-200">
            Calibration Athlétique
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-emerald-400">
            {completedCount}/{tests.length} validés
          </span>
          <span className="text-[11px] font-mono text-zinc-500">
            ({progressPercent}%)
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-3.5">
        <div
          className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Info message if incomplete */}
      {completedCount < tests.length && (
        <p className="text-[11px] text-zinc-400 mb-3 leading-relaxed">
          Passez les tests initiaux (2 min chrono) pour débloquer automatiquement vos séances personnalisées et calculer vos charges optimales.
        </p>
      )}

      {/* Test Cards Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {tests.map((t) => {
          const result = completedTests.find((b) => b.id === t.id && b.value !== undefined);
          const isDone = !!result;
          const Icon = t.icon;
          const testDef = TEST_DEFINITIONS[t.id];
          const levelInfo = isDone ? testDef.computeLevel(result.value || 0) : null;

          return (
            <button
              key={t.id}
              onClick={() => onOpenTest(t.id)}
              className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between group ${
                isDone
                  ? 'bg-zinc-900/40 border-emerald-900/60 hover:border-emerald-700'
                  : 'bg-zinc-950/60 border-zinc-800/80 hover:border-amber-600/70'
              }`}
            >
              <div className="flex items-start justify-between w-full mb-1.5">
                <div className={`p-1.5 rounded-lg ${isDone ? 'bg-emerald-950/80 text-emerald-400' : 'bg-zinc-900 text-zinc-400 group-hover:text-amber-400'}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                {isDone ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Validé
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/50">
                    <Lock className="w-2.5 h-2.5" />
                    À passer
                  </span>
                )}
              </div>

              <div>
                <span className="text-xs font-semibold text-zinc-100 block group-hover:text-emerald-300 transition">
                  {t.shortName}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono block">
                  {t.categoryLabel}
                </span>
              </div>

              <div className="mt-2 pt-2 border-t border-zinc-800/60 flex items-center justify-between">
                {isDone ? (
                  <div className="flex items-center justify-between w-full text-[10px] font-mono">
                    <span className="text-zinc-300 font-bold">
                      {result.value} {result.unit}
                    </span>
                    <span className={levelInfo?.color || 'text-emerald-400'}>
                      {levelInfo?.level}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full text-[10px] font-mono text-zinc-500 group-hover:text-zinc-300">
                    <span>2 min chrono</span>
                    <ArrowRight className="w-3 h-3 text-amber-400" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Equipment Configuration Quick Link */}
      {onOpenGymConfig && (
        <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-zinc-400">
            <MapPin className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-[11px]">
              Équipement salle : <strong className="text-zinc-200">{profile.gyms?.[0]?.name || 'Salle par défaut'}</strong>
            </span>
          </div>
          <button
            onClick={onOpenGymConfig}
            className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 transition underline"
          >
            Ajuster
          </button>
        </div>
      )}
    </div>
  );
};
