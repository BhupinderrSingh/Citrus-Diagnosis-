import './UseCases.css';

export default function UseCases() {
  const diseases = [
    {
      name: 'Citrus Greening (HLB)',
      severity: 'Critical',
      severityClass: 'critical',
      icon: '🟡',
      indicator: 'Asymmetric leaf yellowing, mottled pattern',
      treatment: 'Remove infected trees, control psyllid vector, nutrient therapy',
    },
    {
      name: 'Citrus Canker',
      severity: 'High',
      severityClass: 'high',
      icon: '🟠',
      indicator: 'Raised corky lesions with yellow halo',
      treatment: 'Copper-based bactericides, prune infected areas, windbreaks',
    },
    {
      name: 'Black Spot',
      severity: 'Medium',
      severityClass: 'medium',
      icon: '⚫',
      indicator: 'Dark circular spots with yellow ring',
      treatment: 'Fungicide sprays (copper, mancozeb), remove fallen leaves',
    },
    {
      name: 'Melanose',
      severity: 'Low–Med',
      severityClass: 'low',
      icon: '🟤',
      indicator: 'Small dark raised dots, rough texture',
      treatment: 'Copper fungicides, prune dead wood, improve air circulation',
    },
    {
      name: 'Healthy',
      severity: 'None',
      severityClass: 'healthy',
      icon: '🟢',
      indicator: 'Uniform green, no lesions or discoloration',
      treatment: 'Continue regular care, balanced fertilization, proper irrigation',
    },
  ];

  const personas = [
    {
      emoji: '🧑‍🌾',
      title: 'For Farmers',
      subtitle: 'Small & Large Scale',
      desc: 'Identify diseases instantly on any ₹5,000 smartphone. No agronomist visit needed — save ₹800+ per diagnosis and prevent crop loss before it spreads.',
      features: ['Instant leaf scanning', 'Treatment recommendations', 'Works on 4G networks'],
    },
    {
      emoji: '🔬',
      title: 'For Researchers',
      subtitle: 'ICAR & Universities',
      desc: 'Monitor disease prevalence across regions with standardized digital diagnostics. Export confidence scores and geo-tagged scan history for field studies.',
      features: ['Confidence scores & top-3 predictions', 'Scan history dashboard', 'Data export capabilities'],
    },
    {
      emoji: '🏭',
      title: 'For Agri-Business',
      subtitle: 'Packing Houses & Retailers',
      desc: 'Ensure supply chain quality by scanning incoming citrus batches. Detect diseases before they contaminate healthy inventory.',
      features: ['Batch quality screening', 'Grade classification', 'Supply chain traceability'],
    },
  ];

  return (
    <section className="use-cases" id="use-cases">
      <div className="container">
        {/* Disease Classes */}
        <div className="use-cases__header">
          <span className="section-label">Disease Coverage</span>
          <h2 className="section-title">
            5 Disease Classes,<br />
            <span style={{ color: 'var(--citrus-green)' }}>One Intelligent Platform</span>
          </h2>
          <p className="section-subtitle" style={{ textAlign: 'center', margin: '0 auto' }}>
            Our AI is trained to detect the most common and devastating citrus diseases affecting orchards in India and worldwide.
          </p>
        </div>

        <div className="use-cases__diseases">
          {diseases.map((disease, i) => (
            <div className="use-cases__disease-card" key={i}>
              <div className="use-cases__disease-top">
                <span className="use-cases__disease-icon">{disease.icon}</span>
                <span className={`use-cases__disease-severity use-cases__disease-severity--${disease.severityClass}`}>
                  {disease.severity}
                </span>
              </div>
              <h4 className="use-cases__disease-name">{disease.name}</h4>
              <p className="use-cases__disease-indicator">
                <strong>Signs: </strong>{disease.indicator}
              </p>
              <p className="use-cases__disease-treatment">
                <strong>Treatment: </strong>{disease.treatment}
              </p>
            </div>
          ))}
        </div>

        {/* Who It's For */}
        <div className="use-cases__personas-header">
          <span className="section-label">Who It's For</span>
          <h2 className="section-title">
            Built for Everyone in<br />
            <span style={{ color: 'var(--citrus-orange)' }}>the Citrus Value Chain</span>
          </h2>
        </div>

        <div className="use-cases__personas">
          {personas.map((persona, i) => (
            <div className="use-cases__persona-card" key={i}>
              <div className="use-cases__persona-emoji">{persona.emoji}</div>
              <h3 className="use-cases__persona-title">{persona.title}</h3>
              <span className="use-cases__persona-subtitle">{persona.subtitle}</span>
              <p className="use-cases__persona-desc">{persona.desc}</p>
              <ul className="use-cases__persona-features">
                {persona.features.map((feat, j) => (
                  <li key={j} className="use-cases__persona-feat">
                    <span className="use-cases__persona-check">✓</span>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
