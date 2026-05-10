interface MainNavbarProps {
  username: string
}

function MainNavbar({username}: MainNavbarProps) {
  return (
<div className="navbar bg-base-100 shadow-sm">
  {/*============== IZQUIERDA ==============*/}

  {/*Titulo*/}
  <div className="flex-1">
    <a className="btn btn-ghost text-xl" href="/">Cinema Absoluto</a>
  </div>
  
  {/*============== DERECHA ==============*/}

  {/*Mensajes para el usuario*/}
  <div className="flex gap-2">
    <span className="text-rotate justify-end self-center mr-2">
      <span>
        <span>Hola, {username}</span>           {/*[NOTA]: ALINEAR ESTOS TEXTOS AL FINAL (pegado al avatar)*/}
        <span>¿Qué vas a ver hoy?</span>
      </span>
  </span>

    {/*Avatar + Su menu desplegable*/}
    <div className="dropdown dropdown-end">
      {/*avatar*/}
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar md:mr-10">
        <div className="w-10 rounded-full">
          <img
            alt="Tailwind CSS Navbar component"
            src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
        </div>
      </div>
      {/*menu desplegable del avatar*/}
      <ul tabIndex={-1} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
        <li><a className="justify-between">Perfil<span className="badge">Nuevo</span></a></li>
        <li><a href="/subir">Subir Video</a></li>
        <li><a>Mis Videos</a></li>
        <li><a>Cerrar Sesión</a></li>
      </ul>
    </div>
  </div>
</div>
  );
}

export default MainNavbar