import { Link, useLocation } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle.ts';

// Shown for any address the app does not know
function NotFoundPage() {
  const { pathname } = useLocation();

  // browser tab title
  useDocumentTitle('Page not found');

  return (
    <div className="hero min-h-[70vh]">
      <div className="hero-content text-center flex-col gap-4">
        <p className="text-7xl md:text-9xl font-black bg-gradient-to-br from-rose-500 to-orange-400 bg-clip-text text-transparent">404</p>
        <h1 className="text-2xl md:text-3xl font-bold">This page is not showing today</h1>
        <p className="opacity-70 max-w-md break-all">
          We couldn&apos;t find <code className="opacity-90">{pathname}</code>. It may have been moved, or the link may be wrong.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn btn-primary">Go home</Link>
          <Link to="/search" className="btn btn-outline">Search videos</Link>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
