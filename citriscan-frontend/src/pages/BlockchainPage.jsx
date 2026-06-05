import { useState } from 'react';
import { Link2, ShieldCheck, Leaf, Info } from 'lucide-react';
import './BlockchainPage.css';

const FEATURES = [
  { icon: '🔗', label: 'Crop Certification' },
  { icon: '🌿', label: 'Disease-Free NFTs' },
  { icon: '📦', label: 'Farm-to-Table Tracing' },
  { icon: '🔐', label: 'Smart Contracts' },
  { icon: '📊', label: 'Supply Chain Audit' },
];

export default function BlockchainPage() {
  const [notifyEmail, setNotifyEmail] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleNotify = (e) => {
    e.preventDefault();
    if (notifyEmail.trim()) {
      // TODO(security): When backend is ready, submit email via HTTPS API with CSRF token
      setShowToast(true);
      setNotifyEmail('');
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <div className="blockchain" id="blockchain-page">
      {/* Toast */}
      {showToast && (
        <div className="profile__toast" role="status">
          <Info size={16} className="profile__toast-icon" />
          We&apos;ll notify you when Blockchain Tokens launches!
        </div>
      )}

      <div className="blockchain__card">
        {/* Animated hex chain */}
        <div className="blockchain__hex-grid">
          <div className="blockchain__hex">
            <Link2 size={22} />
          </div>
          <div className="blockchain__hex-connector" />
          <div className="blockchain__hex">
            <ShieldCheck size={22} />
          </div>
          <div className="blockchain__hex-connector" />
          <div className="blockchain__hex">
            <Leaf size={22} />
          </div>
        </div>

        {/* Badge */}
        <div className="blockchain__badge">
          <span className="blockchain__badge-dot" />
          Under Development
        </div>

        {/* Content */}
        <h2 className="blockchain__title">Blockchain Token Generation</h2>
        <p className="blockchain__desc">
          We&apos;re building a blockchain-powered certification system for citrus crops.
          Generate tamper-proof tokens that verify disease-free status, enable farm-to-table
          traceability, and build trust across the supply chain.
        </p>

        {/* Feature pills */}
        <div className="blockchain__features" id="blockchain-features">
          {FEATURES.map((f) => (
            <span className="blockchain__feature-pill" key={f.label}>
              <span className="blockchain__feature-pill-icon">{f.icon}</span>
              {f.label}
            </span>
          ))}
        </div>

        {/* Progress */}
        <div className="blockchain__progress" id="blockchain-progress">
          <div className="blockchain__progress-header">
            <p className="blockchain__progress-label">Development Progress</p>
            <p className="blockchain__progress-value">35%</p>
          </div>
          <div className="blockchain__progress-track">
            <div className="blockchain__progress-fill" />
          </div>
        </div>

        {/* Notify me */}
        <div className="blockchain__notify">
          <p className="blockchain__notify-label">Get notified when it launches</p>
          <form className="blockchain__notify-form" onSubmit={handleNotify}>
            <input
              type="email"
              className="blockchain__notify-input"
              placeholder="Enter your email"
              value={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.value)}
              id="blockchain-notify-email"
              autoComplete="email"
            />
            <button type="submit" className="blockchain__notify-btn" id="blockchain-notify-btn">
              Notify Me
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
