import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from './LandingPage.module.css';

const stats = [
  { value: '2,400+', label: 'Faculty Members' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '340+', label: 'Workshops Conducted' },
  { value: '15K+', label: 'Student Reviews' },
];

const features = [
  {
    icon: '📊',
    title: 'Performance Analytics',
    desc: 'Real-time performance scores computed from student feedback, attendance, achievements, and workshop participation.',
    color: '#1e3a8a',
  },
  {
    icon: '🎯',
    title: 'Capacity Building',
    desc: 'Curated workshops, training programs, and professional development sessions aligned with academic excellence.',
    color: '#ea580c',
  },
  {
    icon: '🏆',
    title: 'Recognition & Badges',
    desc: 'Automated badges and motivation tracking to celebrate faculty milestones and achievements.',
    color: '#d97706',
  },
  {
    icon: '💬',
    title: 'Student Feedback',
    desc: 'Structured multi-dimensional feedback system giving faculty actionable insights for continuous improvement.',
    color: '#16a34a',
  },
  {
    icon: '📈',
    title: 'Growth Tracking',
    desc: 'Longitudinal performance tracking across semesters to visualize professional growth over time.',
    color: '#7c3aed',
  },
  {
    icon: '🎓',
    title: 'Achievement Portfolio',
    desc: 'Digital portfolio for publications, patents, certifications, and awards with verified credentials.',
    color: '#0e7490',
  },
];

const testimonials = [
  {
    name: 'Dr. Priya Sharma',
    role: 'Assistant Professor, CSE',
    text: 'FacultyUp has completely transformed how I track my professional growth. The performance dashboard gives me clear insights into areas where I can improve my teaching.',
    rating: 5,
    initial: 'P',
  },
  {
    name: 'Prof. Amit Verma',
    role: 'Associate Professor, CSE',
    text: 'The workshop recommendation system is brilliant. I have participated in 6 workshops this year and my performance score jumped from 78 to 91. Highly recommended!',
    rating: 5,
    initial: 'A',
  },
  {
    name: 'Rahul Mehta',
    role: 'Student, B.Tech CSE',
    text: 'Finally a platform where my feedback actually matters! I can see how my reviews help teachers improve, and finding the best professors in my department is so easy now.',
    rating: 5,
    initial: 'R',
  },
];

