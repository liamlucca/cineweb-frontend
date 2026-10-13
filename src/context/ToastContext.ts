import { createContext } from 'react';

export type ToastKind = 'success' | 'error' | 'info';

export interface ToastContextValue {
  // shows a short message in the corner of the screen for a few seconds
  notify: (message: string, kind?: ToastKind) => void
}

// Outside a ToastProvider (for example in unit tests) notify does nothing
export const ToastContext = createContext<ToastContextValue>({ notify: () => undefined });
