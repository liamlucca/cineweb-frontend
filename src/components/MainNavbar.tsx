import { Link } from "react-router-dom";

interface MainNavbarProps {
  username: string
}

function MainNavbar({username}: MainNavbarProps) {
  return (
<div className="navbar bg-base-100 shadow-sm">
  {/*============== LEFT ==============*/}

  {/*Title*/}
  <div className="flex-1">
    <a className="btn btn-ghost text-xl" href="/">Absolute Cinema</a>
  </div>
  
  {/*============== RIGHT ==============*/}

  {/*Messages for the user*/}
  <div className="flex gap-2">
    <span className="text-rotate justify-end self-center mr-2">
      <span className="*:justify-self-end">
        <span>Hi, {username}</span>  
        <span>What are you going to watch today?</span>
      </span>
  </span>

    {/*Avatar + its dropdown menu*/}
    <div className="dropdown dropdown-end">
      {/*avatar*/}
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar md:mr-10">
        <div className="w-10 rounded-full">
          <img
            alt="Tailwind CSS Navbar component"
            src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
        </div>
      </div>
      {/*avatar dropdown menu*/}
      <ul tabIndex={-1} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
        <li><a href="/">Home</a></li>
        {/*<li><a className="justify-between">Profile<span className="badge">New</span></a></li>*/}
        <li><Link to="/my-videos">My Videos</Link></li>
        <li><a href="/upload">Upload Video</a></li>
        {/*<li><a>Log Out</a></li>*/}
      </ul>
    </div>
  </div>
</div>
  );
}

export default MainNavbar
