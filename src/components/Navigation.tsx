import React from 'react';
import { LayoutDashboard, Dumbbell, BookOpen, Bot, User } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'workout' | 'library' | 'ai' | 'profile';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isWorkoutActive?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  isWorkoutActive
}) => {
  const tabs = [
    { id: 'dashboard' as ActiveTab, label: 'Accueil', icon: LayoutDashboard },
    { id: 'workout' as ActiveTab, label: 'Séance', icon: Dumbbell, badge: isWorkoutActive },
    { id: 'library' as ActiveTab, label: 'Exercices', icon: BookOpen },
    { id: 'ai' as ActiveTab, label: 'Coach IA', icon: Bot },
    { id: 'profile' as ActiveTab, label: 'Profil', icon: User }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 border-t border-zinc-800/80 backdrop-blur-lg pb-safe">
      <div className="max-w-md mx-auto px-4 flex items-center justify-between h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition relative ${
                isActive ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </div>
              <span className="text-[10px] font-medium tracking-tight mt-1">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
