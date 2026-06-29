import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

interface ToastContextValue {
  showToast: (message: string, type?: 'success' | 'error') => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismiss = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="animate-slide-up flex min-w-[320px] items-start gap-3 rounded-xl border border-white/10 bg-surface-850/95 px-4 py-3.5 shadow-card backdrop-blur-xl"
          >
            <CheckCircle2
              className={`mt-0.5 h-5 w-5 shrink-0 ${toast.type === 'success' ? 'text-success' : 'text-red-400'}`}
            />
            <p className="flex-1 text-sm font-medium text-slate-200">{toast.message}</p>
            <button
              onClick={() => dismiss(toast.id)}
              className="text-slate-500 transition-colors hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
