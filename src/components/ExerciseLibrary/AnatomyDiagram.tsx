import React from 'react';
import { MuscleGroup } from '../../types';

interface AnatomyDiagramProps {
  primaryMuscles: MuscleGroup[];
  secondaryMuscles?: MuscleGroup[];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AnatomyDiagram: React.FC<AnatomyDiagramProps> = ({
  primaryMuscles,
  secondaryMuscles = [],
  size = 'md',
  className = ''
}) => {
  const getMuscleColor = (muscle: MuscleGroup): string => {
    if (primaryMuscles.includes(muscle)) {
      return '#10b981'; // Primary: Athletic Emerald
    }
    if (secondaryMuscles.includes(muscle)) {
      return '#06b6d4'; // Secondary: Tech Cyan
    }
    return '#27272a'; // Inactive: Dark Slate
  };

  const getMuscleOpacity = (muscle: MuscleGroup): number => {
    if (primaryMuscles.includes(muscle)) return 1.0;
    if (secondaryMuscles.includes(muscle)) return 0.75;
    return 0.35;
  };

  const dimensions = {
    sm: { width: 90, height: 130 },
    md: { width: 140, height: 190 },
    lg: { width: 200, height: 260 }
  }[size];

  return (
    <div className={`flex items-center justify-center gap-3 bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/80 ${className}`}>
      {/* Front View */}
      <div className="flex flex-col items-center">
        <span className="text-[10px] tracking-wider uppercase font-mono text-zinc-500 mb-1">Face</span>
        <svg
          viewBox="0 0 100 150"
          width={dimensions.width / 2}
          height={dimensions.height}
          className="overflow-visible"
        >
          {/* Head & Neck */}
          <circle cx="50" cy="14" r="8" fill="#3f3f46" opacity="0.4" />
          <path d="M47 22 L53 22 L53 28 L47 28 Z" fill="#3f3f46" opacity="0.4" />

          {/* Shoulders / Deltoids */}
          <path
            d="M31 29 C26 31 24 37 25 43 C29 44 33 39 35 33 Z"
            fill={getMuscleColor('shoulders')}
            opacity={getMuscleOpacity('shoulders')}
          />
          <path
            d="M69 29 C74 31 76 37 75 43 C71 44 67 39 65 33 Z"
            fill={getMuscleColor('shoulders')}
            opacity={getMuscleOpacity('shoulders')}
          />

          {/* Chest / Pectorals */}
          <path
            d="M36 30 C42 30 48 31 49 37 C49 43 41 47 36 46 C34 40 34 33 36 30 Z"
            fill={getMuscleColor('chest')}
            opacity={getMuscleOpacity('chest')}
          />
          <path
            d="M64 30 C58 30 52 31 51 37 C51 43 59 47 64 46 C66 40 66 33 64 30 Z"
            fill={getMuscleColor('chest')}
            opacity={getMuscleOpacity('chest')}
          />

          {/* Biceps */}
          <path
            d="M24 44 C22 49 23 55 25 59 C28 58 29 52 28 45 Z"
            fill={getMuscleColor('biceps')}
            opacity={getMuscleOpacity('biceps')}
          />
          <path
            d="M76 44 C78 49 77 55 75 59 C72 58 71 52 72 45 Z"
            fill={getMuscleColor('biceps')}
            opacity={getMuscleOpacity('biceps')}
          />

          {/* Forearms */}
          <path d="M22 61 L18 78 L22 80 L26 62 Z" fill="#3f3f46" opacity="0.3" />
          <path d="M78 61 L82 78 L78 80 L74 62 Z" fill="#3f3f46" opacity="0.3" />

          {/* Abs / Core */}
          <rect
            x="44"
            y="48"
            width="12"
            height="23"
            rx="2"
            fill={getMuscleColor('abs')}
            opacity={getMuscleOpacity('abs')}
          />

          {/* Quadriceps (Thighs front) */}
          <path
            d="M38 74 C34 82 33 97 36 109 C40 109 46 98 47 74 Z"
            fill={getMuscleColor('quadriceps')}
            opacity={getMuscleOpacity('quadriceps')}
          />
          <path
            d="M62 74 C66 82 67 97 64 109 C60 109 54 98 53 74 Z"
            fill={getMuscleColor('quadriceps')}
            opacity={getMuscleOpacity('quadriceps')}
          />

          {/* Calves (Front/Shins) */}
          <path
            d="M36 112 L35 137 L41 137 L43 112 Z"
            fill={getMuscleColor('calves')}
            opacity={getMuscleOpacity('calves')}
          />
          <path
            d="M64 112 L65 137 L59 137 L57 112 Z"
            fill={getMuscleColor('calves')}
            opacity={getMuscleOpacity('calves')}
          />
        </svg>
      </div>

      {/* Vertical Divider */}
      <div className="w-[1px] h-28 bg-zinc-800/80 my-auto" />

      {/* Back View */}
      <div className="flex flex-col items-center">
        <span className="text-[10px] tracking-wider uppercase font-mono text-zinc-500 mb-1">Dos</span>
        <svg
          viewBox="0 0 100 150"
          width={dimensions.width / 2}
          height={dimensions.height}
          className="overflow-visible"
        >
          {/* Head & Neck back */}
          <circle cx="50" cy="14" r="8" fill="#3f3f46" opacity="0.4" />

          {/* Traps & Upper Back */}
          <path
            d="M40 24 L60 24 L67 36 L50 45 L33 36 Z"
            fill={getMuscleColor('back')}
            opacity={getMuscleOpacity('back')}
          />

          {/* Lats (Dorsaux) */}
          <path
            d="M33 38 C32 46 36 54 44 58 L46 45 Z"
            fill={getMuscleColor('back')}
            opacity={getMuscleOpacity('back')}
          />
          <path
            d="M67 38 C68 46 64 54 56 58 L54 45 Z"
            fill={getMuscleColor('back')}
            opacity={getMuscleOpacity('back')}
          />

          {/* Triceps */}
          <path
            d="M24 43 C22 50 23 57 26 60 C27 55 28 48 27 43 Z"
            fill={getMuscleColor('triceps')}
            opacity={getMuscleOpacity('triceps')}
          />
          <path
            d="M76 43 C78 50 77 57 74 60 C73 55 72 48 73 43 Z"
            fill={getMuscleColor('triceps')}
            opacity={getMuscleOpacity('triceps')}
          />

          {/* Glutes (Fessiers) */}
          <path
            d="M38 67 C35 73 37 81 48 81 L48 67 Z"
            fill={getMuscleColor('glutes')}
            opacity={getMuscleOpacity('glutes')}
          />
          <path
            d="M62 67 C65 73 63 81 52 81 L52 67 Z"
            fill={getMuscleColor('glutes')}
            opacity={getMuscleOpacity('glutes')}
          />

          {/* Hamstrings (Arrière cuisses) */}
          <path
            d="M37 83 C34 92 35 103 38 108 L47 108 L47 83 Z"
            fill={getMuscleColor('hamstrings')}
            opacity={getMuscleOpacity('hamstrings')}
          />
          <path
            d="M63 83 C66 92 65 103 62 108 L53 108 L53 83 Z"
            fill={getMuscleColor('hamstrings')}
            opacity={getMuscleOpacity('hamstrings')}
          />

          {/* Calves (Mollets dos) */}
          <path
            d="M35 112 C33 120 34 130 37 137 L42 137 C44 128 44 118 43 112 Z"
            fill={getMuscleColor('calves')}
            opacity={getMuscleOpacity('calves')}
          />
          <path
            d="M65 112 C67 120 66 130 63 137 L58 137 C56 128 56 118 57 112 Z"
            fill={getMuscleColor('calves')}
            opacity={getMuscleOpacity('calves')}
          />
        </svg>
      </div>
    </div>
  );
};
