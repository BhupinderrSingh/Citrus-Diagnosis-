import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import './AuthPages.css';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (name.trim()) {
        await updateProfile(userCredential.user, { displayName: name.trim() });
      }
      navigate('/dashboard');
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use'
        ? 'An account with this email already exists.'
        : err.code === 'auth/weak-password'
          ? 'Password is too weak. Use at least 6 characters.'
          : err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google sign-up failed. Please try again.');
      }
    }
  };

  return (
    <div className="auth-page auth-page--signup">
      {/* Background */}
      <div className="auth-page__bg">
        <img src="/hero-bg.png" alt="" className="auth-page__bg-img" />
        <div className="auth-page__bg-overlay auth-page__bg-overlay--signup"></div>
      </div>

      {/* Back to home */}
      <Link to="/" className="auth-page__back" id="signup-back-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to Home
      </Link>

      <div className="auth-page__card" id="signup-card">
        {/* Logo */}
        <div className="auth-page__logo">
          <span className="auth-page__logo-icon">🍋</span>
          <span className="auth-page__logo-text">CitriScan</span>
        </div>

        <h1 className="auth-page__title">Create Your Account</h1>
        <p className="auth-page__subtitle">Start diagnosing citrus diseases with AI — free forever</p>

        {/* Google OAuth */}
        <button
          className="auth-page__google-btn"
          onClick={handleGoogleSignup}
          type="button"
          id="signup-google-btn"
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
          <span>or sign up with email</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="auth-page__form" id="signup-form">
          <div className="auth-page__field">
            <label className="auth-page__label" htmlFor="signup-name">Full Name</label>
            <input
              id="signup-name"
              type="text"
              placeholder="Bhupinder Singh"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="auth-page__input"
            />
          </div>

          <div className="auth-page__field">
            <label className="auth-page__label" htmlFor="signup-email">Email Address</label>
            <input
              id="signup-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-page__input"
            />
          </div>

          <div className="auth-page__row">
            <div className="auth-page__field">
              <label className="auth-page__label" htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="auth-page__input"
              />
            </div>
            <div className="auth-page__field">
              <label className="auth-page__label" htmlFor="signup-confirm">Confirm Password</label>
              <input
                id="signup-confirm"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="auth-page__input"
              />
            </div>
          </div>

          {error && (
            <div className="auth-page__error" id="signup-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <button
            type="submit"
            className="auth-page__submit-btn"
            disabled={loading}
            id="signup-submit-btn"
          >
            {loading ? (
              <span className="auth-page__spinner"></span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="auth-page__toggle">
          Already have an account?{' '}
          <Link to="/login" className="auth-page__toggle-link" id="signup-to-login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
