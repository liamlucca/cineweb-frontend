import { Link, useNavigate } from "react-router-dom";
import type { User } from "../types/index.ts";

interface MainNavbarProps {
  // null when nobody is logged in
  user: User | null
  onLogout: () => void
}

function MainNavbar({ user, onLogout }: MainNavbarProps) {
  const navigate = useNavigate();

  function handleLogout() {
    onLogout();
    navigate("/");
  }

  return (
<div className="navbar bg-base-100 shadow-sm">
  {/*============== LEFT ==============*/}

  {/*Title*/}
  <div className="flex-1">
    <Link className="btn btn-ghost text-xl" to="/">Absolute Cinema</Link>
  </div>
  
  {/*============== RIGHT ==============*/}

  {/*Guests only see the log in button*/}
  {!user && (
    <Link className="btn btn-primary btn-sm md:mr-10" to="/login">Log In</Link>
  )}

  {/*Messages for the user*/}
  {user && (
  <div className="flex gap-2">
    <span className="text-rotate justify-end self-center mr-2">
      <span className="*:justify-self-end">
        <span>Hi, {user.username}</span>  
        <span>What are you going to watch today?</span>
      </span>
  </span>

    {/*Avatar + its dropdown menu*/}
    <div className="dropdown dropdown-end">
      {/*avatar*/}
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar md:mr-10">
        <div className="w-10 rounded-full">
          <img
            alt="Your avatar"
            src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
        </div>
      </div>
      {/*avatar dropdown menu*/}
      <ul tabIndex={-1} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/profile">My Profile</Link></li>
        {/*these routes are viewer-only, so administrators would just be sent back home*/}
        {user.role === 'viewer' && (
          <>
            <li><Link to="/my-videos">My Videos</Link></li>
            <li><Link to="/upload">Upload Video</Link></li>
            <li><Link to="/upload-series">Upload Series</Link></li>
          </>
        )}
        <li><button type="button" onClick={handleLogout}>Log Out</button></li>
      </ul>
    </div>
  </div>
  )}
</div>
  );
}

export default MainNavbar
