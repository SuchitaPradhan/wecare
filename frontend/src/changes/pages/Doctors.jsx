import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import doctorsData from "../data/doctors.json";
import "../megamenu.css";
import "./Doctors.css"; // Import new CSS

export default function Doctors() {
  const navigate = useNavigate();

  // --- Navbar State & Logic (Copied from Home.jsx) ---
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

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

  // --- Doctors Page State ---
  const [specialitySearch, setSpecialitySearch] = useState("");
  const [citySearch, setCitySearch] = useState("");

  const [selectedSpecialities, setSelectedSpecialities] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);

  // Extract unique values
  const allSpecialities = [...new Set(doctorsData.map((doc) => doc.speciality))];
  const allCities = [...new Set(doctorsData.map((doc) => doc.city))];
  const allLanguages = ["Odia", "Hindi", "English"];

  // Handlers for Filters
  const toggleSelection = (item, list, setList) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  // Handler for Clear All
  const clearAllFilters = () => {
    setSelectedSpecialities([]);
    setSelectedCities([]);
    setSelectedLanguages([]);
    setSpecialitySearch("");
    setCitySearch("");
  };

  // Filtering Logic
  const filteredDoctors = doctorsData.filter((doctor) => {
    // 1. Speciality Filter
    if (selectedSpecialities.length > 0 && !selectedSpecialities.includes(doctor.speciality)) {
      return false;
    }
    // 2. City Filter
    if (selectedCities.length > 0 && !selectedCities.includes(doctor.city)) {
      return false;
    }
    // 3. Language Filter
    if (selectedLanguages.length > 0) {
      // Check if doctor speaks at least one of the selected languages
      // Data format: doctor.languages is an array
      if (!doctor.languages) return false;
      const hasLanguage = doctor.languages.some(lang => selectedLanguages.includes(lang));
      if (!hasLanguage) return false;
    }
    
    return true;
  });

  return (
    <div className="doctors-page">
      
      {/* --- Navbar (Same as Home.jsx) --- */}
      <nav className="navbar" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000 }}>
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
            <li><a href="/#about">About</a></li>
            <li><a href="/#features">Features</a></li>
            <li><a href="/doctors">Doctors</a></li>
            <li><a href="/#how-it-works">How It Works</a></li>
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

      {/* --- Mega Menu Dropdown --- */}
      <div className={`mega-menu-container ${discoverOpen ? "open" : ""}`} style={{top: "80px"}}>
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
              <a href="#" className="mega-link">Find a Doctor</a>
              <a href="#" className="mega-link">Book Appointment</a>
              <a href="#" className="mega-link">Emergency Services</a>
              <a href="#" className="mega-link">Health Library</a>
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

      {/* --- Page Content --- */}
      <div className="container">
        
        {/* Header Line */}
        <div className="doctors-header">
           <h2>Find a Doctor</h2>
        </div>

        <div className="doctors-layout">
          
          {/* --- Left Filters Sidebar --- */}
          <aside className="filters-sidebar">
            
            <div className="filters-header">
              <h3 className="filters-title">Filters</h3>
              <button onClick={clearAllFilters} className="btn-clear">
                 Clear All
              </button>
            </div>

            {/* Speciality Filter */}
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
                  .filter(spec => spec.toLowerCase().includes(specialitySearch.toLowerCase()))
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

             {/* City Filter */}
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
                  .filter(city => city.toLowerCase().includes(citySearch.toLowerCase()))
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

            {/* Language Filter */}
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

          {/* --- Right Content: Doctor List --- */}
          <div className="doctors-list-container">
            <h3 className="list-header">Showing {filteredDoctors.length} doctors</h3>
            
            <div className="doctors-grid">
              {filteredDoctors.map((doctor) => (
                <div key={doctor.id} className="doctor-card-horizontal">
                  
                  {/* Doctor Avatar */}
                  <div className="doctor-avatar-box">
                     <img src={`https://ui-avatars.com/api/?name=${doctor.name}&background=random&size=200`} alt={doctor.name} />
                  </div>

                  {/* Doctor Info */}
                  <div className="doctor-info-box">
                    <h3 className="doctor-name">{doctor.name}</h3>
                    <p className="doctor-speciality">{doctor.speciality}</p>
                    
                    <div className="doctor-details">
                      <p className="doctor-qualification">{doctor.qualification || "MBBS"}</p>
                      
                      {/* Highlighted Experience */}
                      <div>
                        <span className="doctor-experience-badge">
                          {doctor.experience} Years Experience
                        </span>
                      </div>

                      <div className="doctor-details-grid" style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                         <div className="doctor-meta-row">
                            <span style={{ fontWeight: "600", color: "var(--color-text-dark)" }}>🏥 {doctor.hospital}, {doctor.city}</span>
                         </div>
                         <div className="doctor-shifts">
                            <span>🕐 {doctor.shifts || "Mon - Sat : 10:00 AM - 05:00 PM"}</span>
                         </div>
                         <div className="doctor-languages">
                            <span>🗣️ Speaks: {doctor.languages ? doctor.languages.join(", ") : "English, Hindi"}</span>
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="doctor-actions">
                    <button 
                      className="btn-book"
                      onClick={() => navigate("/booking")}
                    >
                      Book Appointment
                    </button>
                    <a href="tel:1860-500-1066" className="btn-call">
                       📞 Call
                    </a>
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
