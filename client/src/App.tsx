// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import RequireAdmin from './components/RequireAdmin';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import IdeaDetail from './pages/IdeaDetail';
import Profile from './pages/Profile';
import ProjectDetail from './pages/ProjectDetail';
import AdminAudit from './pages/AdminAudit';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}> 
            <Route path="/" element={<Dashboard />} />
            <Route path="/ideas/:id" element={<IdeaDetail />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/profile" element={<Profile />} />
            {/* Admin protected */}
            <Route element={<RequireAdmin />}> 
              <Route path="/admin" element={<AdminAudit />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;

