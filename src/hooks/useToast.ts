import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext.ts';
import type { ToastContextValue } from '../context/ToastContext.ts';

// The hook every component uses to confirm an action: const { notify } = useToast()
function useToast(): ToastContextValue {
  return useContext(ToastContext);
}

export default useToast;
