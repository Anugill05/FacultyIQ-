import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from './LandingPage.module.css';

/* ─── Data ───────────────────────────────────────────────── */

const stats = [
  { value: '2400',  label: 'Faculty Members',    suffix: '+' },
  { value: '98',    label: 'Satisfaction Rate',   suffix: '%' },
  { value: '340',   label: 'Workshops Conducted', suffix: '+' },
  { value: '15000', label: 'Student Reviews',     suffix: '+' },
];

const features = [
  { title: 'Performance Analytics',  desc: 'Real-time performance scores computed from student feedback, attendance, achievements, and workshop participation.', tag: '01' },
  { title: 'Capacity Building',       desc: 'Curated workshops, training programs, and professional development sessions aligned with academic excellence.',        tag: '02' },
  { title: 'Recognition & Badges',    desc: 'Automated badges and motivation tracking to celebrate faculty milestones and achievements.',                          tag: '03' },
  { title: 'Student Feedback',        desc: 'Structured multi-dimensional feedback system giving faculty actionable insights for continuous improvement.',          tag: '04' },
  { title: 'Growth Tracking',         desc: 'Longitudinal performance tracking across semesters to visualize professional growth over time.',                      tag: '05' },
  { title: 'Achievement Portfolio',   desc: 'Digital portfolio for publications, patents, certifications, and awards with verified credentials.',                  tag: '06' },
];

const testimonials = [
  {
    name: 'Dr. Priya Sharma',
    role: 'Assistant Professor, CSE',
    text: 'FacultyUp has completely transformed how I track my professional growth. The performance dashboard gives me clear insights into areas where I can improve my teaching.',
    rating: 5, initial: 'P',
  },
  {
    name: 'Prof. Amit Verma',
    role: 'Associate Professor, CSE',
    text: 'The workshop recommendation system is brilliant. I have participated in 6 workshops this year and my performance score jumped from 78 to 91. Highly recommended!',
    rating: 5, initial: 'A',
  },
  {
    name: 'Rahul Mehta',
    role: 'Student, B.Tech CSE',
    text: 'Finally a platform where my feedback actually matters. I can see how my reviews help teachers improve, and finding the best professors in my department is so easy now.',
    rating: 5, initial: 'R',
  },
];

const steps = [
  { step: '01', title: 'Sign Up & Verify',    desc: 'Secure email OTP verification for all users — admin, faculty, and students.' },
  { step: '02', title: 'Build Your Profile',  desc: 'Upload achievements, certificates, and participate in workshops to grow your portfolio.' },
  { step: '03', title: 'Collect Feedback',    desc: 'Students submit structured multi-dimensional feedback for every faculty member.' },
  { step: '04', title: 'Track & Improve',     desc: 'View real-time performance scores, earn badges, and receive personalized growth recommendations.' },
];

/* ─── SVG Icons ──────────────────────────────────────────── */

const IconGrad = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

/* ─── CountUp ────────────────────────────────────────────── */

function CountUp({ target, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref      = useRef(null);
  const animated = useRef(false);
  const num = parseInt(target, 10);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          const start = Date.now();
          const step = () => {
            const elapsed  = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const ease     = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(ease * num));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [num, duration]);

  const display = num >= 1000 ? Math.floor(count / 1000) + 'K' : count;
  return <span ref={ref}>{display}{suffix}</span>;
}

