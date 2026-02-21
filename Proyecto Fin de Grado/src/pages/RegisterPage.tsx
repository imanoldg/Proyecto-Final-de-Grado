import { useState } from "react";
import type { FormEvent } from "react";
import { registerUser, saveSession } from "../lib/userDb";
import type { UserRole } from "../lib/userDb";

interface RegisterPageProps {
  onRegister: (role: UserRole) => void;
  onBackToLogin: () => void;
}

function RegisterPage({ onRegister, onBackToLogin }: RegisterPageProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("cliente");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      setError("Completa todos los campos.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contrasenas no coinciden.");
      return;
    }

    const result = registerUser({
      name,
      email,
      password,
      role,
    });

    if (!result.ok || !result.user) {
      setError(result.error ?? "No se pudo completar el registro.");
      return;
    }

    saveSession(result.user.id);
    setError("");
    onRegister(role);
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
              Crea tu cuenta y empieza hoy
            </h1>
            <p className="mt-4 text-slate-300">
              Elige si te registras como cliente o entrenador.
            </p>
          </div>
        </section>

        <section className="flex w-full items-center justify-center p-6 sm:p-10 lg:w-1/2">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md space-y-5 rounded-2xl border border-slate-700 bg-slate-900/70 p-8"
          >
            <div>
              <h2 className="text-2xl font-bold text-white">Crear cuenta</h2>
              <p className="mt-1 text-sm text-slate-300">Registra tu perfil en segundos.</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-slate-200">
                Nombre completo
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Tu nombre"
                className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none"
                required
              />
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
              <label className="block text-sm font-medium text-slate-200">Tipo de cuenta</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("cliente")}
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    role === "cliente"
                      ? "border-cyan-400 bg-cyan-500/20 text-cyan-200"
                      : "border-slate-600 bg-slate-800 text-slate-200 hover:border-cyan-400/70"
                  }`}
                >
                  Cliente
                </button>
                <button
                  type="button"
                  onClick={() => setRole("entrenador")}
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    role === "entrenador"
                      ? "border-cyan-400 bg-cyan-500/20 text-cyan-200"
                      : "border-slate-600 bg-slate-800 text-slate-200 hover:border-cyan-400/70"
                  }`}
                >
                  Entrenador
                </button>
              </div>
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

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-200">
                Repetir contrasena
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="********"
                className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none"
                required
              />
            </div>

            {error ? <p className="text-sm font-medium text-rose-300">{error}</p> : null}

            <button
              type="submit"
              className="w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-900 transition hover:bg-cyan-400"
            >
              Crear cuenta
            </button>

            <button
              type="button"
              onClick={onBackToLogin}
              className="w-full rounded-xl border border-cyan-400/60 px-4 py-3 font-semibold text-cyan-200 transition hover:bg-cyan-500/10"
            >
              Ya tengo cuenta
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default RegisterPage;