function CountUp({ target, duration = 2000, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const animated = useRef(false);

  useEffect(() => {
    const num = parseInt(target.replace(/\D/g, ''));
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animated.current) {
        animated.current = true;
        const start = Date.now();
        const step = () => {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(ease * num));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  const prefix = target.replace(/[\d,+%]/g, '').split('').filter(c => isNaN(c) && c !== '+').join('');
  const hasSuffix = target.includes('+');
  const hasPercent = target.includes('%');

  return (
    <span ref={ref}>
      {count.toLocaleString()}{hasPercent ? '%' : ''}{hasSuffix ? '+' : ''}
    </span>
  );
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className={styles.page}>
      {/* NAV */}
      <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`}>
        <div className={styles.navInner}>
          <div className={styles.navLogo}>
            <span className={styles.navLogoIcon}>🎓</span>
            <span className={styles.navLogoText}>FacultyUp</span>
          </div>
          <div className={`${styles.navLinks} ${menuOpen ? styles.navLinksOpen : ''}`}>
            <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#stats" onClick={() => setMenuOpen(false)}>Impact</a>
            <a href="#testimonials" onClick={() => setMenuOpen(false)}>Testimonials</a>
            <Link to="/login" className={styles.navLoginBtn} onClick={() => setMenuOpen(false)}>
              Login
            </Link>
            <Link to="/register" className={styles.navRegisterBtn} onClick={() => setMenuOpen(false)}>
              Get Started
            </Link>
          </div>
          <button className={styles.burger} onClick={() => setMenuOpen(!menuOpen)}>
            <span className={menuOpen ? styles.burgerOpen : ''} />
            <span className={menuOpen ? styles.burgerOpen : ''} />
            <span className={menuOpen ? styles.burgerOpen : ''} />
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.heroBgGrad} />
          <div className={styles.heroBgPattern} />
        </div>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span>🏛️</span> Lovely Professional University
          </div>
          <h1 className={styles.heroTitle}>
            Empowering Faculty
            <span className={styles.heroTitleAccent}> Excellence</span>
            <br />at Every Step
          </h1>
          <p className={styles.heroDesc}>
            A comprehensive platform for capacity building, performance assessment, and motivation-driven growth for LPU faculty. Track, improve, and celebrate academic excellence.
          </p>
          <div className={styles.heroCta}>
            <Link to="/register" className={styles.heroCtaPrimary}>
              Start Your Journey →
            </Link>
            <Link to="/login" className={styles.heroCtaSecondary}>
              Sign In
            </Link>
          </div>
          <div className={styles.heroCredentials}>
            <span>Demo credentials:</span>
            <code>admin@lpu.in / Admin@123</code>
            <code>priya.sharma@lpu.in / Teacher@123</code>
            <code>student1@lpu.in / Student@123</code>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.heroCard}>
            <div className={styles.heroCardHeader}>
              <span>📊</span>
              <span>Performance Overview</span>
            </div>
            <div className={styles.heroScoreCircle}>
              <svg viewBox="0 0 120 120" className={styles.heroScoreSvg}>
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
                <circle cx="60" cy="60" r="52" fill="none" stroke="white" strokeWidth="10"
                  strokeDasharray="327" strokeDashoffset="49" strokeLinecap="round"
                  transform="rotate(-90 60 60)" style={{ transition: 'stroke-dashoffset 2s ease' }} />
              </svg>
              <div className={styles.heroScoreText}>
                <strong>87%</strong>
                <small>Overall</small>
              </div>
            </div>
            <div className={styles.heroMetrics}>
              {[
                { label: 'Teaching', val: 90, color: '#22c55e' },
                { label: 'Research', val: 80, color: '#3b82f6' },
                { label: 'Engagement', val: 88, color: '#f59e0b' },
              ].map(m => (
                <div key={m.label} className={styles.heroMetric}>
                  <span>{m.label}</span>
                  <div className={styles.heroMetricBar}>
                    <div style={{ width: `${m.val}%`, background: m.color }} />
                  </div>
                  <span style={{ color: m.color }}>{m.val}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.heroFloatCard} style={{ top: '-20px', right: '-16px' }}>
            <span>⭐</span>
            <div>
              <strong>Star Performer</strong>
              <small>This Semester</small>
            </div>
          </div>
          <div className={styles.heroFloatCard} style={{ bottom: '20px', left: '-16px' }}>
            <span>🎯</span>
            <div>
              <strong>6 / 8 Goals</strong>
              <small>On Track</small>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section id="stats" className={styles.statsSection}>
        <div className={styles.statsGrid}>
          {stats.map((s, i) => (
            <div key={i} className={styles.statItem} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={styles.statValue}>
                <CountUp target={s.value} />
              </div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionBadge}>Platform Capabilities</div>
          <h2 className={styles.sectionTitle}>Everything You Need for Faculty Growth</h2>
          <p className={styles.sectionDesc}>
            A unified platform built specifically for LPU's academic excellence framework, combining data-driven insights with human-centered development.
          </p>
        </div>
        <div className={styles.featuresGrid}>
          {features.map((f, i) => (
            <div key={i} className={styles.featureCard} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={styles.featureIcon} style={{ background: `${f.color}15`, color: f.color }}>
                {f.icon}
              </div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
              <div className={styles.featureLine} style={{ background: f.color }} />
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={styles.howSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionBadge}>Process</div>
          <h2 className={styles.sectionTitle}>How FacultyUp Works</h2>
        </div>
        <div className={styles.stepsGrid}>
          {[
            { step: '01', title: 'Sign Up & Verify', desc: 'Secure email OTP verification for all users — admin, faculty, and students.', icon: '✉️' },
            { step: '02', title: 'Build Your Profile', desc: 'Upload achievements, certificates, and participate in workshops to grow your portfolio.', icon: '👤' },
            { step: '03', title: 'Collect Feedback', desc: 'Students submit structured multi-dimensional feedback for every faculty member.', icon: '💬' },
            { step: '04', title: 'Track & Improve', desc: 'View real-time performance scores, earn badges, and receive personalized growth recommendations.', icon: '📈' },
          ].map((s, i) => (
            <div key={i} className={styles.stepCard}>
              <div className={styles.stepNumber}>{s.step}</div>
              <div className={styles.stepIcon}>{s.icon}</div>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.stepDesc}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className={styles.testimonialsSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionBadge}>Testimonials</div>
          <h2 className={styles.sectionTitle}>Loved by Faculty & Students</h2>
        </div>
        <div className={styles.testimonialsGrid}>
          {testimonials.map((t, i) => (
            <div key={i} className={styles.testimonialCard} style={{ animationDelay: `${i * 0.12}s` }}>
              <div className={styles.testimonialStars}>
                {'★'.repeat(t.rating)}
              </div>
              <p className={styles.testimonialText}>"{t.text}"</p>
              <div className={styles.testimonialAuthor}>
                <div className={styles.testimonialAvatar}>{t.initial}</div>
                <div>
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className={styles.ctaBanner}>
        <div className={styles.ctaBannerContent}>
          <h2 className={styles.ctaBannerTitle}>Ready to Transform Faculty Development?</h2>
          <p className={styles.ctaBannerDesc}>Join thousands of LPU faculty members already using FacultyUp to track and accelerate their professional growth.</p>
          <div className={styles.ctaBannerBtns}>
            <Link to="/register" className={styles.ctaBannerPrimary}>Create Account →</Link>
            <Link to="/login" className={styles.ctaBannerSecondary}>Login</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>
              <span>🎓</span>
              <strong>FacultyUp</strong>
            </div>
            <p className={styles.footerTagline}>Capacity Building, Performance Assessment & Motivation Driven Tool for Faculty Upgradation</p>
            <p className={styles.footerUniv}>Lovely Professional University, Phagwara, Punjab</p>
          </div>
          <div className={styles.footerLinks}>
            <div className={styles.footerCol}>
              <h4>Platform</h4>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
              <a href="#features">Features</a>
            </div>
            <div className={styles.footerCol}>
              <h4>Roles</h4>
              <span>Admin Portal</span>
              <span>Faculty Dashboard</span>
              <span>Student Portal</span>
            </div>
            <div className={styles.footerCol}>
              <h4>Contact</h4>
              <span>facultyup@lpu.in</span>
              <span>+91-1824-404404</span>
              <span>Phagwara, Punjab 144411</span>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© 2024 FacultyUp — Lovely Professional University. All rights reserved.</p>
          <p>Built with ❤️ for academic excellence</p>
        </div>
      </footer>
    </div>
  );
}
