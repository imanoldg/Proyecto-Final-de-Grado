import { useState } from "react";
import ClientDashboard from "./pages/ClientDashboard";
import RegisterPage from "./pages/RegisterPage";
import TrainerDashboard from "./pages/TrainerDashboard";
import LoginPage from "./pages/LoginPage";
import { getCurrentUser } from "./lib/userDb";
import type { UserRole } from "./lib/userDb";
import "./index.css";

type AppView = "login" | "register" | "dashboard";

const currentUser = getCurrentUser();

function App() {
  const [view, setView] = useState<AppView>(currentUser ? "dashboard" : "login");
  const [role, setRole] = useState<UserRole>(currentUser?.role ?? "entrenador");

  if (view === "login") {
    return (
      <LoginPage
        onLogin={(selectedRole) => {
          setRole(selectedRole);
          setView("dashboard");
        }}
        onGoToRegister={() => setView("register")}
      />
    );
  }

  if (view === "register") {
    return (
      <RegisterPage
        onRegister={(selectedRole) => {
          setRole(selectedRole);
          setView("dashboard");
        }}
        onBackToLogin={() => setView("login")}
      />
    );
  }

  if (role === "cliente") {
    return <ClientDashboard />;
  }

  return <TrainerDashboard />;
}

export default App;
