import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { publicFetch } from "../config/api";
import "../megamenu.css";
import "./Doctors.css";

const menuData = {
  overview: [
    { name: "The WECARE Story", link: "/#about" },
    { name: "Medical Services", link: "/#features" },
    { name: "Find Doctors", link: "/doctors" },
  ],
  services: [
    { name: "Book Appointment", link: "/booking" },
    { name: "Patient Login", link: "/signin" },
    { name: "Create Account", link: "/signup" },
  ],
  academics: [
    { name: "Clinical Excellence", link: "/#features" },
    { name: "Research Programs", link: "/#features" },
    { name: "Patient Support", link: "/#footer" },
  ],
};

export default function Doctors() {
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [specialitySearch, setSpecialitySearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [selectedSpecialities, setSelectedSpecialities] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);

  useEffect(() => {
    try {
      const user = localStorage.getItem("currentUser");
      if (user) {
        setCurrentUser(JSON.parse(user));
      }
    } catch (parseError) {
      localStorage.removeItem("currentUser");
      localStorage.removeItem("token");
    }

    publicFetch("/doctors")
      .then((data) => {
        setDoctors(Array.isArray(data) ? data : []);
      })
      .catch((fetchError) => {
        setError(fetchError.message || "Failed to load doctors");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const allSpecialities = useMemo(
    () => [...new Set(doctors.map((doctor) => doctor.specialty).filter(Boolean))],
    [doctors]
  );
  const allCities = useMemo(
    () => [...new Set(doctors.map((doctor) => doctor.city).filter(Boolean))],
    [doctors]
  );
  const allLanguages = useMemo(
    () =>
      [
        ...new Set(
          doctors.flatMap((doctor) =>
            Array.isArray(doctor.languages) ? doctor.languages : []
          )
        ),
      ].sort(),
    [doctors]
  );

  const filteredDoctors = useMemo(
    () =>
      doctors.filter((doctor) => {
        if (
          selectedSpecialities.length > 0 &&
          !selectedSpecialities.includes(doctor.specialty)
        ) {
          return false;
        }
        if (selectedCities.length > 0 && !selectedCities.includes(doctor.city)) {
          return false;
        }
        if (selectedLanguages.length > 0) {
          const doctorLanguages = Array.isArray(doctor.languages)
            ? doctor.languages
            : [];
          if (!doctorLanguages.some((language) => selectedLanguages.includes(language))) {
            return false;
          }
        }
        return true;
      }),
    [doctors, selectedCities, selectedLanguages, selectedSpecialities]
  );

  const toggleSelection = (item, list, setList) => {
    setList(
      list.includes(item) ? list.filter((value) => value !== item) : [...list, item]
    );
  };

  const clearAllFilters = () => {
    setSelectedSpecialities([]);
    setSelectedCities([]);
    setSelectedLanguages([]);
    setSpecialitySearch("");
    setCitySearch("");
  };

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
    <div className="doctors-page">
      <nav
        className="navbar"
        style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000 }}
      >
        <div className="container" style={{ position: "relative" }}>
          <Link to="/" className="logo">
            WECARE
          </Link>

          <ul className={`nav-links ${mobileMenuOpen ? "active" : ""}`}>
            <li>
              <button
                className={`discover-btn ${discoverOpen ? "active" : ""}`}
                onClick={() => setDiscoverOpen((value) => !value)}
              >
                DISCOVER WECARE <span className="chevron">▼</span>
              </button>
            </li>
            <li>
              <a href="/#about">About</a>
            </li>
            <li>
              <a href="/#features">Features</a>
            </li>
            <li>
              <a href="/doctors">Doctors</a>
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
        className={`mega-menu-container ${discoverOpen ? "open" : ""}`}
        style={{ top: "80px" }}
      >
        <div className="mega-menu-box">
          <div className="mega-menu-tabs">
            {["overview", "services", "academics"].map((tab) => (
              <div
                key={tab}
                className={`mega-tab ${activeTab === tab ? "active" : ""}`}
                onMouseEnter={() => setActiveTab(tab)}
              >
                {tab === "overview"
                  ? "Overview"
                  : tab === "services"
                    ? "Medical Services"
                    : "Academics & Research"}
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
            </div>
          </div>

          <div className="mega-menu-quick">
            <button className="quick-close-btn" onClick={() => setDiscoverOpen(false)}>
              ×
            </button>
            <h3 className="quick-title">Quick Links</h3>
            <div className="quick-contact">
              <span className="quick-label">Doctors Loaded</span>
              <span className="quick-number">{doctors.length}</span>
            </div>
            <div className="quick-contact">
              <span className="quick-label">Filters Active</span>
              <span className="quick-number">
                {selectedSpecialities.length + selectedCities.length + selectedLanguages.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="doctors-header">
          <h2>Find a Doctor</h2>
        </div>

        <div className="doctors-layout">
          <aside className="filters-sidebar">
            <div className="filters-header">
              <h3 className="filters-title">Filters</h3>
              <button onClick={clearAllFilters} className="btn-clear">
                Clear All
              </button>
            </div>

            <div className="filter-group">
              <h4>Speciality</h4>
              <input
                type="text"
                className="filter-search"
                placeholder="Search speciality..."
                value={specialitySearch}
                onChange={(event) => setSpecialitySearch(event.target.value)}
              />
              <div className="filter-options">
                {allSpecialities
                  .filter((speciality) =>
                    speciality.toLowerCase().includes(specialitySearch.toLowerCase())
                  )
                  .map((speciality) => (
                    <label key={speciality} className="filter-label">
                      <input
                        type="checkbox"
                        className="filter-checkbox"
                        checked={selectedSpecialities.includes(speciality)}
                        onChange={() =>
                          toggleSelection(
                            speciality,
                            selectedSpecialities,
                            setSelectedSpecialities
                          )
                        }
                      />
                      {speciality}
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
                onChange={(event) => setCitySearch(event.target.value)}
              />
              <div className="filter-options">
                {allCities
                  .filter((city) =>
                    city.toLowerCase().includes(citySearch.toLowerCase())
                  )
                  .map((city) => (
                    <label key={city} className="filter-label">
                      <input
                        type="checkbox"
                        className="filter-checkbox"
                        checked={selectedCities.includes(city)}
                        onChange={() =>
                          toggleSelection(city, selectedCities, setSelectedCities)
                        }
                      />
                      {city}
                    </label>
                  ))}
              </div>
            </div>

            <div className="filter-group">
              <h4>Language</h4>
              <div className="filter-options">
                {allLanguages.map((language) => (
                  <label key={language} className="filter-label">
                    <input
                      type="checkbox"
                      className="filter-checkbox"
                      checked={selectedLanguages.includes(language)}
                      onChange={() =>
                        toggleSelection(
                          language,
                          selectedLanguages,
                          setSelectedLanguages
                        )
                      }
                    />
                    {language}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          <div className="doctors-list-container">
            <h3 className="list-header">
              Showing {filteredDoctors.length} doctors
            </h3>

            {loading && <p>Loading doctors...</p>}
            {error && <p>{error}</p>}

            <div className="doctors-list-grid">
              {!loading &&
                filteredDoctors.map((doctor) => (
                  <div key={doctor._id} className="doctor-card-horizontal">
                    <div className="doctor-avatar-box">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                          doctor.name
                        )}&background=EEF2FF&color=312E81&size=200`}
                        alt={doctor.name}
                      />
                    </div>

                    <div className="doctor-info-box">
                      <h3 className="doctor-name">
                        {doctor.name?.startsWith("Dr.") ? doctor.name : `Dr. ${doctor.name}`}
                      </h3>
                      <p className="doctor-speciality">
                        {doctor.specialty || "General Medicine"}
                      </p>
                      <div className="doctor-details">
                        <p className="doctor-qualification">
                          {doctor.qualification || "Qualification not added"}
                        </p>
                        <div>
                          <span className="doctor-experience-badge">
                            {doctor.experience || 0} Years Experience
                          </span>
                        </div>
                        <div
                          className="doctor-details-grid"
                          style={{
                            marginTop: "10px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                          }}
                        >
                          <div className="doctor-meta-row">
                            <span style={{ fontWeight: 600 }}>
                              {doctor.hospital || "WECARE Hospital"}
                              {doctor.city ? `, ${doctor.city}` : ""}
                            </span>
                          </div>
                          <div className="doctor-shifts">
                            <span>{doctor.shifts || "Schedule to be updated"}</span>
                          </div>
                          <div className="doctor-languages">
                            <span>
                              Speaks:{" "}
                              {Array.isArray(doctor.languages) && doctor.languages.length > 0
                                ? doctor.languages.join(", ")
                                : "Not specified"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="doctor-actions">
                      <button
                        className="btn-book"
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
                      <a href="tel:1860-500-1066" className="btn-call">
                        Call
                      </a>
                    </div>
                  </div>
                ))}

              {!loading && filteredDoctors.length === 0 && (
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
