import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Layout } from './components/Layout';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { FacilitiesPage } from './pages/FacilitiesPage';
import { FacilityDetailPage } from './pages/FacilityDetailPage';
import { FundingSourcesPage } from './pages/FundingSourcesPage';
import { FundingSourceDetailPage } from './pages/FundingSourceDetailPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  // Wait for Zustand to rehydrate from localStorage before checking auth
  if (!_hasHydrated) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-500">Loading...</div>
    </div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="facilities" element={<FacilitiesPage />} />
        <Route path="facilities/:id" element={<FacilityDetailPage />} />
        <Route path="funding-sources" element={<FundingSourcesPage />} />
        <Route path="funding-sources/:id" element={<FundingSourceDetailPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:id" element={<ProjectDetailPage />} />
        {/* TODO: Add more routes */}
      </Route>
    </Routes>
  );
}

export default App;
