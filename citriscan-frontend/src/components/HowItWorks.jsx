import './HowItWorks.css';

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      icon: '📸',
      title: 'Point & Scan',
      desc: 'Open CitriScan on your smartphone and photograph a citrus leaf using your camera or upload an existing image. Our system accepts JPG, PNG, and WebP formats.',
      visual: '/disease-leaves.png',
      alt: 'Citrus leaves being photographed for scanning',
    },
    {
      number: '02',
      icon: '🧠',
      title: 'AI Analysis',
      desc: 'Our dual AI engine — MobileNetV2 and InceptionV3 — processes your image in parallel. The model with highest confidence wins the prediction showdown.',
      visual: null,
      alt: '',
      isAI: true,
    },
    {
      number: '03',
      icon: '📋',
      title: 'Actionable Insights',
      desc: 'Get an instant diagnosis with confidence score, disease severity rating, and personalized treatment recommendations from our AI assistant.',
      visual: null,
      alt: '',
      isResult: true,
    },
  ];

  return (
    <section className="how-it-works" id="how-it-works">
      <div className="container">
        <div className="how-it-works__header">
          <span className="section-label">How It Works</span>
          <h2 className="section-title">
            From Leaf to Diagnosis<br />
            <span style={{ color: 'var(--citrus-green)' }}>in 3 Simple Steps</span>
          </h2>
          <p className="section-subtitle" style={{ textAlign: 'center', margin: '0 auto' }}>
            No expertise needed. No waiting for lab results. Just point your camera and let AI do the heavy lifting.
          </p>
        </div>

        {/* Connector line */}
        <div className="how-it-works__connector"></div>

        <div className="how-it-works__steps">
          {steps.map((step, i) => (
            <div className="how-it-works__step" key={i}>
              {/* Step number badge */}
              <div className="how-it-works__badge">
                <span className="how-it-works__badge-num">{step.number}</span>
              </div>

              {/* Card */}
              <div className="how-it-works__card">
                <div className="how-it-works__card-visual">
                  {step.visual && (
                    <img src={step.visual} alt={step.alt} className="how-it-works__card-img" />
                  )}
                  {step.isAI && (
                    <div className="how-it-works__ai-visual">
                      <div className="how-it-works__ai-ring"></div>
                      <div className="how-it-works__ai-core">
                        <span>🧠</span>
                      </div>
                      <div className="how-it-works__ai-label how-it-works__ai-label--1">
                        <span className="how-it-works__ai-dot how-it-works__ai-dot--warn"></span>
                        Disease Detected
                      </div>
                      <div className="how-it-works__ai-label how-it-works__ai-label--2">
                        Confidence: 96.2%
                      </div>
                    </div>
                  )}
                  {step.isResult && (
                    <div className="how-it-works__result-visual">
                      <div className="how-it-works__result-row">
                        <span className="how-it-works__result-key">Disease</span>
                        <span className="how-it-works__result-val how-it-works__result-val--warn">Citrus Canker</span>
                      </div>
                      <div className="how-it-works__result-bar-wrap">
                        <div className="how-it-works__result-bar" style={{ width: '92%' }}></div>
                      </div>
                      <div className="how-it-works__result-row">
                        <span className="how-it-works__result-key">Confidence</span>
                        <span className="how-it-works__result-val">92.3%</span>
                      </div>
                      <div className="how-it-works__result-row">
                        <span className="how-it-works__result-key">Quality</span>
                        <span className="how-it-works__result-val how-it-works__result-val--success">Grade B</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="how-it-works__card-body">
                  <div className="how-it-works__card-icon">{step.icon}</div>
                  <h3 className="how-it-works__card-title">{step.title}</h3>
                  <p className="how-it-works__card-desc">{step.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
