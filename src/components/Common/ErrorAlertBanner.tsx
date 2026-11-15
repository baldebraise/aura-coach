import React from 'react';
import { AlertCircle, X, Wrench, RefreshCw } from 'lucide-react';

export interface AppError {
  id: string;
  title: string;
  message: string;
  code?: string;
  actionText?: string;
  onAction?: () => void;
}

interface ErrorAlertBannerProps {
  error: AppError | null;
  onDismiss: () => void;
}

export const ErrorAlertBanner: React.FC<ErrorAlertBannerProps> = ({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <div className="fixed top-3 left-4 right-4 z-50 max-w-lg mx-auto animate-in slide-in-from-top-3 duration-200">
      <div className="p-3.5 bg-rose-950/95 border border-rose-800 text-rose-100 rounded-2xl shadow-2xl backdrop-blur-md flex items-start gap-3">
        <div className="p-1.5 bg-rose-900/80 rounded-xl text-rose-300 shrink-0 mt-0.5">
          <AlertCircle className="w-4 h-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-rose-200">{error.title}</h4>
            {error.code && (
              <span className="text-[9px] font-mono px-1.5 py-0.2 bg-rose-900 text-rose-300 rounded">
                {error.code}
              </span>
            )}
          </div>
          <p className="text-[11px] text-rose-300/90 mt-0.5 leading-relaxed">
            {error.message}
          </p>

          {error.actionText && error.onAction && (
            <button
              onClick={() => {
                error.onAction?.();
                onDismiss();
              }}
              className="mt-2 px-3 py-1 bg-rose-900 hover:bg-rose-800 text-rose-100 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
            >
              <Wrench className="w-3 h-3" />
              <span>{error.actionText}</span>
            </button>
          )}
        </div>

        <button
          onClick={onDismiss}
          className="p-1 text-rose-400 hover:text-rose-200 rounded-lg shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
