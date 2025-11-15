import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import QuestsPage from './pages/quests/QuestsPage';
import QuestDetailPage from './pages/quests/QuestDetailPage';
import CreateQuestPage from './pages/quests/CreateQuestPage';
import ProfilePage from './pages/profile/ProfilePage';
import SocialPage from './pages/social/SocialPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import SubscriptionsPage from './pages/subscriptions/SubscriptionsPage';

// Layout
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" />} />
      </Route>

      {/* Protected Routes */}
      <Route element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/quests" element={<QuestsPage />} />
        <Route path="/quests/:questId" element={<QuestDetailPage />} />
        <Route path="/quests/create" element={<CreateQuestPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/social" element={<SocialPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/subscriptions" element={<SubscriptionsPage />} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
