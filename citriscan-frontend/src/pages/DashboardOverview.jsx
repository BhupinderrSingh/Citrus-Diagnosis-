import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Microscope,
  Link2,
  UserCircle,
  Scan,
  ShieldAlert,
  Target,
  Leaf,
  ArrowRight,
} from 'lucide-react';
import './DashboardOverview.css';

const STATS = [
  { icon: Scan, value: '—', label: 'Total Scans', color: 'green' },
  { icon: ShieldAlert, value: '—', label: 'Diseases Found', color: 'orange' },
  { icon: Target, value: '95%+', label: 'Model Accuracy', color: 'blue' },
  { icon: Leaf, value: '5', label: 'Disease Classes', color: 'purple' },
];

const TIPS = [
  {
    emoji: '🔍',
    title: 'Best Scan Results',
    text: 'Use a single leaf against a plain background. Ensure good lighting and avoid shadows for the most accurate diagnosis.',
  },
  {
    emoji: '🌿',
    title: 'Early Detection Matters',
    text: 'Citrus Greening (HLB) can devastate entire orchards. Regular scanning helps catch infections before they spread.',
  },
  {
    emoji: '💧',
    title: 'Seasonal Care',
    text: 'Monitor closely during wet seasons — Canker and Black Spot thrive in humid conditions. Copper-based sprays can help prevent outbreaks.',
  },
];

export default function DashboardOverview() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="overview" id="dashboard-overview">
      {/* Welcome Banner */}
      <section className="overview-welcome" id="overview-welcome">
        <h2 className="overview-welcome__greeting">
          Welcome back, <span>{displayName}</span> 👋
        </h2>
        <p className="overview-welcome__date">{dateStr}</p>
        <p className="overview-welcome__tagline">
          Your AI-powered citrus health companion. Scan leaves, detect diseases,
          and protect your harvest with cutting-edge machine learning.
        </p>
      </section>

      {/* Stats */}
      <section className="overview-stats" id="overview-stats">
        {STATS.map((stat) => (
          <div className="overview-stat-card" key={stat.label}>
            <div className={`overview-stat-card__icon overview-stat-card__icon--${stat.color}`}>
              <stat.icon size={22} />
            </div>
            <div>
              <p className="overview-stat-card__value">{stat.value}</p>
              <p className="overview-stat-card__label">{stat.label}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Feature Cards */}
      <section className="overview-features-section">
        <div className="overview-section-header">
          <h3 className="overview-section-title">Quick Actions</h3>
        </div>

        <div className="overview-features" id="overview-features">
          {/* Citrus Diagnosis */}
          <div
            className="overview-feature-card overview-feature-card--diagnosis"
            onClick={() => navigate('/dashboard/diagnosis')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/dashboard/diagnosis')}
            id="feature-citrus-diagnosis"
          >
            <div className="overview-feature-card__icon-wrap overview-feature-card__icon-wrap--green">
              <Microscope size={28} />
            </div>
            <h4 className="overview-feature-card__title">
              Citrus Diagnosis
              <span className="overview-feature-card__badge overview-feature-card__badge--live">Live</span>
            </h4>
            <p className="overview-feature-card__desc">
              Upload or capture citrus leaf images for instant AI-powered disease detection.
              Dual-model analysis using MobileNetV2 and InceptionV3 for maximum accuracy.
            </p>
            <button className="overview-feature-card__action" id="action-diagnosis">
              Launch Scanner <ArrowRight size={14} />
            </button>
          </div>

          {/* Blockchain Token Generation */}
          <div
            className="overview-feature-card overview-feature-card--blockchain"
            onClick={() => navigate('/dashboard/blockchain')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/dashboard/blockchain')}
            id="feature-blockchain-tokens"
          >
            <div className="overview-feature-card__icon-wrap overview-feature-card__icon-wrap--orange">
              <Link2 size={28} />
            </div>
            <h4 className="overview-feature-card__title">
              Blockchain Tokens
              <span className="overview-feature-card__badge overview-feature-card__badge--soon">Coming Soon</span>
            </h4>
            <p className="overview-feature-card__desc">
              Generate blockchain-powered crop certification tokens for farm-to-table traceability
              and disease-free verification. Powered by smart contracts.
            </p>
            <button className="overview-feature-card__action overview-feature-card__action--orange" id="action-blockchain">
              Learn More <ArrowRight size={14} />
            </button>
          </div>

          {/* Profile */}
          <div
            className="overview-feature-card overview-feature-card--profile"
            onClick={() => navigate('/dashboard/profile')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/dashboard/profile')}
            id="feature-profile"
          >
            <div className="overview-feature-card__icon-wrap overview-feature-card__icon-wrap--blue">
              <UserCircle size={28} />
            </div>
            <h4 className="overview-feature-card__title">My Profile</h4>
            <p className="overview-feature-card__desc">
              View and manage your account information, preferences, and connected services.
              Keep your CitriScan profile up to date.
            </p>
            <button className="overview-feature-card__action overview-feature-card__action--blue" id="action-profile">
              View Profile <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* Quick Tips */}
      <section className="overview-tips" id="overview-tips">
        <div className="overview-section-header">
          <h3 className="overview-section-title">🌱 Citrus Care Tips</h3>
        </div>
        <div className="overview-tips__grid">
          {TIPS.map((tip) => (
            <div className="overview-tip-card" key={tip.title}>
              <span className="overview-tip-card__emoji">{tip.emoji}</span>
              <h4 className="overview-tip-card__title">{tip.title}</h4>
              <p className="overview-tip-card__text">{tip.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
