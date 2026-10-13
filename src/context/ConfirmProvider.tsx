import {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import type { ReactNode } from 'react';
import { ConfirmContext } from './ConfirmContext.ts';
import type { ConfirmOptions } from './ConfirmContext.ts';

interface ConfirmProviderProps {
  children: ReactNode
}

// Shows one confirmation dialog at a time with DaisyUI's "modal", in place of window.confirm
function ConfirmProvider({ children }: ConfirmProviderProps) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  // resolves the promise of the question on screen
  const resolver = useRef<((accepted: boolean) => void) | null>(null);

  const answer = useCallback((accepted: boolean) => {
    resolver.current?.(accepted);
    resolver.current = null;
    setOptions(null);
  }, []);

  const confirm = useCallback((next: ConfirmOptions) => new Promise<boolean>((resolve) => {
    // a new question replaces an unanswered one, which counts as cancelled
    resolver.current?.(false);
    resolver.current = resolve;
    setOptions(next);
  }), []);

  // Escape cancels, like the browser's dialog
  useEffect(() => {
    if (!options) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') answer(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [options, answer]);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {options && (
        <div className="modal modal-open modal-bottom sm:modal-middle" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <div className="modal-box">
            <h3 id="confirm-title" className="text-lg font-bold">{options.title}</h3>
            {options.message && <p className="py-4">{options.message}</p>}
            <div className="modal-action">
              {/* the focus starts on "Cancel", so pressing Enter by mistake changes nothing */}
              <button type="button" className="btn btn-ghost" onClick={() => answer(false)} autoFocus>
                Cancel
              </button>
              <button
                type="button"
                className={`btn ${options.danger ? 'btn-error' : 'btn-primary'}`}
                onClick={() => answer(true)}
              >
                {options.confirmLabel}
              </button>
            </div>
          </div>
          {/* clicking outside the box cancels (Escape does the same from the keyboard) */}
          <div className="modal-backdrop" onClick={() => answer(false)} aria-hidden="true" />
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export default ConfirmProvider;
