import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
    return (
        <section className="hero-big">
            {/* Abstract Background Layer */}
            <div className="hero-bg-abstract"></div>

            {/* Main Content */}
            <div className="hero-content">
                <h1 className="hero-title-large">
                    You deserve better healthcare. Period.
                </h1>

                <p className="hero-subtitle-large">
                    Healthcare wasn't designed for women, so we made it our mission to change that.
                    Expert answers, clinical results, and personalised care—all from home.
                </p>

                <div className="hero-actions">
                    <Link to="/booking" className="btn btn-primary btn-lg">
                        Start 5-min assessment
                    </Link>
                    <a href="#services" className="btn btn-secondary btn-lg">
                        Explore our services
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Hero;
