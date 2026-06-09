import { useState } from 'react'

function AuthPage() {
  const [esRegistro, setEsRegistro] = useState(false)

  return (
    <div className="min-h-[78vh] flex flex-col gap-8 items-center justify-center bg-base-100">

    <h1 className="text-5xl font-bold">Bienvenido!</h1>

      <div className="flex items-center">
        <div className="card bg-neutral w-80 shadow-xl">
          <div className="card-body">
            <h2 className="card-title justify-center">
              {esRegistro ? 'Registrarme' : 'Iniciar Sesión'}
            </h2>
            <p className="text-sm">Ingrese sus datos:</p>

            {esRegistro && (
              <>
                <input className="input input-bordered w-full" placeholder="Nombre..." />
                <input className="input input-bordered w-full" placeholder="Apellido..." />
              </>
            )}

            <input className="input input-bordered w-full" placeholder="Mail..." />

            {esRegistro && (
              <input className="input input-bordered w-full" placeholder="Nombre de Usuario..." />
            )}

            <input className="input input-bordered w-full" placeholder="Contraseña..." type="password" />

            <button className="btn bg-primary text-primary-content w-full">
              {esRegistro ? 'Registrarme' : 'Ingresar'}
            </button>

            <button
              className="link color-base-content text-sm text-center "
              onClick={() => setEsRegistro(!esRegistro)}
            >
              {esRegistro ? 'Iniciar sesión' : 'Registrarme'}
            </button>

          </div>
        </div>

      </div>
    </div>
  )
}

export default AuthPage