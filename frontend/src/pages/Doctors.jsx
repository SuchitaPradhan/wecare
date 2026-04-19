import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import doctorsDataFallback from "../data/doctors.json";
import { API_BASE } from "../config/api";
import "../megamenu.css";
import "./Doctors.css";

// ─── Confirmation Modal ───────────────────────────────────────────────────────
function ConfirmationModal({ booking, onClose }) {
  if (!booking) return null;
  return (
    <div className="confirm-overlay" onClick={onClose}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-tick-circle">
          <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="26" cy="26" r="24" stroke="#2e7d32" strokeWidth="2.5" className="confirm-circle-anim" />
            <path d="M14 27 l9 9 l16 -16" stroke="#2e7d32" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="confirm-check-anim" />
          </svg>
        </div>
        <h2 className="confirm-title">Appointment Confirmed!</h2>
        <p className="confirm-subtitle">Your booking has been successfully scheduled.</p>
        <div className="confirm-details-card">
          <div className="confirm-detail-row">
            <span className="confirm-detail-icon">👨‍⚕️</span>
            <div className="confirm-detail-text">
              <span className="confirm-detail-label">Doctor</span>
              <span className="confirm-detail-value">{booking.doctorName}</span>
            </div>
          </div>
          <div className="confirm-detail-row">
            <span className="confirm-detail-icon">🏥</span>
            <div className="confirm-detail-text">
              <span className="confirm-detail-label">Hospital</span>
              <span className="confirm-detail-value">{booking.hospital}</span>
            </div>
          </div>
          <div className="confirm-detail-row">
            <span className="confirm-detail-icon">📅</span>
            <div className="confirm-detail-text">
              <span className="confirm-detail-label">Date &amp; Time</span>
              <span className="confirm-detail-value">{booking.label}</span>
            </div>
          </div>
        </div>
        <button className="confirm-close-btn" onClick={onClose}>Done</button>
      </div>
    </div>
  );
}

// ─── Login Modal ──────────────────────────────────────────────────────────────
const MOCK_OTP = "123456";

function LoginModal({ pendingBooking, onSuccess, onClose }) {
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [resendTimer, setResendTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (step === "otp") {
      timerRef.current = setInterval(() => {
        setResendTimer((t) => {
          if (t <= 1) { clearInterval(timerRef.current); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [step]);

  const handlePhoneSubmit = () => {
    if (!/^\d{10}$/.test(phone)) {
      setPhoneError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setPhoneError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
      setResendTimer(30);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }, 800);
  };

  const handleOtpChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    setOtpError("");
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0)
      otpRefs.current[idx - 1]?.focus();
  };

  const handleVerify = () => {
    const entered = otp.join("");
    if (entered.length < 6) {
      setOtpError("Please enter the complete 6-digit OTP.");
      return;
    }
    if (entered !== MOCK_OTP) {
      setOtpError("Invalid OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess();
    }, 800);
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    setOtp(["", "", "", "", "", ""]);
    setOtpError("");
    setResendTimer(30);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
    setTimeout(() => otpRefs.current[0]?.focus(), 50);
  };

  return (
    <div className="lm-overlay" onClick={onClose}>
      <div className="lm-modal" onClick={(e) => e.stopPropagation()}>
        <button className="lm-close" onClick={onClose}>×</button>

        {step === "phone" && (
          <>
            <div className="lm-icon">👋</div>
            <h2 className="lm-title">Hello, Guest!</h2>
            <p className="lm-subtitle">Quick login using Mobile Number</p>
            {pendingBooking && (
              <div className="lm-slot-preview">📅 {pendingBooking.label}</div>
            )}
            <div className="lm-phone-row">
              <span className="lm-country-code">+91</span>
              <input
                className={`lm-phone-input ${phoneError ? "lm-input-error" : ""}`}
                type="tel"
                maxLength={10}
                placeholder="Enter mobile number"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, ""));
                  setPhoneError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handlePhoneSubmit()}
                autoFocus
              />
            </div>
            {phoneError && <p className="lm-error">{phoneError}</p>}
            <button className="lm-primary-btn" onClick={handlePhoneSubmit} disabled={loading}>
              {loading ? "Sending OTP..." : "GET STARTED →"}
            </button>
          </>
        )}

        {step === "otp" && (
          <>
            <div className="lm-icon">🔐</div>
            <h2 className="lm-title">Verify OTP</h2>
            <p className="lm-subtitle">
              Sent to +91 {phone}
              <button
                className="lm-change-btn"
                onClick={() => {
                  setStep("phone");
                  setOtp(["", "", "", "", "", ""]);
                  setOtpError("");
                }}
              >
                Change
              </button>
            </p>
            <div className="lm-otp-row">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpRefs.current[idx] = el)}
                  className={`lm-otp-box ${otpError ? "lm-input-error" : ""} ${digit ? "lm-otp-filled" : ""}`}
                  type="tel"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, idx)}
                  onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                />
              ))}
            </div>
            {otpError && <p className="lm-error">{otpError}</p>}
            <p className="lm-hint">Use <strong>123456</strong> as OTP for demo</p>
            <p className="lm-resend">
              {resendTimer > 0
                ? `Resend OTP in ${resendTimer}s`
                : <button className="lm-resend-btn" onClick={handleResend}>Resend OTP</button>
              }
            </p>
            <button
              className="lm-primary-btn"
              onClick={handleVerify}
              disabled={loading || otp.join("").length < 6}
            >
              {loading ? "Verifying..." : "VERIFY & CONFIRM →"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── SlotPicker Component ─────────────────────────────────────────────────────
import "./SlotPicker.css";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function generateDates(count = 10) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
}

