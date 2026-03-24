import { useState } from 'react';
import { auth } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Login Successful!");
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Account Created!");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>CitriScan</h2>
        <p style={styles.subtitle}>{isLogin ? 'Log in to your account' : 'Create a new account'}</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
          
          {error && <p style={styles.errorText}>{error}</p>}

          <button type="submit" style={styles.button}>
            {isLogin ? 'LOGIN' : 'SIGN UP'}
          </button>
        </form>

        <p style={styles.toggleText}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span 
            style={styles.toggleLink} 
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </span>
        </p>
      </div>
    </div>
  );
}

// These styles center the card and make it look professional
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    // 1. Remove the old solid green background
    // backgroundColor: '#f0f4f1', 
    
    // 2. Add the background image (This is a beautiful high-res citrus orchard)
    backgroundImage: 'url("/login-bg.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    
    fontFamily: 'sans-serif',
    margin: 0,
    padding: '20px'
  },
  card: {
    // 3. Make the card slightly transparent so the background subtly peeks through
    backgroundColor: 'rgba(255, 255, 255, 0.92)', 
    padding: '40px',
    borderRadius: '16px',
    // 4. Give it a stronger shadow to pop off the image
    boxShadow: '0 12px 32px rgba(0,0,0,0.3)', 
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
    // Add a modern blur effect behind the card
    backdropFilter: 'blur(10px)', 
  },
  // ... leave all your other styles (title, subtitle, form, etc.) exactly the same
  title: { color: '#2e7d32', margin: '0 0 5px 0', fontSize: '28px' },
  subtitle: { color: '#666', marginBottom: '25px', fontSize: '15px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  input: {
    padding: '14px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '16px',
    outline: 'none',
  },
  button: {
    padding: '14px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'background-color 0.3s'
  },
  errorText: { color: '#d32f2f', fontSize: '14px', margin: '0' },
  toggleText: { marginTop: '25px', color: '#666', fontSize: '14px' },
  toggleLink: { color: '#2e7d32', fontWeight: 'bold', cursor: 'pointer' },
};