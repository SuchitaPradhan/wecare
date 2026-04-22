import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { publicFetch } from "../config/api";
import "../megamenu.css";

const slides = [
  "/slide-mother-nurse.png",
  "/slide-children.png",
  "/slide-care.jpg",
];

const menuData = {
  overview: [
    { name: "The WECARE Story", link: "#about" },
    { name: "Leadership", link: "#about" },
    { name: "Careers", link: "#footer" },
  ],
  services: [
    { name: "Find a Doctor", link: "#doctors" },
    { name: "Book Appointment", link: "#how-it-works" },
    { name: "Online Consultation", link: "#features" },
  ],
  academics: [
    { name: "Medical Education", link: "#features" },
    { name: "Research Foundation", link: "#features" },
    { name: "Clinical Programs", link: "#features" },
  ],
  news: [
    { name: "Health Updates", link: "#features" },
    { name: "Community Outreach", link: "#footer" },
    { name: "Announcements", link: "#footer" },
  ],
};

const features = [
  {
    icon: "Appointments",
    title: "Easy Scheduling",
    desc: "Book appointments with verified doctors without calling the clinic.",
  },
  {
    icon: "Profiles",
    title: "Verified Specialists",
    desc: "Browse specialists with experience, hospital, languages, and availability.",
  },
  {
    icon: "Records",
    title: "Unified Records",
    desc: "Keep your appointments and uploaded medical documents in one place.",
  },
];