/* ─── Page ───────────────────────────────────────────────── */

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

      {/* ── NAV ── */}
      <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`}>
        <div className={styles.navInner}>
          <div className={styles.navLogo}>
            <div className={styles.navLogoMark}>
              <IconGrad className={styles.navLogoSvg} />
            </div>
            <span className={styles.navLogoText}>FacultyUp</span>
          </div>

          <div className={`${styles.navLinks} ${menuOpen ? styles.navLinksOpen : ''}`}>
            <a href="#features"     onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#stats"        onClick={() => setMenuOpen(false)}>Impact</a>
            <a href="#testimonials" onClick={() => setMenuOpen(false)}>Testimonials</a>
            <Link to="/login"    className={styles.navLoginBtn}    onClick={() => setMenuOpen(false)}>Login</Link>
            <Link to="/register" className={styles.navRegisterBtn} onClick={() => setMenuOpen(false)}>Get Started</Link>
          </div>

          <button className={styles.burger} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroBgImage} />
        <div className={styles.heroBgOverlay} />

        <div className={styles.heroInner}>

          {/* Left — text */}
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <span className={styles.heroBadgeDot} />
              Lovely Professional University
            </div>

            <h1 className={styles.heroTitle}>
              Empowering Faculty
              <br />
              <span className={styles.heroTitleAccent}>Excellence</span>
              <br />
              at Every Step
            </h1>

            <p className={styles.heroDesc}>
              A comprehensive platform for capacity building, performance assessment, and motivation-driven growth for LPU faculty. Track, improve, and celebrate academic excellence.
            </p>

            <div className={styles.heroCta}>
              <Link to="/register" className={styles.heroCtaPrimary}>Start Your Journey &rarr;</Link>
              <Link to="/login"    className={styles.heroCtaSecondary}>Sign In</Link>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className={styles.heroScroll}>
          <div className={styles.heroScrollLine} />
          Scroll
        </div>
      </section>

      {/* ── STATS ── */}
      <section id="stats" className={styles.statsSection}>
        <div className={styles.statsInner}>
          {stats.map((s, i) => (
            <div key={i} className={styles.statItem} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={styles.statValue}>
                <CountUp target={s.value} suffix={s.suffix} />
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTag}>Platform Capabilities</div>
          <h2 className={styles.sectionTitle}>Everything You Need for Faculty Growth</h2>
          <p className={styles.sectionDesc}>
            A unified platform built specifically for LPU's academic excellence framework, combining data-driven insights with human-centered development.
          </p>
        </div>

        <div className={styles.featuresGrid}>
          {features.map((f, i) => (
            <div key={i} className={styles.featureCard} style={{ animationDelay: `${i * 0.08}s` }}>
              <div className={styles.featureTagNum}>{f.tag}</div>
              <div className={styles.featureTitleBar} />
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className={styles.howSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTag}>Process</div>
          <h2 className={styles.sectionTitle}>How FacultyUp Works</h2>
        </div>

        <div className={styles.stepsRow}>
          {steps.map((s, i) => (
            <div key={i} className={styles.stepCard} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={styles.stepNum}>{s.step}</div>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.stepDesc}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className={styles.testimonialsSection}>
        <div className={styles.testimonialsBgImage} />
        <div className={styles.testimonialsOverlay} />

        <div className={styles.testimonialsInner}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTagLight}>Testimonials</div>
            <h2 className={styles.sectionTitleLight}>Loved by Faculty & Students</h2>
          </div>

          <div className={styles.testimonialsGrid}>
            {testimonials.map((t, i) => (
              <div key={i} className={styles.testimonialCard} style={{ animationDelay: `${i * 0.12}s` }}>
                <div className={styles.testimonialRating}>{'★'.repeat(t.rating)}</div>
                <p className={styles.testimonialText}>"{t.text}"</p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.testimonialAvatar}>{t.initial}</div>
                  <div>
                    <strong className={styles.testimonialName}>{t.name}</strong>
                    <span className={styles.testimonialRole}>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className={styles.ctaBanner}>
        <div className={styles.ctaBannerContent}>
          <div className={styles.sectionTagLight} style={{ marginBottom: '18px', display: 'inline-block' }}>
            Join Today
          </div>
          <h2 className={styles.ctaBannerTitle}>Ready to Transform Faculty Development?</h2>
          <p className={styles.ctaBannerDesc}>
            Join thousands of LPU faculty members already using FacultyUp to track and accelerate their professional growth.
          </p>
          <div className={styles.ctaBannerBtns}>
            <Link to="/register" className={styles.ctaBannerPrimary}>Create Account &rarr;</Link>
            <Link to="/login"    className={styles.ctaBannerSecondary}>Login</Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>
              <div className={styles.footerLogoMark}>
                <IconGrad className={styles.footerLogoSvg} />
              </div>
              <strong className={styles.footerLogoText}>FacultyUp</strong>
            </div>
            <p className={styles.footerTagline}>
              Capacity Building, Performance Assessment &amp; Motivation Driven Tool for Faculty Upgradation
            </p>
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
          <p>© 2026 FacultyUp — Lovely Professional University. All rights reserved.</p>
          <p>Built with care for academic excellence</p>
        </div>
      </footer>

    </div>
  );
}