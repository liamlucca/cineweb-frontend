import type { ReactNode } from 'react';

interface RequestStatusProps {
  loading: boolean
  // friendly message, empty when there is no error
  error: string
  isEmpty: boolean
  emptyMessage: string
  children: ReactNode
}

// Shows a spinner, an error or an empty message, and the content only when there is data
function RequestStatus({
  loading, error, isEmpty, emptyMessage, children,
}: RequestStatusProps) {
  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <span className="loading loading-spinner loading-lg" aria-label="Loading" />
      </div>
    );
  }

  if (error) {
    return <div role="alert" className="alert alert-error m-4">{error}</div>;
  }

  if (isEmpty) {
    return <p className="p-4 text-lg opacity-70">{emptyMessage}</p>;
  }

  return <>{children}</>;
}

export default RequestStatus;
