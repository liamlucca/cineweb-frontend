import {
  afterEach, describe, expect, it, vi,
} from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import ToastProvider from './ToastProvider.tsx';
import useToast from '../hooks/useToast.ts';

// a button that sends a toast, as any page would
function SaveButton() {
  const { notify } = useToast();
  return <button type="button" onClick={() => notify('Your profile was saved.')}>Save</button>;
}

describe('ToastProvider', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the message and hides it after a few seconds', () => {
    vi.useFakeTimers();
    render(<ToastProvider><SaveButton /></ToastProvider>);

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getByRole('status')).toHaveTextContent('Your profile was saved.');

    act(() => { vi.advanceTimersByTime(4000); });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('closes a message with its button', () => {
    render(<ToastProvider><SaveButton /></ToastProvider>);

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    fireEvent.click(screen.getByRole('button', { name: 'Close message' }));

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
