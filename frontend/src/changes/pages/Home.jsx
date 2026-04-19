import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../megamenu.css";

export default function Home() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);

  // Mega Menu State
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Check for logged-in user
  useEffect(() => {
    try {
      const user = localStorage.getItem("currentUser");
      if (user) {
        setCurrentUser(JSON.parse(user));
      }
    } catch (e) {
      console.error("Error parsing user data:", e);
      localStorage.removeItem("currentUser");
    }
  }, []);

  // Simple carousel auto-cycle
  useEffect(() => {
    const timer = setInterval(
      () => setActiveSlide((prev) => (prev + 1) % 3),
      4000,
    );
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
  };

  const slides = [
    "/slide-mother-nurse.png",
    "/slide-children.png",
    "/slide-care.jpg",
  ];

  /* MENU DATA */
  const menuData = {
    overview: [
      { name: "The WECARE Story", link: "#" },
      { name: "Leadership", link: "#" },
      { name: "Awards & Accolades", link: "#" },
      { name: "Careers", link: "#" },
    ],
    services: [
      { name: "Centres of Excellence", link: "#" },
      { name: "Health Checks", link: "#" },
      { name: "Robotic Surgery", link: "#" },
      { name: "International Patients", link: "#" },
    ],
    academics: [
      { name: "Medical Education", link: "#" },
      { name: "Nursing College", link: "#" },
      { name: "Research Foundation", link: "#" },
      { name: "Clinical Trials", link: "#" },
    ],
  };

  /* FEATURES DATA */
  const features = [
    {
      icon: "🗓️",
      title: "Easy Scheduling",
      desc: "Book appointments with top doctors in just a few clicks.",
    },
    {
      icon: "🛡️",
      title: "Secure Records",
      desc: "Your medical history and data are kept 100% private and secure.",
    },
    {
      icon: "👨‍⚕️",
      title: "Expert Doctors",
      desc: "Connect with verified specialists from top hospitals.",
    },
  ];

  /* STEPS DATA */
  const steps = [
    {
      num: "01",
      title: "Find a Doctor",
      desc: "Search by specialty, hospital, or name to find the right expert for you.",
    },
    {
      num: "02",
      title: "Book Appointment",
      desc: "Select a convenient time slot and confirm your booking instantly.",
    },
    {
      num: "03",
      title: "Get Treated",
      desc: "Visit the doctor or consult online and get on the path to better health.",
    },
  ];

  return (
    <div id="home-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="container" style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Link to="/" className="logo">
              WECARE
            </Link>
          </div>

          <ul className={`nav-links ${mobileMenuOpen ? "active" : ""}`}>
            <li>
              <button
                className={`discover-btn ${discoverOpen ? "active" : ""}`}
                onClick={() => setDiscoverOpen(!discoverOpen)}
              >
                DISCOVER WECARE
                <span className="chevron">▼</span>
              </button>
            </li>
            <li>
              <a href="#about">About</a>
            </li>
            <li>
              <a href="#features">Features</a>
            </li>
            <li>
              <a href="#doctors">Doctors</a>
            </li>
            <li>
              <a href="#how-it-works">How It Works</a>
            </li>
          </ul>

          <div className="nav-actions">
            {currentUser ? (
              <>
                <Link
                  to="/Patientdashboard"
                  className="btn btn-ghost"
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <img
                    src="https://i.pravatar.cc/100?img=47"
                    alt={currentUser.name}
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                    }}
                  />
                  {currentUser.name}
                </Link>
                <button onClick={handleLogout} className="btn btn-outline">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/signin" className="btn btn-ghost">
                  Sign In
                </Link>
                <Link to="/signup" className="btn btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* MEGA MENU DROPDOWN */}
      <div className={`mega-menu-container ${discoverOpen ? "open" : ""}`}>
        <div className="mega-menu-box">
          {/* Left: Tabs */}
          <div className="mega-menu-tabs">
            <div
              className={`mega-tab ${activeTab === "overview" ? "active" : ""}`}
              onMouseEnter={() => setActiveTab("overview")}
            >
              Overview <span className="mega-tab-icon">›</span>
            </div>
            <div
              className={`mega-tab ${activeTab === "services" ? "active" : ""}`}
              onMouseEnter={() => setActiveTab("services")}
            >
              Medical Services <span className="mega-tab-icon">›</span>
            </div>
            <div
              className={`mega-tab ${activeTab === "academics" ? "active" : ""}`}
              onMouseEnter={() => setActiveTab("academics")}
            >
              Academics & Research <span className="mega-tab-icon">›</span>
            </div>
            <div className="mega-tab">
              News & Media <span className="mega-tab-icon">›</span>
            </div>
            <div className="mega-tab">
              Patient Care <span className="mega-tab-icon">›</span>
            </div>
            <div className="mega-tab">
              Contact Us <span className="mega-tab-icon">›</span>
            </div>
          </div>

          {/* Middle: Content */}
          <div className="mega-menu-content">
            <div className="mega-link-group">
              <h4>Explore</h4>
              {menuData[activeTab]?.map((item, index) => (
                <a key={index} href={item.link} className="mega-link">
                  {item.name}
                </a>
              ))}
            </div>
            <div className="mega-link-group">
              <h4>Quick Access</h4>
              <a href="#" className="mega-link">
                Find a Doctor
              </a>
              <a href="#" className="mega-link">
                Book Appointment
              </a>
              <a href="#" className="mega-link">
                Emergency Services
              </a>
              <a href="#" className="mega-link">
                Health Library
              </a>
            </div>
          </div>

          {/* Right: Quick Actions */}
          <div className="mega-menu-quick">
            <button
              className="quick-close-btn"
              onClick={() => setDiscoverOpen(false)}
            >
              ×
            </button>

            <h3 className="quick-title">Quick Links</h3>

            <div className="quick-contact">
              <span className="quick-label">Emergency</span>
              <span className="quick-number">1066</span>
            </div>

            <div className="quick-contact">
              <span className="quick-label">WECARE Lifeline</span>
              <span className="quick-number">1860-500-1066</span>
            </div>

            <div
              style={{
                marginTop: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <a href="#" className="quick-btn">
                <span>Book Appointment</span>
                <span>→</span>
              </a>
              <a href="#" className="quick-btn">
                <span>Find Doctors</span>
                <span>→</span>
              </a>
              <a href="#" className="quick-btn">
                <span>Contact Us</span>
                <span>→</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <main>
        {/* Hero Section */}
        <section className="hero" id="hero">
          {/* Background Slider */}
          <div className="hero-bg-slider">
            {slides.map((src, i) => (
              <div
                key={i}
                className={`hero-bg-slide ${i === activeSlide ? "active" : ""}`}
                style={{ backgroundImage: `url(${src})` }}
              />
            ))}
          </div>

          {/* Overlay */}
          <div className="hero-overlay"></div>

          <div className="container">
            <div className="hero-content">
              <span className="hero-label">Healthcare Made Simple</span>
              <h1 className="hero-title">
                Your Health, <em>Our Priority.</em>
              </h1>
              <p className="hero-description">
                Book doctor appointments online, explore verified doctor
                profiles, and manage your medical records — all from one trusted
                platform.
              </p>
              <div className="hero-actions">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => navigate("/booking")}
                >
                  Book Appointment
                </button>
                <a href="#doctors" className="btn btn-outline btn-lg">
                  Find Doctors
                </a>
              </div>
              <div className="hero-trust">
                <span className="trust-item">✓ Verified Doctors</span>
                <span className="trust-item">✓ Secure Records</span>
                <span className="trust-item">✓ 24/7 Support</span>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="about section-peach" id="about">
          <div className="container">
            <div className="about-wrapper">
              <span className="section-label">About Us</span>
              <h2 className="section-title">What is WECARE?</h2>
              <p className="about-text">
                WECARE is a comprehensive healthcare platform designed to bridge
                the gap between patients and healthcare providers. We believe
                accessing quality healthcare should be simple, transparent, and
                stress-free.
              </p>
              <p className="about-text">
                Our platform connects you with verified medical professionals,
                enables seamless appointment booking, and provides secure
                management of your medical records and prescriptions.
              </p>
              <button className="btn btn-primary">Get Started</button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features section-white" id="features">
          <div className="container">
            <div className="section-header">
              <span className="section-label">What We Offer</span>
              <h2 className="section-title">Everything You Need</h2>
              <p className="section-subtitle">
                Streamlined healthcare management at your fingertips
              </p>
            </div>

            <div className="features-grid">
              {features.map((f, i) => (
                <div key={i} className="feature-card">
                  <div className="feature-icon">{f.icon}</div>
                  <h3 className="feature-title">{f.title}</h3>
                  <p className="feature-text">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Doctors Section */}
        <section className="doctors" id="doctors">
          <div className="container">
            <div className="section-header">
              <span className="section-label">Our Specialists</span>
              <h2 className="section-title">Meet Our Doctors</h2>
              <p className="section-subtitle">
                Trusted healthcare professionals ready to help you
              </p>
            </div>

            <div className="doctors-grid">
              {/* Doctor 1 */}
              <div className="doctor-card">
                <div className="doctor-image">
                  <img src="" alt="Dr. Sarah Johnson" />
                  <span className="availability online">Available</span>
                </div>
                <div className="doctor-info">
                  <h3 className="doctor-name">Dr. Sarah Johnson</h3>
                  <p className="doctor-specialty">Cardiologist</p>
                  <div className="doctor-meta">
                    <span>15+ Years</span>
                  </div>
                  <p className="doctor-affiliation">City General</p>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => navigate("/booking")}
                  >
                    Book Appointment
                  </button>
                </div>
              </div>

              {/* Doctor 2 */}
              <div className="doctor-card">
                <div className="doctor-image">
                  <img src="" alt="Dr. Mark Lee" />
                  <span className="availability busy">Busy</span>
                </div>
                <div className="doctor-info">
                  <h3 className="doctor-name">Dr. Mark Lee</h3>
                  <p className="doctor-specialty">Dermatologist</p>
                  <div className="doctor-meta">
                    <span>10+ Years</span>
                  </div>
                  <p className="doctor-affiliation">Skin Care Clinic</p>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => navigate("/booking")}
                  >
                    Book Appointment
                  </button>
                </div>
              </div>

              {/* Doctor 3 */}
              <div className="doctor-card">
                <div className="doctor-image">
                  <img
                    src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400&h=400"
                    alt="Dr. Emily Chen"
                  />
                  <span className="availability online">Available</span>
                </div>
                <div className="doctor-info">
                  <h3 className="doctor-name">Dr. Emily Chen</h3>
                  <p className="doctor-specialty">Pediatrician</p>
                  <div className="doctor-meta">
                    <span>12+ Years</span>
                  </div>
                  <p className="doctor-affiliation">Childrens Health</p>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => navigate("/booking")}
                  >
                    Book Appointment
                  </button>
                </div>
              </div>

              {/* Doctor 4 */}
              <div className="doctor-card">
                <div className="doctor-image">
                  <img
                    src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400&h=400"
                    alt="Dr. James Wilson"
                  />
                  <span className="availability online">Available</span>
                </div>
                <div className="doctor-info">
                  <h3 className="doctor-name">Dr. James Wilson</h3>
                  <p className="doctor-specialty">Neurologist</p>
                  <div className="doctor-meta">
                    <span>20+ Years</span>
                  </div>
                  <p className="doctor-affiliation">Neuro Institute</p>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => navigate("/booking")}
                  >
                    Book Appointment
                  </button>
                </div>
              </div>

              {/* Doctor 5 */}
              <div className="doctor-card">
                <div className="doctor-image">
                  <img
                    src="https://images.unsplash.com/photo-1622902046580-2b47f47f5471?auto=format&fit=crop&q=80&w=400&h=400"
                    alt="Dr. Linda Martinez"
                  />
                  <span className="availability online">Available</span>
                </div>
                <div className="doctor-info">
                  <h3 className="doctor-name">Dr. Linda Martinez</h3>
                  <p className="doctor-specialty">Orthopedic</p>
                  <div className="doctor-meta">
                    <span>8+ Years</span>
                  </div>
                  <p className="doctor-affiliation">Ortho Center</p>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => navigate("/booking")}
                  >
                    Book Appointment
                  </button>
                </div>
              </div>

              {/* Doctor 6 */}
              <div className="doctor-card">
                <div className="doctor-image">
                  <img
                    src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400&h=400"
                    alt="Dr. Robert Taylor"
                  />
                  <span className="availability busy">Busy</span>
                </div>
                <div className="doctor-info">
                  <h3 className="doctor-name">Dr. Robert Taylor</h3>
                  <p className="doctor-specialty">Oncologist</p>
                  <div className="doctor-meta">
                    <span>18+ Years</span>
                  </div>
                  <p className="doctor-affiliation">Cancer Care</p>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => navigate("/booking")}
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            </div>

            <div className="doctors-cta">
              <Link to="/doctors" className="btn btn-primary">
                View All Doctors
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="how-it-works section-white" id="how-it-works">
          <div className="container">
            <div className="section-header">
              <span className="section-label">Simple Process</span>
              <h2 className="section-title">How It Works</h2>
              <p className="section-subtitle">
                Get started in just a few simple steps
              </p>
            </div>

            <div className="steps-grid">
              {steps.map((step, i) => (
                <React.Fragment key={i}>
                  <div className="step-card">
                    <div className="step-number">{step.num}</div>
                    <h3 className="step-title">{step.title}</h3>
                    <p className="step-text">{step.desc}</p>
                  </div>
                  {i < steps.length - 1 && <div className="step-connector" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <div className="container">
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">10,000+</div>
                <div className="stat-label">Patients Served</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">500+</div>
                <div className="stat-label">Verified Doctors</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">50+</div>
                <div className="stat-label">Specialties</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">98%</div>
                <div className="stat-label">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              <h2 className="cta-title">Ready to Get Started?</h2>
              <p className="cta-text">
                Join thousands of patients who trust WECARE for their healthcare
                needs.
              </p>
              <Link to="/signup" className="btn btn-primary btn-lg">
                Create Free Account
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer" id="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">WECARE</div>
              <p className="footer-tagline">
                Making quality healthcare accessible for everyone. Your trusted
                partner in health and wellness.
              </p>
            </div>
            <div className="footer-col">
              <h4>Quick Links</h4>
              <a href="#about">About Us</a>
              <a href="#features">Features</a>
              <a href="#doctors">Doctors</a>
              <a href="#how-it-works">How It Works</a>
            </div>
            <div className="footer-col">
              <h4>Services</h4>
              <a href="#doctors">Find Doctor</a>
              <Link to="/booking">Book Appointment</Link>
              <a href="#">Health Checkups</a>
              <a href="#">Online Consult</a>
            </div>
            <div className="footer-col">
              <h4>Contact</h4>
              <a href="tel:1066">Emergency: 1066</a>
              <a href="tel:1860-500-1066">Helpline: 1860-500-1066</a>
              <a href="mailto:support@wecare.com">support@wecare.com</a>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-copyright">
              © 2026 WECARE. All rights reserved.
            </p>
            <div className="footer-socials">
              <a href="#">📘</a>
              <a href="#">🐦</a>
              <a href="#">📷</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Buttons */}
      <div className="floating-stack">
        <button className="float-btn btn-call" title="Call Us">
          📞
        </button>
        <button className="float-btn btn-emergency" title="Emergency">
          🚨
          <span className="emergency-number">1066</span>
        </button>
      </div>
    </div>
  );
}
