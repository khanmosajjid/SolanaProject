import React from "react";
import aboutImage from "../../assets/img/images/about-dog.png"; 

const About = () => {
  return (
    <section id="about" className="about-us pt-80">
      <div className="container">
        <div className="row">
          <div className="col-lg-11 box_about d-flex m-auto flex-wrap">
            
            {/* Left Content */}
            <div className="col-lg-7 left_div">
              <div className="about-content mb-4 pe-lg-4">
                
                <h1 className="display-4 fw-bold text-white mb-3">
                  About <span className="loot-gradient">Us</span>
                </h1>

                <p className="text-secondary lead mb-4">
                  Welcome to <strong className="text-white">Loot Laugh</strong> — 
                  a community-powered meme token built on the{" "}
                  <span className="solana-color">Solana blockchain</span>. 
                  Where speed is fast, fees are tiny, and memes travel at light speed. 
                  We’re not here to promise boring whitepapers or fake hype; 
                  we are here to build{" "}
                  <strong>culture, community, and chaos</strong> (the fun kind).
                </p>

                <div className="row g-4 mt-2">
                  
                  {/* Why Solana */}
                  <div className="col-md-6">
                    <div className="feature-box p-3 border-start border-3 border-warning h-100">
                      <h4 className="text-white mb-3">Why Solana?</h4>
                      <ul className="list-unstyled text-secondary">
                        <li className="mb-2 d-flex align-items-center">
                          <span className="fs-4 me-2"></span>
                          <span>Ultra-fast transactions</span>
                        </li>
                        <li className="mb-2 d-flex align-items-center">
                          <span className="fs-4 me-2"></span>
                          <span>Low fees (no wallet-crying)</span>
                        </li>
                        <li className="d-flex align-items-center">
                          <span className="fs-4 me-2"></span>
                          <span>A growing, powerful ecosystem</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Our Mission */}
                  <div className="col-md-6">
                    <div className="feature-box p-3 border-start border-3 border-info h-100">
                      <h4 className="text-white mb-3">Our Mission</h4>
                      <ul className="list-unstyled text-secondary">
                        <li className="mb-2 d-flex align-items-center">
                          <span className="fs-5 me-2"></span>
                          <span>Unite people across Solana</span>
                        </li>
                        <li className="mb-2 d-flex align-items-center">
                          <span className="fs-5 me-2"></span>
                          <span>Reward early believers & holders</span>
                        </li>
                        <li className="d-flex align-items-center">
                          <span className="fs-5 me-2"></span>
                          <span>Turn laughs into long-term value</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="col-lg-5 d-flex justify-content-lg-end justify-content-sm-center">
              <img
                src={aboutImage}
                className="img-fluid royalimg"
                alt="royal coin"
              />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