function getSlotsForDate(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const diffDays = Math.round((d - today) / (1000 * 60 * 60 * 24));

  if (date.getDay() === 0) return [];
  if (diffDays === 0) return [];
  if (diffDays === 1) return ["11:30 AM", "04:00 PM"];

  const allMorning   = ["09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM"];
  const allAfternoon = ["12:00 PM","12:30 PM","01:00 PM","02:00 PM","02:30 PM"];
  const allEvening   = ["03:00 PM","03:30 PM","04:00 PM","04:30 PM","05:00 PM","05:30 PM","06:00 PM"];
  const seed = date.getDate();
  return [
    ...allMorning.filter((_,i) => (seed+i)%3 !== 0),
    ...allAfternoon.filter((_,i) => (seed+i)%2 !== 0),
    ...allEvening.filter((_,i) => (seed+i)%3 !== 1),
  ];
}

function SlotPicker({ hospital, onClose, onBook }) {
  const allDates = generateDates(10);
  const [dateOffset, setDateOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(allDates[0]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotOffset, setSlotOffset] = useState(0);

  const DATES_VISIBLE = 6;
  const SLOTS_VISIBLE = 4;

  const visibleDates = allDates.slice(dateOffset, dateOffset + DATES_VISIBLE);
  const slots = getSlotsForDate(selectedDate);
  const visibleSlots = slots.slice(slotOffset, slotOffset + SLOTS_VISIBLE);

  const handleDateSelect = (d) => {
    setSelectedDate(d);
    setSelectedSlot(null);
    setSlotOffset(0);
  };

  const isToday = (d) => d.toDateString() === new Date().toDateString();
  const isDateSelected = (d) => d.toDateString() === selectedDate.toDateString();

  return (
    <div className="sp-box">
      <div className="sp-hospital-row">
        <span className="sp-hospital-name">{hospital}</span>
        <button className="sp-x-btn" onClick={onClose}>✕</button>
      </div>

      <div className="sp-section-label">SELECT DATE</div>

      <div className="sp-date-strip">
        <button
          className="sp-arrow"
          onClick={() => setDateOffset(Math.max(0, dateOffset - DATES_VISIBLE))}
          disabled={dateOffset === 0}
        >‹</button>
        <div className="sp-dates-row">
          {visibleDates.map((d, i) => (
            <button
              key={i}
              className={["sp-date-cell", isToday(d) ? "sp-today" : "", isDateSelected(d) ? "sp-date-selected" : ""].join(" ")}
              onClick={() => handleDateSelect(d)}
            >
              <span className="sp-day-abbr">{WEEK_DAYS[d.getDay()].slice(0, 3)}</span>
              <span className="sp-day-num">{d.getDate()}</span>
            </button>
          ))}
        </div>
        <button
          className="sp-arrow"
          onClick={() => setDateOffset(Math.min(allDates.length - DATES_VISIBLE, dateOffset + DATES_VISIBLE))}
          disabled={dateOffset + DATES_VISIBLE >= allDates.length}
        >›</button>
      </div>

      <div className="sp-section-label sp-slots-label">AVAILABLE SLOTS:</div>

      {slots.length === 0 ? (
        <div className="sp-no-slots">No slots available for this day.</div>
      ) : (
        <div className="sp-slots-strip">
          <button
            className="sp-arrow"
            onClick={() => setSlotOffset(Math.max(0, slotOffset - SLOTS_VISIBLE))}
            disabled={slotOffset === 0}
          >‹</button>
          <div className="sp-slots-row">
            {visibleSlots.map((slot) => (
              <button
                key={slot}
                className={["sp-slot-btn", selectedSlot === slot ? "sp-slot-selected" : ""].join(" ")}
                onClick={() => setSelectedSlot(slot)}
              >
                {slot}
              </button>
            ))}
          </div>
          <button
            className="sp-arrow"
            onClick={() => setSlotOffset(Math.min(slots.length - SLOTS_VISIBLE, slotOffset + SLOTS_VISIBLE))}
            disabled={slotOffset + SLOTS_VISIBLE >= slots.length}
          >›</button>
        </div>
      )}

      <button
        className={["sp-book-btn", selectedSlot ? "sp-book-active" : ""].join(" ")}
        disabled={!selectedSlot}
        onClick={() =>
          selectedSlot &&
          onBook({
            date: selectedDate,
            slot: selectedSlot,
            label: `${WEEK_DAYS[selectedDate.getDay()]}, ${selectedDate.getDate()} ${MONTHS[selectedDate.getMonth()]} · ${selectedSlot}`,
          })
        }
      >
        {selectedSlot ? "BOOK APPOINTMENT →" : "REQUEST APPOINTMENT"}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Doctors() {
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [doctorsData, setDoctorsData] = useState(doctorsDataFallback);

  const [openSlotDoctorId, setOpenSlotDoctorId] = useState(null);
  const [bookedSlots, setBookedSlots] = useState({});
  const [confirmationBooking, setConfirmationBooking] = useState(null);

  // ── login modal state ──
  const [loginModal, setLoginModal] = useState(null);

  useEffect(() => {
    try {
      const user = localStorage.getItem("currentUser");
      if (user) setCurrentUser(JSON.parse(user));
    } catch (e) {
      console.error("Error parsing user data:", e);
      localStorage.removeItem("currentUser");
    }

    // Fetch doctors from API, fall back to JSON
    fetch(`${API_BASE}/doctors`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Map DB field names to what the UI expects
          const mapped = data.map((d) => ({
            ...d,
            id: d._id || d.id,
            speciality: d.specialty || d.speciality,
          }));
          setDoctorsData(mapped);
        }
      })
      .catch(() => console.log("Using fallback doctor data"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
  };

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

  const [specialitySearch, setSpecialitySearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [selectedSpecialities, setSelectedSpecialities] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);

  const allSpecialities = [...new Set(doctorsData.map((doc) => doc.speciality))];
  const allCities = [...new Set(doctorsData.map((doc) => doc.city))];
  const allLanguages = ["Odia", "Hindi", "English"];

  const toggleSelection = (item, list, setList) => {
    if (list.includes(item)) setList(list.filter((i) => i !== item));
    else setList([...list, item]);
  };

  const clearAllFilters = () => {
    setSelectedSpecialities([]);
    setSelectedCities([]);
    setSelectedLanguages([]);
    setSpecialitySearch("");
    setCitySearch("");
  };

  const filteredDoctors = doctorsData.filter((doctor) => {
    if (selectedSpecialities.length > 0 && !selectedSpecialities.includes(doctor.speciality)) return false;
    if (selectedCities.length > 0 && !selectedCities.includes(doctor.city)) return false;
    if (selectedLanguages.length > 0) {
      if (!doctor.languages) return false;
      if (!doctor.languages.some((lang) => selectedLanguages.includes(lang))) return false;
    }
    return true;
  });

  return (
    <div className="doctors-page">

      {/* ─── Confirmation Modal ─── */}
      <ConfirmationModal
        booking={confirmationBooking}
        onClose={() => setConfirmationBooking(null)}
      />

      {/* ─── Login Modal ─── */}
      {loginModal && (
        <LoginModal
          pendingBooking={loginModal.bookingData}
          onClose={() => setLoginModal(null)}
          onSuccess={() => {
            setBookedSlots((prev) => ({
              ...prev,
              [loginModal.doctorId]: { label: loginModal.bookingData.label },
            }));
            setConfirmationBooking({
              doctorName: loginModal.doctorName,
              hospital: loginModal.hospital,
              label: loginModal.bookingData.label,
            });
            setLoginModal(null);
          }}
        />
      )}

      {/* --- Navbar --- */}
      <nav className="navbar" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000 }}>
        <div className="container" style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Link to="/" className="logo">WECARE</Link>
          </div>
          <ul className={`nav-links ${mobileMenuOpen ? "active" : ""}`}>
            <li>
              <button
                className={`discover-btn ${discoverOpen ? "active" : ""}`}
                onClick={() => setDiscoverOpen(!discoverOpen)}
              >
                DISCOVER WECARE <span className="chevron">▼</span>
              </button>
            </li>
            <li><a href="/#about">About</a></li>
            <li><a href="/#features">Features</a></li>
            <li><a href="/doctors">Doctors</a></li>
            <li><a href="/#how-it-works">How It Works</a></li>
          </ul>
          <div className="nav-actions">
            {currentUser ? (
              <>
                <Link
                  to={currentUser.role === 'admin' ? '/AdminDashboard' : currentUser.role === 'doctor' ? '/DoctorDashboard' : '/Patientdashboard'}
                  className="btn btn-ghost"
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <img
                    src="https://i.pravatar.cc/100?img=47"
                    alt={currentUser.name || "User"}
                    style={{ width: "28px", height: "28px", borderRadius: "50%" }}
                  />
                  {currentUser.name || "Dashboard"}
                </Link>
                <button onClick={handleLogout} className="btn btn-outline">Logout</button>
              </>
            ) : (
              <>
                <Link to="/signin" className="btn btn-ghost">Sign In</Link>
                <Link to="/signup" className="btn btn-primary">Get Started</Link>
              </>
            )}
          </div>
          <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      {/* --- Mega Menu --- */}
      <div className={`mega-menu-container ${discoverOpen ? "open" : ""}`} style={{ top: "80px" }}>
        <div className="mega-menu-box">
          <div className="mega-menu-tabs">
            <div className={`mega-tab ${activeTab === "overview" ? "active" : ""}`} onMouseEnter={() => setActiveTab("overview")}>Overview <span className="mega-tab-icon">›</span></div>
            <div className={`mega-tab ${activeTab === "services" ? "active" : ""}`} onMouseEnter={() => setActiveTab("services")}>Medical Services <span className="mega-tab-icon">›</span></div>
            <div className={`mega-tab ${activeTab === "academics" ? "active" : ""}`} onMouseEnter={() => setActiveTab("academics")}>Academics &amp; Research <span className="mega-tab-icon">›</span></div>
            <div className="mega-tab">News &amp; Media <span className="mega-tab-icon">›</span></div>
            <div className="mega-tab">Patient Care <span className="mega-tab-icon">›</span></div>
            <div className="mega-tab">Contact Us <span className="mega-tab-icon">›</span></div>
          </div>
          <div className="mega-menu-content">
            <div className="mega-link-group">
              <h4>Explore</h4>
              {menuData[activeTab]?.map((item, index) => (
                <a key={index} href={item.link} className="mega-link">{item.name}</a>
              ))}
            </div>
            <div className="mega-link-group">
              <h4>Quick Access</h4>
              <a href="#" className="mega-link">Find a Doctor</a>
              <a href="#" className="mega-link">Book Appointment</a>
              <a href="#" className="mega-link">Emergency Services</a>
              <a href="#" className="mega-link">Health Library</a>
            </div>
          </div>
          <div className="mega-menu-quick">
            <button className="quick-close-btn" onClick={() => setDiscoverOpen(false)}>×</button>
            <h3 className="quick-title">Quick Links</h3>
            <div className="quick-contact"><span className="quick-label">Emergency</span><span className="quick-number">1066</span></div>
            <div className="quick-contact"><span className="quick-label">WECARE Lifeline</span><span className="quick-number">1860-500-1066</span></div>
            <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
              <a href="#" className="quick-btn"><span>Book Appointment</span><span>→</span></a>
              <a href="#" className="quick-btn"><span>Find Doctors</span><span>→</span></a>
              <a href="#" className="quick-btn"><span>Contact Us</span><span>→</span></a>
            </div>
          </div>
        </div>
      </div>

      {/* --- Page Content --- */}
      <div className="container">
        <div className="doctors-header">
          <h2>Find a Doctor</h2>
        </div>
        <div className="doctors-layout">

          {/* Filters Sidebar */}
          <aside className="filters-sidebar">
            <div className="filters-header">
              <h3 className="filters-title">Filters</h3>
              <button onClick={clearAllFilters} className="btn-clear">Clear All</button>
            </div>
            <div className="filter-group">
              <h4>Speciality</h4>
              <input
                type="text"
                className="filter-search"
                placeholder="Search speciality..."
                value={specialitySearch}
                onChange={(e) => setSpecialitySearch(e.target.value)}
              />
              <div className="filter-options">
                {allSpecialities
                  .filter((spec) => spec.toLowerCase().includes(specialitySearch.toLowerCase()))
                  .map((spec, idx) => (
                    <label key={idx} className="filter-label">
                      <input
                        type="checkbox"
                        className="filter-checkbox"
                        checked={selectedSpecialities.includes(spec)}
                        onChange={() => toggleSelection(spec, selectedSpecialities, setSelectedSpecialities)}
                      />
                      {spec}
                    </label>
                  ))}
              </div>
            </div>
            <div className="filter-group">
              <h4>Select City</h4>
              <input
                type="text"
                className="filter-search"
                placeholder="Search city..."
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
              />
              <div className="filter-options">
                {allCities
                  .filter((city) => city.toLowerCase().includes(citySearch.toLowerCase()))
                  .map((city, idx) => (
                    <label key={idx} className="filter-label">
                      <input
                        type="checkbox"
                        className="filter-checkbox"
                        checked={selectedCities.includes(city)}
                        onChange={() => toggleSelection(city, selectedCities, setSelectedCities)}
                      />
                      {city}
                    </label>
                  ))}
              </div>
            </div>
            <div className="filter-group">
              <h4>Language</h4>
              <div className="filter-options">
                {allLanguages.map((lang, idx) => (
                  <label key={idx} className="filter-label">
                    <input
                      type="checkbox"
                      className="filter-checkbox"
                      checked={selectedLanguages.includes(lang)}
                      onChange={() => toggleSelection(lang, selectedLanguages, setSelectedLanguages)}
                    />
                    {lang}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Doctor List */}
          <div className="doctors-list-container">
            <h3 className="list-header">Showing {filteredDoctors.length} doctors</h3>
            <div className="doctors-list-grid">
              {filteredDoctors.map((doctor) => (
                <div key={doctor.id} className="doctor-card-horizontal">
                  <div className="doctor-avatar-box">
                    <img
                      src={`https://ui-avatars.com/api/?name=${doctor.name}&background=random&size=200`}
                      alt={doctor.name}
                    />
                  </div>
                  <div className="doctor-info-box">
                    <h3 className="doctor-name">{doctor.name}</h3>
                    <p className="doctor-speciality">{doctor.speciality}</p>
                    <div className="doctor-details">
                      <p className="doctor-qualification">{doctor.qualification || "MBBS"}</p>
                      <div>
                        <span className="doctor-experience-badge">{doctor.experience} Years Experience</span>
                      </div>
                      <div
                        className="doctor-details-grid"
                        style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "6px" }}
                      >
                        <div className="doctor-meta-row">
                          <span style={{ fontWeight: "600", color: "var(--color-text-dark)" }}>
                            🏥 {doctor.hospital}, {doctor.city}
                          </span>
                        </div>
                        <div className="doctor-shifts">
                          <span>🕐 {doctor.shifts || "Mon - Sat : 10:00 AM - 05:00 PM"}</span>
                        </div>
                        <div className="doctor-languages">
                          <span>🗣️ Speaks: {doctor.languages ? doctor.languages.join(", ") : "English, Hindi"}</span>
                        </div>
                      </div>
                      {bookedSlots[doctor.id] && (
                        <div className="slot-booked-badge">
                          ✅ Booked: {bookedSlots[doctor.id].label}
                          <button
                            className="slot-cancel-link"
                            onClick={() =>
                              setBookedSlots((prev) => {
                                const n = { ...prev };
                                delete n[doctor.id];
                                return n;
                              })
                            }
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="doctor-actions">
                    {openSlotDoctorId === doctor.id ? (
                      <SlotPicker
                        hospital={`${doctor.hospital}, ${doctor.city}`}
                        onClose={() => setOpenSlotDoctorId(null)}
                        onBook={(bookingData) => {
                          // ── CHANGED: open login modal instead of confirming directly ──
                          setOpenSlotDoctorId(null);
                          setLoginModal({
                            doctorId: doctor.id,
                            doctorName: doctor.name,
                            hospital: `${doctor.hospital}, ${doctor.city}`,
                            bookingData,
                          });
                        }}
                      />
                    ) : (
                      <>
                        <button
                          className="btn-book"
                          onClick={() => {
                            setOpenSlotDoctorId(doctor.id);
                            setBookedSlots((prev) => {
                              const n = { ...prev };
                              delete n[doctor.id];
                              return n;
                            });
                          }}
                        >
                          Book Appointment
                        </button>
                        <a href="tel:1860-500-1066" className="btn-call">📞 Call</a>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {filteredDoctors.length === 0 && (
                <div className="no-results">
                  <p>No doctors found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
