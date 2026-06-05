import './About.css';

export default function About() {
  const stats = [
    { icon: '🎯', value: '95%+', label: 'Model Accuracy', desc: 'Across all 5 disease classes' },
    { icon: '⚡', value: '<3s', label: 'Detection Speed', desc: 'End-to-end inference time' },
    { icon: '🔬', value: '2', label: 'AI Models', desc: 'MobileNetV2 + InceptionV3' },
    { icon: '🌿', value: '5', label: 'Disease Classes', desc: 'Including healthy detection' },
  ];

  return (
    <section className="about" id="about">
      <div className="container">
        <div className="about__grid">
          {/* Left — Image */}
          <div className="about__visual">
            <div className="about__img-wrapper">
              <img
                src="/about-section.png"
                alt="Agricultural researcher analyzing citrus leaves in a modern lab"
                className="about__img"
              />
              <div className="about__img-accent"></div>
            </div>

            {/* Floating stat card */}
            <div className="about__float-card">
              <div className="about__float-icon">🧠</div>
              <div>
                <span className="about__float-title">Dual AI Engine</span>
                <span className="about__float-desc">MobileNetV2 + InceptionV3</span>
              </div>
            </div>
          </div>

          {/* Right — Content */}
          <div className="about__content">
            <span className="section-label">About CitriScan</span>
            <h2 className="section-title">
              AI That Understands<br />
              <span className="about__title-accent">Your Citrus Crops</span>
            </h2>
            <p className="section-subtitle" style={{ marginBottom: '16px' }}>
              CitriScan bridges the gap between traditional farming and modern AI technology.
              Our dual-model ensemble analyzes leaf photographs in real-time, identifying
              diseases that would take an agronomist days to diagnose.
            </p>
            <p className="about__detail">
              Built during the Edunet/Shell/AICTE internship and independently extended into
              a production-grade platform, CitriScan uses transfer learning on MobileNetV2 and
              InceptionV3 architectures — the same technology powering Google's image recognition —
              fine-tuned specifically for citrus pathology.
            </p>

            <div className="about__stats">
              {stats.map((stat, i) => (
                <div className="about__stat-card" key={i}>
                  <div className="about__stat-icon">{stat.icon}</div>
                  <div className="about__stat-info">
                    <span className="about__stat-value">{stat.value}</span>
                    <span className="about__stat-label">{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
