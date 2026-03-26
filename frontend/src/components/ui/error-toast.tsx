import { AlertCircle, X } from 'lucide-react';

import { Card } from '@/components/ui/card';

interface ErrorToastProps {
  message: string;
  onClose: () => void;
}

export function ErrorToast({ message, onClose }: ErrorToastProps) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 w-full max-w-sm animate-in slide-in-from-top-2 fade-in-0 duration-300">
      <Card className="pointer-events-auto border-red-300 bg-red-50 text-red-700 shadow-xl">
        <div className="flex items-start gap-3 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div className="flex-1 text-sm leading-relaxed">{message}</div>
          <button
            type="button"
            onClick={onClose}
            className="text-red-500 hover:text-red-700 transition-colors"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </Card>
    </div>
  );
}
