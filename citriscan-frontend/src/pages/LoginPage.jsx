import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import './AuthPages.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.code === 'auth/invalid-credential'
        ? 'Invalid email or password. Please try again.'
        : err.code === 'auth/user-not-found'
          ? 'No account found with this email.'
          : err.code === 'auth/too-many-requests'
            ? 'Too many failed attempts. Please try again later.'
            : err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google sign-in failed. Please try again.');
      }
    }
  };

  return (
    <div className="auth-page">
      {/* Background visual */}
      <div className="auth-page__bg">
        <img src="/hero-bg.png" alt="" className="auth-page__bg-img" />
        <div className="auth-page__bg-overlay"></div>
      </div>

      {/* Back to home */}
      <Link to="/" className="auth-page__back" id="login-back-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to Home
      </Link>

      <div className="auth-page__card" id="login-card">
        {/* Logo */}
        <div className="auth-page__logo">
          <span className="auth-page__logo-icon">🍋</span>
          <span className="auth-page__logo-text">CitriScan</span>
        </div>

        <h1 className="auth-page__title">Welcome Back</h1>
        <p className="auth-page__subtitle">Sign in to access your disease scanning dashboard</p>

        {/* Google OAuth */}
        <button
          className="auth-page__google-btn"
          onClick={handleGoogleLogin}
          type="button"
          id="login-google-btn"
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
            <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
          </svg>
          Continue with Google
        </button>

        <div className="auth-page__divider">
          <span>or</span>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleLogin} className="auth-page__form" id="login-form">
          <div className="auth-page__field">
            <label className="auth-page__label" htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-page__input"
            />
          </div>

          <div className="auth-page__field">
            <label className="auth-page__label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-page__input"
            />
          </div>

          {error && (
            <div className="auth-page__error" id="login-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <button
            type="submit"
            className="auth-page__submit-btn"
            disabled={loading}
            id="login-submit-btn"
          >
            {loading ? (
              <span className="auth-page__spinner"></span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="auth-page__toggle">
          Don't have an account?{' '}
          <Link to="/signup" className="auth-page__toggle-link" id="login-to-signup">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
