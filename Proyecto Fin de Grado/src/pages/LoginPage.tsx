import { useState } from "react";
import type { FormEvent } from "react";
import { loginUser, saveSession } from "../lib/userDb";
import type { UserRole } from "../lib/userDb";

interface LoginPageProps {
  onLogin: (role: UserRole) => void;
  onGoToRegister: () => void;
}

function LoginPage({ onLogin, onGoToRegister }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !password) {
      setError("Completa email y contrasena.");
      return;
    }

    const result = loginUser(email, password);
    if (!result.ok || !result.user) {
      setError(result.error ?? "No se pudo iniciar sesion.");
      return;
    }

    saveSession(result.user.id);
    setError("");
    onLogin(result.user.role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 p-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-600/40 bg-slate-900/80 shadow-2xl">
        <section className="hidden w-1/2 bg-cyan-500/10 p-10 text-slate-100 lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="mb-3 inline-block rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-200">
              App de Entrenamiento Personal
            </p>
            <h1 className="text-4xl font-bold leading-tight">
              Lleva tu entrenamiento al siguiente nivel
            </h1>
            <p className="mt-4 text-slate-300">
              Inicia sesion para acceder a la aplicación.
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-300/20 bg-slate-800/60 p-5 text-sm text-slate-300">
            <p className="font-medium text-slate-100">Demo</p>
            <p className="mt-1">Puedes usar cualquier email y contrasena para entrar.</p>
          </div>
        </section>

        <section className="flex w-full items-center justify-center p-6 sm:p-10 lg:w-1/2">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md space-y-6 rounded-2xl border border-slate-700 bg-slate-900/70 p-8"
          >
            <div>
              <h2 className="text-2xl font-bold text-white">Iniciar sesion</h2>
              <p className="mt-1 text-sm text-slate-300">Accede a tu cuenta de entrenador.</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-200">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nombre@email.com"
                className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-200">
                Contrasena
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="********"
                className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-900 transition hover:bg-cyan-400"
            >
              Entrar
            </button>

            {error ? <p className="text-sm font-medium text-rose-300">{error}</p> : null}

            <button
              type="button"
              onClick={onGoToRegister}
              className="w-full rounded-xl border border-cyan-400/60 px-4 py-3 font-semibold text-cyan-200 transition hover:bg-cyan-500/10"
            >
              Registrarse
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default LoginPage;
