import { useContext } from 'react';
import { ConfirmContext } from '../context/ConfirmContext.ts';
import type { ConfirmContextValue } from '../context/ConfirmContext.ts';

// The hook every component uses before a risky action:
// const { confirm } = useConfirm(); if (!(await confirm({ ... }))) return;
function useConfirm(): ConfirmContextValue {
  return useContext(ConfirmContext);
}

export default useConfirm;
