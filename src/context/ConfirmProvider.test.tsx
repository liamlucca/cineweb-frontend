import { describe, expect, it } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmProvider from './ConfirmProvider.tsx';
import useConfirm from '../hooks/useConfirm.ts';

// a button that asks before deleting, as any page would
function DeleteButton() {
  const { confirm } = useConfirm();
  const [result, setResult] = useState('');

  async function remove() {
    const accepted = await confirm({
      title: 'Delete "Pilot"?', message: 'It will no longer be shown.', confirmLabel: 'Yes, delete', danger: true,
    });
    setResult(accepted ? 'deleted' : 'kept');
  }

  return (
    <>
      <button type="button" onClick={remove}>Delete</button>
      <p>{result}</p>
    </>
  );
}

function renderButton() {
  render(<ConfirmProvider><DeleteButton /></ConfirmProvider>);
  return userEvent.setup();
}

describe('ConfirmProvider', () => {
  it('shows the question and resolves true when the user accepts', async () => {
    const user = renderButton();

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('Delete "Pilot"?');
    expect(screen.getByText('It will no longer be shown.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Yes, delete' }));

    expect(screen.getByText('deleted')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('resolves false when the user cancels', async () => {
    const user = renderButton();

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.getByText('kept')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('resolves false when the user presses Escape', async () => {
    const user = renderButton();

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.keyboard('{Escape}');

    expect(screen.getByText('kept')).toBeInTheDocument();
  });

  it('starts with the focus on "Cancel"', async () => {
    const user = renderButton();

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
  });
});
