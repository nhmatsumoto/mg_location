import App from './App';
import { Navigate, Route, Routes } from 'react-router-dom';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/hotspots" element={<App />} />
      <Route path="/news" element={<App />} />
      <Route path="/support" element={<App />} />
      <Route path="/volunteers" element={<App />} />
      <Route path="/" element={<Navigate to="/hotspots" replace />} />
      <Route path="*" element={<Navigate to="/hotspots" replace />} />
    </Routes>
  );
}