const steps = [
  {
    num: "01",
    title: "Choose a Doctor",
    desc: "Search specialists by specialty, city, and hospital.",
  },
  {
    num: "02",
    title: "Pick Your Slot",
    desc: "Select your preferred consultation type, date, and time.",
  },
  {
    num: "03",
    title: "Manage Everything",
    desc: "Track appointments and documents from your dashboard.",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const btnRef = useRef(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [doctors, setDoctors] = useState([]);
  const [summary, setSummary] = useState({
    totalDoctors: 0,
    availableDoctors: 0,
    specialties: 0,
    cities: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((previous) => (previous + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      const user = localStorage.getItem("currentUser");
      if (user) {
        setCurrentUser(JSON.parse(user));
      }
    } catch (error) {
      localStorage.removeItem("currentUser");
      localStorage.removeItem("token");
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        discoverOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        btnRef.current &&
        !btnRef.current.contains(event.target)
      ) {
        setDiscoverOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [discoverOpen]);

  useEffect(() => {
    Promise.all([
      publicFetch("/doctors"),
      publicFetch("/doctors/summary"),
    ])
      .then(([doctorList, doctorSummary]) => {
        setDoctors(Array.isArray(doctorList) ? doctorList : []);
        if (doctorSummary) {
          setSummary(doctorSummary);
        }
      })
      .catch(() => {
        setDoctors([]);
      });
  }, []);

  const featuredDoctors = useMemo(() => doctors.slice(0, 4), [doctors]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    setCurrentUser(null);
  };

  const dashboardPath =
    currentUser?.role === "admin"
      ? "/AdminDashboard"
      : currentUser?.role === "doctor"
        ? "/DoctorDashboard"
        : "/Patientdashboard";

  return (
    <div id="home-page">
      <nav className="navbar">
        <div className="container" style={{ position: "relative" }}>
          <Link to="/" className="logo">
            WECARE
          </Link>

          <ul className={`nav-links ${mobileMenuOpen ? "active" : ""}`}>
            <li>
              <button
                ref={btnRef}
                className={`discover-btn ${discoverOpen ? "active" : ""}`}
                onClick={() => setDiscoverOpen((value) => !value)}
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
                <Link to={dashboardPath} className="btn btn-ghost">
                  {currentUser.role === 'doctor' && currentUser.name && !currentUser.name.startsWith("Dr.") 
                    ? `Dr. ${currentUser.name}` 
                    : (currentUser.name || "Dashboard")}
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
            onClick={() => setMobileMenuOpen((value) => !value)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      <div
        ref={menuRef}
        className={`mega-menu-container ${discoverOpen ? "open" : ""}`}
      >
        <div className="mega-menu-box">
          <div className="mega-menu-tabs">
            {["overview", "services", "academics", "news"].map((tab) => (
              <div
                key={tab}
                className={`mega-tab ${activeTab === tab ? "active" : ""}`}
                onMouseEnter={() => setActiveTab(tab)}
              >
                {tab === "overview"
                  ? "Overview"
                  : tab === "services"
                    ? "Medical Services"
                    : tab === "academics"
                      ? "Academics & Research"
                      : "News & Media"}
                <span className="mega-tab-icon">›</span>
              </div>
            ))}
          </div>

          <div className="mega-menu-content">
            <div className="mega-link-group">
              <h4>Explore</h4>
              {menuData[activeTab].map((item) => (
                <a key={item.name} href={item.link} className="mega-link">
                  {item.name}
                </a>
              ))}
            </div>
            <div className="mega-link-group">
              <h4>Quick Access</h4>
              <Link to="/doctors" className="mega-link">
                Find a Doctor
              </Link>
              <Link to="/booking" className="mega-link">
                Book Appointment
              </Link>
              <a href="tel:1860-500-1066" className="mega-link">
                Emergency Services
              </a>
            </div>
          </div>

          <div className="mega-menu-quick">
            <button
              className="quick-close-btn"
              onClick={() => setDiscoverOpen(false)}
            >
              ×
            </button>
            <h3 className="quick-title">Quick Links</h3>
            <div className="quick-contact">
              <span className="quick-label">Doctors</span>
              <span className="quick-number">{summary.totalDoctors}</span>
            </div>
            <div className="quick-contact">
              <span className="quick-label">Available Now</span>
              <span className="quick-number">{summary.availableDoctors}</span>
            </div>
            <div
              style={{
                marginTop: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <Link to="/booking" className="quick-btn">
                <span>Book Appointment</span>
                <span>→</span>
              </Link>
              <Link to="/doctors" className="quick-btn">
                <span>Find Doctors</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main>
        <section className="hero" id="hero">
          <div className="hero-bg-slider">
            {slides.map((src, index) => (
              <div
                key={src}
                className={`hero-bg-slide ${index === activeSlide ? "active" : ""}`}
                style={{ backgroundImage: `url(${src})` }}
              />
            ))}
          </div>
          <div className="hero-overlay"></div>

          <div className="container">
            <div className="hero-content">
              <span className="hero-label">Healthcare Made Simple</span>
              <h1 className="hero-title">
                Your Health, <em>Our Priority.</em>
              </h1>
              <p className="hero-description">
                Discover specialists, book appointments, and manage your medical
                records from one connected platform.
              </p>
              <div className="hero-actions">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => navigate("/booking")}
                >
                  Book Appointment
                </button>
                <Link to="/doctors" className="btn btn-outline btn-lg">
                  Find Doctors
                </Link>
              </div>
              <div className="hero-trust">
                <span className="trust-item">Verified doctors</span>
                <span className="trust-item">Secure records</span>
                <span className="trust-item">Real-time dashboards</span>
              </div>
            </div>
          </div>
        </section>

        <section className="about section-peach" id="about">
          <div className="container">
            <div className="about-wrapper">
              <span className="section-label">About Us</span>
              <h2 className="section-title">Built Around Real Care</h2>
              <p className="about-text">
                WECARE connects patients, doctors, and administrators through a
                single workflow backed by live backend data instead of manual
                records and duplicated spreadsheets.
              </p>
              <p className="about-text">
                Doctors publish their profiles, patients book appointments, and
                every dashboard updates from the same source of truth.
              </p>
              <Link to="/signup" className="btn btn-primary">
                Create an Account
              </Link>
            </div>
          </div>
        </section>

        <section className="features section-white" id="features">
          <div className="container">
            <div className="section-header">
              <span className="section-label">What We Offer</span>
              <h2 className="section-title">Everything You Need</h2>
              <p className="section-subtitle">
                Live doctor listings, appointments, and patient records in one place
              </p>
            </div>

            <div className="features-grid">
              {features.map((feature) => (
                <div key={feature.title} className="feature-card">
                  <div className="feature-icon">{feature.icon}</div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-text">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="stats-section">
          <div className="container">
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">{summary.totalDoctors}</div>
                <div className="stat-label">Doctors</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{summary.availableDoctors}</div>
                <div className="stat-label">Available Now</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{summary.specialties}</div>
                <div className="stat-label">Specialties</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{summary.cities}</div>
                <div className="stat-label">Cities Covered</div>
              </div>
            </div>
          </div>
        </section>

        <section className="doctors" id="doctors">
          <div className="container">
            <div className="section-header">
              <span className="section-label">Our Specialists</span>
              <h2 className="section-title">Meet Our Doctors</h2>
              <p className="section-subtitle">
                Profiles below are loaded directly from the backend
              </p>
            </div>

            <div className="doctors-grid">
              {featuredDoctors.map((doctor) => (
                <div key={doctor._id} className="doctor-card">
                  <div className="doctor-image">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                        doctor.name
                      )}&background=EAF2FF&color=1E3A8A&size=200`}
                      alt={doctor.name}
                    />
                  </div>
                  <div className="doctor-info">
                    <h3 className="doctor-name">{doctor.name}</h3>
                    <p className="doctor-specialty">{doctor.specialty}</p>
                    <div className="doctor-meta">
                      <span>{doctor.experience || 0}+ Years</span>
                    </div>
                    <p className="doctor-affiliation">
                      {doctor.hospital || "WECARE Network"}
                    </p>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() =>
                        navigate("/booking", {
                          state: {
                            doctorId: doctor._id,
                            doctor: doctor.name,
                            specialty: doctor.specialty,
                            hospital: doctor.hospital,
                          },
                        })
                      }
                    >
                      Book Appointment
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="doctors-cta">
              <Link to="/doctors" className="btn btn-primary">
                View All Doctors
              </Link>
            </div>
          </div>
        </section>

        <section className="how-it-works section-white" id="how-it-works">
          <div className="container">
            <div className="section-header">
              <span className="section-label">Simple Process</span>
              <h2 className="section-title">How It Works</h2>
              <p className="section-subtitle">
                Go from discovery to booking in a few steps
              </p>
            </div>

            <div className="steps-grid">
              {steps.map((step, index) => (
                <React.Fragment key={step.num}>
                  <div className="step-card">
                    <div className="step-number">{step.num}</div>
                    <h3 className="step-title">{step.title}</h3>
                    <p className="step-text">{step.desc}</p>
                  </div>
                  {index < steps.length - 1 && <div className="step-connector" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              <h2 className="cta-title">Ready to Get Started?</h2>
              <p className="cta-text">
                Create an account and start booking with specialists today.
              </p>
              <Link to="/signup" className="btn btn-primary btn-lg">
                Create Free Account
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer" id="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">WECARE</div>
              <p className="footer-tagline">
                One connected healthcare workflow for patients, doctors, and admins.
              </p>
            </div>
            <div className="footer-col">
              <h4>Quick Links</h4>
              <a href="#about">About Us</a>
              <a href="#features">Features</a>
              <a href="#doctors">Doctors</a>
            </div>
            <div className="footer-col">
              <h4>Services</h4>
              <Link to="/doctors">Find Doctor</Link>
              <Link to="/booking">Book Appointment</Link>
              <Link to="/signin">Patient Login</Link>
            </div>
            <div className="footer-col">
              <h4>Contact</h4>
              <a href="tel:1860-500-1066">Helpline: 1860-500-1066</a>
              <a href="mailto:support@wecare.com">support@wecare.com</a>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-copyright">© 2026 WECARE. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
