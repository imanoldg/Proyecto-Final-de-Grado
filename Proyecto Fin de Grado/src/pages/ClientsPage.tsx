type ClientStatus = "Activo" | "En revision" | "Pausado";

interface Client {
  id: number;
  name: string;
  goal: string;
  plan: string;
  nextSession: string;
  status: ClientStatus;
}

const clients: Client[] = [
  {
    id: 1,
    name: "Juan Perez",
    goal: "Perdida de grasa",
    plan: "Plan Premium",
    nextSession: "Lun 10:00",
    status: "Activo",
  },
  {
    id: 2,
    name: "Laura Gomez",
    goal: "Hipertrofia",
    plan: "Plan Mensual",
    nextSession: "Mar 18:30",
    status: "Activo",
  },
  {
    id: 3,
    name: "Pedro Diaz",
    goal: "Rehabilitacion",
    plan: "Plan Basico",
    nextSession: "Mie 12:00",
    status: "En revision",
  },
  {
    id: 4,
    name: "Ana Lopez",
    goal: "Entrenamiento general",
    plan: "Plan Trimestral",
    nextSession: "Jue 09:00",
    status: "Pausado",
  },
];

function statusClassName(status: ClientStatus) {
  if (status === "Activo") {
    return "bg-emerald-100 text-emerald-700";
  }
  if (status === "En revision") {
    return "bg-amber-100 text-amber-700";
  }
  return "bg-rose-100 text-rose-700";
}

function ClientsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-md md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Clientes</h1>
          <p className="mt-1 text-slate-500">Gestiona el seguimiento y estado de tus clientes.</p>
        </div>
        <button className="rounded-lg bg-cyan-600 px-4 py-2 font-semibold text-white transition hover:bg-cyan-500">
          Nuevo cliente
        </button>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-md">
        <div className="mb-4 flex flex-col gap-3 md:flex-row">
          <input
            type="text"
            placeholder="Buscar cliente..."
            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-700 focus:border-cyan-500 focus:outline-none"
          />
          <select className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 focus:border-cyan-500 focus:outline-none">
            <option>Todos los estados</option>
            <option>Activo</option>
            <option>En revision</option>
            <option>Pausado</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-3 py-3 font-semibold">Cliente</th>
                <th className="px-3 py-3 font-semibold">Objetivo</th>
                <th className="px-3 py-3 font-semibold">Plan</th>
                <th className="px-3 py-3 font-semibold">Proxima sesion</th>
                <th className="px-3 py-3 font-semibold">Estado</th>
                <th className="px-3 py-3 font-semibold">Accion</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b border-slate-100 text-slate-700">
                  <td className="px-3 py-3 font-medium">{client.name}</td>
                  <td className="px-3 py-3">{client.goal}</td>
                  <td className="px-3 py-3">{client.plan}</td>
                  <td className="px-3 py-3">{client.nextSession}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClassName(client.status)}`}
                    >
                      {client.status}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <button className="rounded-md bg-slate-100 px-3 py-1.5 font-medium text-slate-700 transition hover:bg-slate-200">
                      Ver perfil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ClientsPage;
