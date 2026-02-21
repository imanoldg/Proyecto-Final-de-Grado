import { useState } from "react";
import type { ReactNode } from "react";
import ClientsPage from "./ClientsPage";

type MenuItem =
  | "Inicio"
  | "Clientes"
  | "Rutinas"
  | "Pedidos"
  | "Citas"
  | "Ajustes";

const menuItems: MenuItem[] = [
  "Inicio",
  "Clientes",
  "Rutinas",
  "Pedidos",
  "Citas",
  "Ajustes",
];

function TrainerDashboard() {
  const [activeSection, setActiveSection] = useState<MenuItem>("Inicio");

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-slate-800 p-6 text-white">
        <div className="mb-10">
          <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-gray-400" />
          <h2 className="text-center text-lg font-semibold">Carlos Entrenador</h2>
        </div>

        <nav className="space-y-3">
          {menuItems.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setActiveSection(item)}
              className={`w-full rounded-lg p-2 text-left transition ${
                activeSection === item ? "bg-cyan-600 text-white" : "hover:bg-slate-700"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        {activeSection === "Inicio" ? <HomePage /> : null}
        {activeSection === "Clientes" ? <ClientsPage /> : null}
        {activeSection !== "Inicio" && activeSection !== "Clientes" ? (
          <PlaceholderPage section={activeSection} />
        ) : null}
      </main>
    </div>
  );
}

function HomePage() {
  return (
    <>
      <h1 className="mb-8 text-3xl font-bold">Panel de Entrenador</h1>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard title="Clientes Activos" value="24" color="bg-blue-500" />
        <StatCard title="Rutinas Asignadas" value="15" color="bg-green-500" />
        <StatCard title="Citas de Hoy" value="5" color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Panel title="Progreso de Clientes">
          <div className="flex h-40 items-center justify-center rounded-lg bg-gray-200 text-gray-500">
            Aqui ira un grafico
          </div>
        </Panel>

        <Panel title="Actividad Semanal">
          <div className="flex h-40 items-center justify-center rounded-lg bg-gray-200 text-gray-500">
            Aqui ira grafico circular
          </div>
        </Panel>

        <Panel title="Proximas Citas">
          <ul className="space-y-2">
            <li>10:00 - Juan Perez</li>
            <li>11:30 - Laura Gomez</li>
            <li>13:00 - Pedro Diaz</li>
          </ul>
          <button className="mt-4 rounded-lg bg-gray-500 px-4 py-2 text-white transition hover:bg-gray-600">
            Ver Todas
          </button>
        </Panel>

        <Panel title="Tareas Pendientes">
          <ul className="space-y-2">
            <li>
              <input type="checkbox" className="mr-2" />
              Preparar rutina para Ana
            </li>
            <li>
              <input type="checkbox" className="mr-2" />
              Actualizar inventario
            </li>
            <li>
              <input type="checkbox" className="mr-2" />
              Enviar recordatorio
            </li>
          </ul>
          <button className="mt-4 rounded-lg bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600">
            Agregar Tarea +
          </button>
        </Panel>
      </div>
    </>
  );
}

function PlaceholderPage({ section }: { section: string }) {
  return (
    <div className="rounded-xl bg-white p-8 shadow-md">
      <h1 className="text-3xl font-bold text-slate-900">{section}</h1>
      <p className="mt-2 text-slate-600">
        Esta seccion aun no esta implementada. Ya puedes navegar a la pagina de Clientes desde el menu.
      </p>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  color: string;
}

function StatCard({ title, value, color }: StatCardProps) {
  return (
    <div className={`rounded-xl p-6 text-white shadow-md ${color}`}>
      <h3 className="text-sm">{title}</h3>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

interface PanelProps {
  title: string;
  children: ReactNode;
}

function Panel({ title, children }: PanelProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-md">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      {children}
    </div>
  );
}

export default TrainerDashboard;
