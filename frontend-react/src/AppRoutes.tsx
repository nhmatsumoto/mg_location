import { Suspense, lazy, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { getSessionToken } from './lib/authSession';
import { LoginPage } from './pages/LoginPage';
import { LandingPage } from './pages/LandingPage';
import { PublicMapPage } from './pages/PublicMapPage';

const CommandCenterPage = lazy(() => import('./pages/CommandCenterPage').then((m) => ({ default: m.CommandCenterPage })));
const HotspotsPage = lazy(() => import('./pages/HotspotsPage').then((m) => ({ default: m.HotspotsPage })));
const MissingPersonsPage = lazy(() => import('./pages/MissingPersonsPage').then((m) => ({ default: m.MissingPersonsPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const SearchedAreasPage = lazy(() => import('./pages/SearchedAreasPage').then((m) => ({ default: m.SearchedAreasPage })));
const RescueSupportPage = lazy(() => import('./pages/RescueSupportPage').then((m) => ({ default: m.RescueSupportPage })));
const IncidentsPage = lazy(() => import('./pages/IncidentsPage').then((m) => ({ default: m.IncidentsPage })));
const IncidentDetailPage = lazy(() => import('./pages/IncidentDetailPage').then((m) => ({ default: m.IncidentDetailPage })));
const SupportSimplePage = lazy(() => import('./pages/SupportSimplePage').then((m) => ({ default: m.SupportSimplePage })));
const RescueSearchAreasPage = lazy(() => import('./pages/RescueSearchAreasPage').then((m) => ({ default: m.RescueSearchAreasPage })));
const RescueAssignmentsPage = lazy(() => import('./pages/RescueAssignmentsPage').then((m) => ({ default: m.RescueAssignmentsPage })));
const PublicIncidentDashboardPage = lazy(() => import('./pages/PublicIncidentDashboardPage').then((m) => ({ default: m.PublicIncidentDashboardPage })));
const SimulationsPage = lazy(() => import('./pages/SimulationsPage').then((m) => ({ default: m.SimulationsPage })));
const DataHubPage = lazy(() => import('./pages/DataHubPage').then((m) => ({ default: m.DataHubPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const IntegrationsPage = lazy(() => import('./pages/IntegrationsPage').then((m) => ({ default: m.IntegrationsPage })));
const GlobalDisastersPage = lazy(() => import('./pages/GlobalDisastersPage').then((m) => ({ default: m.GlobalDisastersPage })));
function PrivateLayout() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const location = useLocation();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  if (!getSessionToken()) {
    return <Navigate to="/login" replace />;
  }

  const isGlobalDisasters = location.pathname === '/app/global-disasters';

  return (
    <AppShell 
      theme={theme} 
      onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
      variant={isGlobalDisasters ? 'tactical' : 'default'}
    >
      <Suspense fallback={<div style={{ padding: 16 }}>Carregando módulo…</div>}>
        <Routes>
          <Route path="/app/command-center" element={<CommandCenterPage />} />
          <Route path="/app/hotspots" element={<HotspotsPage />} />
          <Route path="/app/missing-persons" element={<MissingPersonsPage />} />
          <Route path="/app/reports" element={<ReportsPage />} />
          <Route path="/app/searched-areas" element={<SearchedAreasPage />} />
          <Route path="/app/rescue-support" element={<RescueSupportPage />} />
          <Route path="/app/incidents" element={<IncidentsPage />} />
          <Route path="/app/incidents/:id" element={<IncidentDetailPage />} />
          <Route path="/app/incidents/:id/support/campaigns" element={<SupportSimplePage kind="campaigns" />} />
          <Route path="/app/incidents/:id/support/donations" element={<SupportSimplePage kind="donations" />} />
          <Route path="/app/incidents/:id/support/expenses" element={<SupportSimplePage kind="expenses" />} />
          <Route path="/app/incidents/:id/rescue/search-areas" element={<RescueSearchAreasPage />} />
          <Route path="/app/incidents/:id/rescue/assignments" element={<RescueAssignmentsPage />} />
          <Route path="/app/simulations" element={<SimulationsPage />} />
          <Route path="/app/data-hub" element={<DataHubPage />} />
          <Route path="/app/integrations" element={<IntegrationsPage />} />
          <Route path="/app/global-disasters" element={<GlobalDisastersPage />} />
          <Route path="/app/settings" element={<SettingsPage />} />
          <Route path="/app/operations" element={<CommandCenterPage />} />
          <Route path="*" element={<Navigate to="/app/command-center" replace />} />
        </Routes>
      </Suspense>
    </AppShell>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/public/map" element={<PublicMapPage />} />
      <Route path="/public/transparency" element={<PublicIncidentDashboardPage />} />
      <Route path="/app/*" element={<PrivateLayout />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
