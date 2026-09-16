import { useState } from 'react'

function AuthPage() {
  const [isRegister, setIsRegister] = useState(false)

  return (
    <div className="min-h-[78vh] flex flex-col gap-8 items-center justify-center bg-base-100">

    <h1 className="text-5xl font-bold">Welcome!</h1>

      <div className="flex items-center">
        <div className="card bg-neutral w-80 shadow-xl">
          <div className="card-body">
            <h2 className="card-title justify-center">
              {isRegister ? 'Sign Up' : 'Log In'}
            </h2>
            <p className="text-sm">Enter your details:</p>

            {isRegister && (
              <>
                <input className="input input-bordered w-full" placeholder="First name..." />
                <input className="input input-bordered w-full" placeholder="Last name..." />
              </>
            )}

            <input className="input input-bordered w-full" placeholder="Email..." />

            {isRegister && (
              <input className="input input-bordered w-full" placeholder="Username..." />
            )}

            <input className="input input-bordered w-full" placeholder="Password..." type="password" />

            <button className="btn bg-primary text-primary-content w-full">
              {isRegister ? 'Sign Up' : 'Log In'}
            </button>

            <button
              className="link color-base-content text-sm text-center "
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? 'Log in' : 'Sign up'}
            </button>

          </div>
        </div>

      </div>
    </div>
  )
}

export default AuthPage
