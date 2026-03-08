import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import AppLayout from './components/AppLayout';
import DashboardPage from './pages/DashboardPage';
import RTIListPage from './pages/RTIListPage';
import AddRTIPage from './pages/AddRTIPage';
import RTIDetailsPage from './pages/RTIDetailsPage';
import EditRTIPage from './pages/EditRTIPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CalendarPage from './pages/CalendarPage';
import LoginPage from './pages/LoginPage';
import { fetchMe } from './features/auth/authSlice';

export default function App() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(fetchMe());
    }
  }, [dispatch, token]);

  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/rtis" element={<RTIListPage />} />
        <Route path="/rtis/add" element={<AddRTIPage />} />
        <Route path="/rtis/:id" element={<RTIDetailsPage />} />
        <Route path="/rtis/:id/edit" element={<EditRTIPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
      </Routes>
    </AppLayout>
  );
}
