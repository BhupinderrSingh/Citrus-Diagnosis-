import { Link } from 'react-router-dom';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero" id="home">
      {/* Background layers */}
      <div className="hero__bg">
        <img src="/hero-bg.png" alt="" className="hero__bg-img" />
        <div className="hero__bg-overlay"></div>
      </div>

      {/* Floating decorative elements */}
      <div className="hero__decor hero__decor--1">🍊</div>
      <div className="hero__decor hero__decor--2">🍋</div>
      <div className="hero__decor hero__decor--3">🍃</div>

      <div className="container hero__inner">
        <div className="hero__content">
          <span className="section-label animate-fadeInUp">
            <span className="hero__label-dot"></span>
            AI-Powered Crop Intelligence
          </span>

          <h1 className="hero__title animate-fadeInUp delay-1">
            The Ultimate<br />
            <span className="hero__title-highlight">Citrus Fruit</span><br />
            Intelligence.
          </h1>

          <p className="hero__subtitle animate-fadeInUp delay-2">
            Detect diseases, diagnose conditions, and get treatment recommendations
            instantly — just photograph a leaf. Powered by dual AI models with 95%+ accuracy.
          </p>

          <div className="hero__actions animate-fadeInUp delay-3">
            <Link to="/signup" className="hero__btn hero__btn--primary" id="hero-cta-start">
              <span>Start Scanning Free</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <a href="#how-it-works" className="hero__btn hero__btn--outline" id="hero-cta-learn">
              See How It Works
            </a>
          </div>

          <div className="hero__stats animate-fadeInUp delay-4">
            <div className="hero__stat">
              <span className="hero__stat-value">95%+</span>
              <span className="hero__stat-label">Accuracy</span>
            </div>
            <div className="hero__stat-divider"></div>
            <div className="hero__stat">
              <span className="hero__stat-value">&lt;3s</span>
              <span className="hero__stat-label">Diagnosis</span>
            </div>
            <div className="hero__stat-divider"></div>
            <div className="hero__stat">
              <span className="hero__stat-value">5</span>
              <span className="hero__stat-label">Disease Classes</span>
            </div>
          </div>
        </div>

        <div className="hero__visual animate-slideInRight delay-2">
          <div className="hero__phone-wrapper">
            <img src="/phone-mockup.png" alt="CitriScan App showing disease detection on a smartphone" className="hero__phone-img" />
            <div className="hero__phone-glow"></div>
          </div>

          {/* Floating result card */}
          <div className="hero__result-card animate-fadeInUp delay-4">
            <div className="hero__result-icon">✅</div>
            <div className="hero__result-content">
              <span className="hero__result-label">Scan Result</span>
              <span className="hero__result-value">Healthy · Grade A</span>
            </div>
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="hero__wave">
        <svg viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none">
          <path d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,80 1440,70 L1440,120 L0,120 Z" fill="var(--white)"/>
        </svg>
      </div>
    </section>
  );
}
