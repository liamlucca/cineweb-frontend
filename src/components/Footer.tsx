import { Link } from 'react-router-dom';
import Logo from './Logo.tsx';
import { APP_NAME } from '../hooks/useDocumentTitle.ts';

// Footer of every page: the app, quick links and the project's repositories
function Footer() {
  return (
    <footer className="bg-base-200 text-base-content mt-12">
      <div className="footer sm:footer-horizontal max-w-6xl mx-auto p-8 sm:p-10">
        <aside className="gap-2">
          <Logo small />
          <p className="opacity-70 max-w-xs">Watch, upload and rate movies and series.</p>
        </aside>
        <nav aria-label="Explore">
          <h2 className="footer-title">Explore</h2>
          <Link to="/" className="link link-hover">Home</Link>
          <Link to="/search" className="link link-hover">Search</Link>
          <Link to="/search?type=movie" className="link link-hover">Movies</Link>
          <Link to="/search?type=series" className="link link-hover">Series</Link>
        </nav>
        <nav aria-label="Project">
          <h2 className="footer-title">Project</h2>
          <a className="link link-hover" href="https://github.com/liamlucca/cineweb-frontend" target="_blank" rel="noreferrer">Frontend on GitHub</a>
          <a className="link link-hover" href="https://github.com/EduardoMarino73/TP-BackEnd" target="_blank" rel="noreferrer">Backend on GitHub</a>
        </nav>
      </div>
      <p className="text-center text-xs opacity-60 pb-6 px-4">
        {APP_NAME} · Software Development (DSW) course project
      </p>
    </footer>
  );
}

export default Footer;
