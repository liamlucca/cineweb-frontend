import type { ReactNode } from 'react';

interface RequestStatusProps {
  loading: boolean
  // friendly message, empty when there is no error
  error: string
  isEmpty: boolean
  emptyMessage: string
  // optional button or link under the empty message, e.g. "Upload a movie"
  emptyAction?: ReactNode
  children: ReactNode
}

// Shows a spinner, an error or an empty message, and the content only when there is data
function RequestStatus({
  loading, error, isEmpty, emptyMessage, emptyAction, children,
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
    if (!emptyAction) return <p className="p-4 text-lg opacity-70">{emptyMessage}</p>;
    return (
      <div className="card bg-base-200">
        <div className="card-body items-center text-center gap-3">
          <p className="text-lg opacity-80">{emptyMessage}</p>
          {emptyAction}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default RequestStatus;
