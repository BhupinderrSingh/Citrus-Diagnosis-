import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Auth from './Auth';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check for the Flask logout signal
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get('action') === 'logout') {
      console.log("Logout signal received! Nuking session...");

      // Tell Firebase to sign out, and wait for it to finish
      signOut(auth).then(() => {
        console.log("Firebase sign-out complete. Reloading React...");
        // FORCE A HARD RELOAD. This stops React Strict Mode from double-firing.
        window.location.href = "/";
      }).catch((error) => {
        console.error("Sign out error:", error);
      });

      return; // EXIT EARLY: Do absolutely nothing else until the page reloads
    }

    // 2. Normal Login Flow (Only runs if we are NOT logging out)
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        console.log("Active user detected. Redirecting to Flask...");
        const token = await currentUser.getIdToken();
        window.location.href = `http://127.0.0.1:5000/verify?token=${token}`;
      } else {
        console.log("No active user. Showing Auth screen.");
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', color: '#2e7d32' }}>
        <h2>Loading CitriScan...</h2>
      </div>
    );
  }

  return (
    <div>
      <Auth />
    </div>
  );
}

export default App;