import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Auth from './Auth';
import Scanner from './Scanner';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    if (currentUser) {
      // Get the secure ID token from Firebase
      const token = await currentUser.getIdToken();
      // Redirect to Flask and pass the token as a query parameter
      window.location.href = `http://127.0.0.1:5000/verify?token=${token}`;
    } else {
      setUser(null);
    }
    setLoading(false);
  });
  return () => unsubscribe();
}, []);

  const handleSignOut = () => {
    signOut(auth).catch((error) => console.error("Sign out error", error));
  };

  return (
    <div>
      {user ? <Scanner onSignOut={handleSignOut} /> : <Auth />}
    </div>
  );
}

export default App;