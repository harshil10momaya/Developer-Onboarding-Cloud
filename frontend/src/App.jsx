import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Repositories from './pages/Repositories';
import LearningPaths from './pages/LearningPaths';
import Modules from './pages/Modules';
import ProgressTracker from './pages/ProgressTracker';
import MentorSupport from './pages/MentorSupport';
import CodeAnalysis from './pages/CodeAnalysis';
import Documentation from './pages/Documentation';
import Discussions from './pages/Discussions';
import DevOps from './pages/DevOps';
import CourseDetail from './pages/CourseDetail';
import Admin from './pages/Admin';

const getPageKey = (pathname) => {
  const pageMap = {
    '/': 'dashboard',
    '/repositories': 'repositories',
    '/learning-paths': 'learning-paths',
    '/modules': 'modules',
    '/progress-tracker': 'progress',
    '/mentor-support': 'mentor',
    '/code-analysis': 'code-analysis',
    '/documentation': 'documentation',
    '/discussions': 'discussions',
    '/devops': 'devops',
  };
  return pageMap[pathname] || 'dashboard';
};

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f172a', color: '#94a3b8', fontSize: '18px' }}>Loading...</div>;
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f172a', color: '#94a3b8', fontSize: '18px' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppContent() {
  const location = useLocation();
  const currentPage = getPageKey(location.pathname);

  return (
    <Routes>
      {/* Public routes — NO layout */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes — WITH layout */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout currentPage={currentPage}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/repositories" element={<Repositories />} />
                <Route path="/learning-paths" element={<LearningPaths />} />
                <Route path="/modules" element={<Modules />} />
                <Route path="/progress-tracker" element={<ProgressTracker />} />
                <Route path="/mentor-support" element={<MentorSupport />} />
                <Route path="/code-analysis" element={<CodeAnalysis />} />
                <Route path="/documentation" element={<Documentation />} />
                <Route path="/discussions" element={<Discussions />} />
                <Route path="/devops" element={<DevOps />} />
                <Route path="/courses/:courseId" element={<CourseDetail />} />
                <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
