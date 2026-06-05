import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import DashboardOverview from './pages/DashboardOverview';
import DiagnosisPage from './pages/DiagnosisPage';
import ProfilePage from './pages/ProfilePage';
import BlockchainPage from './pages/BlockchainPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Dashboard with nested routes — DashboardPage handles auth + layout */}
        <Route path="/dashboard" element={<DashboardPage />}>
          <Route index element={<DashboardOverview />} />
          <Route path="diagnosis" element={<DiagnosisPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="blockchain" element={<BlockchainPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;