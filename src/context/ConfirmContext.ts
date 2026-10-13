import { createContext } from 'react';

export interface ConfirmOptions {
  // the question, for example 'Delete "Pilot"?'
  title: string
  // an optional sentence below the question that explains what happens
  message?: string
  // the text of the button that accepts, for example 'Delete'
  confirmLabel: string
  // paints the accept button red, for actions that delete or suspend something
  danger?: boolean
}

export interface ConfirmContextValue {
  // opens a confirmation dialog; resolves true if the user accepts and false if they cancel
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

// Outside a ConfirmProvider nothing is confirmed, so no action runs by accident
export const ConfirmContext = createContext<ConfirmContextValue>({ confirm: () => Promise.resolve(false) });
