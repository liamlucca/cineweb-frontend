import { Link, NavLink, useNavigate } from "react-router-dom";
import type { User } from "../types/index.ts";
import Logo from "./Logo.tsx";

interface MainNavbarProps {
  // null when nobody is logged in
  user: User | null
  onLogout: () => void
}

interface NavItem {
  to: string
  label: string
}

// Links for each kind of visitor. Viewer-only routes would send administrators back home, so they are hidden.
function navItems(user: User | null): NavItem[] {
  const common = [{ to: "/", label: "Home" }, { to: "/search", label: "Search" }];
  if (user?.role === "viewer") {
    return [
      ...common,
      { to: "/my-videos", label: "My Videos" },
      { to: "/watch-later", label: "Watch later" },
    ];
  }
  if (user?.role === "administrator") return [...common, { to: "/admin", label: "Administration" }];
  return common;
}

// NavLink adds "active" to the link of the current page
const linkClass = ({ isActive }: { isActive: boolean }) => (isActive ? "active font-semibold" : "");

function MainNavbar({ user, onLogout }: MainNavbarProps) {
  const navigate = useNavigate();
  const items = navItems(user);
  const isViewer = user?.role === "viewer";

  function handleLogout() {
    onLogout();
    navigate("/");
  }

  // closes a DaisyUI dropdown after choosing an option (they stay open while they have focus)
  function closeMenus() {
    (document.activeElement as HTMLElement | null)?.blur();
  }

  return (
    <header className="navbar bg-base-100/95 backdrop-blur sticky top-0 z-40 shadow-sm px-2 sm:px-4">
      <div className="navbar-start gap-1">
        {/* phones and tablets: the links go inside a hamburger menu */}
        <div className="dropdown lg:hidden">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-square" aria-label="Open menu">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
          <ul tabIndex={-1} className="menu menu-sm dropdown-content bg-base-200 rounded-box z-50 mt-3 w-56 p-2 shadow-lg">
            {items.map((item) => (
              <li key={item.to}><NavLink to={item.to} end className={linkClass} onClick={closeMenus}>{item.label}</NavLink></li>
            ))}
            {isViewer && (
              <>
                <li className="menu-title">Upload</li>
                <li><NavLink to="/upload" className={linkClass} onClick={closeMenus}>Movie</NavLink></li>
                <li><NavLink to="/upload-series" className={linkClass} onClick={closeMenus}>Series</NavLink></li>
              </>
            )}
          </ul>
        </div>
        <Logo />
      </div>

      {/* large screens: the links are in the bar */}
      <nav className="navbar-center hidden lg:flex" aria-label="Main">
        <ul className="menu menu-horizontal gap-1 px-1">
          {items.map((item) => (
            <li key={item.to}><NavLink to={item.to} end className={linkClass}>{item.label}</NavLink></li>
          ))}
          {isViewer && (
            <li>
              <details>
                <summary>Upload</summary>
                <ul className="bg-base-200 rounded-box z-50 w-40 p-2 shadow-lg">
                  <li><NavLink to="/upload" className={linkClass} onClick={closeMenus}>Movie</NavLink></li>
                  <li><NavLink to="/upload-series" className={linkClass} onClick={closeMenus}>Series</NavLink></li>
                </ul>
              </details>
            </li>
          )}
        </ul>
      </nav>

      <div className="navbar-end gap-2">
        {/* Guests only see the log in button */}
        {!user && <Link className="btn btn-primary btn-sm" to="/login">Log In</Link>}

        {/* Avatar with the user's initial, and its dropdown menu */}
        {user && (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar avatar-placeholder" aria-label="Account menu">
              <div className="bg-primary text-primary-content w-10 rounded-full">
                <span className="text-lg font-bold">{user.username.charAt(0).toUpperCase()}</span>
              </div>
            </div>
            <ul tabIndex={-1} className="menu menu-sm dropdown-content bg-base-200 rounded-box z-50 mt-3 w-56 p-2 shadow-lg">
              <li className="menu-title">
                <span>Hi, {user.username}</span>
                <span className="font-normal opacity-70">{user.role === "administrator" ? "Administrator" : "Viewer"}</span>
              </li>
              <li><NavLink to="/profile" className={linkClass} onClick={closeMenus}>My Profile</NavLink></li>
              <li><button type="button" onClick={handleLogout}>Log Out</button></li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}

export default MainNavbar
