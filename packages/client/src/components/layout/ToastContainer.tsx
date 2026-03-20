import { useToastStore, type ToastType } from '../../stores/toastStore.js';

const COLORS: Record<ToastType, { border: string; text: string; icon: string }> = {
  info: { border: 'border-[var(--accent-blue)]/30', text: 'text-[var(--accent-blue)]', icon: '○' },
  error: { border: 'border-[var(--color-error)]/30', text: 'text-[var(--color-error)]', icon: '✗' },
  success: { border: 'border-[var(--color-success)]/30', text: 'text-[var(--color-success)]', icon: '✓' },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-3 right-3 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => {
        const c = COLORS[t.type];
        return (
          <div
            key={t.id}
            className={`toast-enter bg-[var(--bg-input)] border ${c.border} px-4 py-2.5 font-mono text-xs flex items-center gap-2 shadow-lg shadow-black/40`}
            role="alert"
          >
            <span className={c.text}>{c.icon}</span>
            <span className="text-[var(--text)] flex-1">{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="text-[var(--text-faint)] hover:text-[var(--text-muted)] ml-2"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
