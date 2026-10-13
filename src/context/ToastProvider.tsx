import {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import type { ReactNode } from 'react';
import { ToastContext } from './ToastContext.ts';
import type { ToastKind } from './ToastContext.ts';

interface Toast {
  id: number
  message: string
  kind: ToastKind
}

interface ToastProviderProps {
  children: ReactNode
}

// how long a toast stays on screen, and how many can be shown at once
const TOAST_DURATION_MS = 3500;
const MAX_TOASTS = 3;

const ALERT_CLASS: Record<ToastKind, string> = {
  success: 'alert-success',
  error: 'alert-error',
  info: 'alert-info',
};

// Keeps the list of toasts and shows them with DaisyUI's "toast" in the bottom corner
function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const timers = useRef<number[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback((message: string, kind: ToastKind = 'success') => {
    const id = nextId.current;
    nextId.current += 1;
    setToasts((current) => [...current, { id, message, kind }].slice(-MAX_TOASTS));
    timers.current.push(window.setTimeout(() => dismiss(id), TOAST_DURATION_MS));
  }, [dismiss]);

  // clear the pending timers if the provider goes away
  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* aria-live: screen readers announce each new message */}
      <div className="toast toast-end toast-bottom z-50" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} role="status" className={`alert ${ALERT_CLASS[toast.kind]} shadow-lg`}>
            <span>{toast.message}</span>
            <button type="button" className="btn btn-ghost btn-xs" onClick={() => dismiss(toast.id)} aria-label="Close message">
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
