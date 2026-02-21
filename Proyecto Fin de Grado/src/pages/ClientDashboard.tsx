function ClientDashboard() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-10 text-center shadow-md">
        <p className="text-sm font-semibold uppercase tracking-wider text-cyan-600">Area Cliente</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Bienvenido, cliente</h1>
        <p className="mt-3 text-slate-600">
          Tu registro se completo correctamente. Aqui podras ver tus rutinas y progreso.
        </p>
      </div>
    </div>
  );
}

export default ClientDashboard;
