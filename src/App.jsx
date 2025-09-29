import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './ui/AppShell';
import { AppDataProvider } from './context/AppDataContext';
import Dashboard from './pages/Dashboard';
import Chores from './pages/Chores';
import Rewards from './pages/Rewards';
import Kids from './pages/Kids';
import KidDetailPage from './pages/KidDetail';
import Pet from './pages/Pet';
import Settings from './pages/Settings';

export default function App() {
  return (
    <AppDataProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Dashboard />} />
            <Route path="chores" element={<Chores />} />
            <Route path="rewards" element={<Rewards />} />
            <Route path="kids" element={<Kids />} />
            <Route path="kids/:kidId" element={<KidDetailPage />} />
            <Route path="pet" element={<Pet />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppDataProvider>
  );
}
