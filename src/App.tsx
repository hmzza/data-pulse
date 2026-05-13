import { Navigate, Route, Routes } from "react-router-dom";
import { RequireAuth, RequireRole } from "./auth/RequireAuth";
import { AppLayout } from "./components/AppLayout";
import { Dashboard } from "./pages/Dashboard";
import { History } from "./pages/History";
import { InvestigationResult } from "./pages/InvestigationResult";
import { Login } from "./pages/Login";
import { NewInvestigation } from "./pages/NewInvestigation";
import { Reports } from "./pages/Reports";
import { Users } from "./pages/Users";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/new" element={<NewInvestigation />} />
          <Route path="/result/:id" element={<InvestigationResult />} />
          <Route path="/history" element={<History />} />
          <Route element={<RequireRole role="super_admin" />}>
            <Route path="/users" element={<Users />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
