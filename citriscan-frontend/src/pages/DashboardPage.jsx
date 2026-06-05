import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import DashboardLayout from '../components/DashboardLayout';
import './DashboardPage.css';

/**
 * DashboardPage — Auth guard + Layout shell.
 * 
 * Wraps all dashboard sub-routes with authentication
 * and the sidebar/topbar layout via DashboardLayout.
 * Child routes receive `user` and `onSignOut` through
 * React Router's Outlet context.
 */
export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await signOut(auth);
    // Full redirect clears client state per secure session management guidelines
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading__spinner"></div>
        <p>Loading CitriScan Dashboard...</p>
      </div>
    );
  }

  return <DashboardLayout onSignOut={handleSignOut} user={user} />;
}
