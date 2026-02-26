import React from "react";
import logo from "../../assets/img/logo/logo-1.png";

const Footer = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Subscribed Successfully!");
  };

  return (
    <footer>
      <div
        className="footer-area footer-bg"
        style={{
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container">
          <div className="footer-top">
            <div className="row">
              {/* Logo & About */}
              <div className="col-xl-3 col-lg-2 col-md-4 col-sm-6">
                <div className="footer-widget">
                  <div className="footer_img">
                    <img className="tc1 mb-3" src={logo} alt="logo" />
                  </div>

                  <p className="text-justify">
                    LOL Token is a community-focused meme token built on the
                    Solana blockchain. Designed for fun, engagement, and broader
                    participation in crypto culture, LOL Token combines the
                    speed and low fees of Solana with a growing network of
                    passionate holders.
                  </p>
                </div>
              </div>

              {/* Useful Links */}
              <div className="col-xl-3 col-lg-3 col-md-4 col-sm-6">
                <div className="footer-widget">
                  <h4 className="fw-title">Usefull Links</h4>
                  <div className="footer-link">
                    <ul className="list-wrap">
                      <li>
                        <a href="#feature">About us</a>
                      </li>
                      <li>
                        <a href="#chart">Plateform</a>
                      </li>
                      <li>
                        <a href="#buy-token">Buy Token</a>
                      </li>
                      <li>
                        <a href="#roadMap">Roadmap</a>
                      </li>
                      <li>
                        <a href="#faq">Faq's</a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="col-xl-3 col-lg-2 col-md-4 col-sm-6">
                <div className="footer-widget">
                  <h4 className="fw-title">Social Links</h4>
                  <ul className="footer-social-link flex-wrap">
                    <li>
                      <a
                        href="https://www.facebook.com/share/1BtpSnWPmH/"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <i className="fab fa-facebook-f"></i>
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://x.com/LootLaugh"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <i className="fab fa-twitter"></i>
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.instagram.com/loot_laugh?igsh=bzFlZ2lnbG0wdDVj"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <i className="fab fa-instagram"></i>
                      </a>
                    </li>

                    <li>
                      <a
                        href="https://t.me/lootlaugh"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <i className="fab fa-telegram-plane"></i>
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.youtube.com/@LootLaugh-j3i"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <i className="fab fa-youtube"></i>
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://coinmarketcap.com/community/profile/LootLaugh"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <i className="fas fa-chart-line"></i>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Contact & Newsletter */}
              <div className="col-xl-3 col-lg-4 col-sm-8">
                <div className="footer-widget">
                  <h4 className="fw-title">Subscribe Newsletter</h4>
                  <div class="footer-newsletter">
                    <ul className="contact-list-box">
                      <li className="d-none">
                        <em className="contact-icon fas fa-phone"></em>
                        <div className="contact-text">
                          <span>+44 2341 883345</span>
                        </div>
                      </li>

                      <li>
                        <em className="contact-icon fas fa-envelope"></em>
                        <div className="contact-text">
                          <span><a href="mailto: lootlaughmem@gmail.com">lootlaughmem@gmail.com</a></span>
                        </div>
                      </li>

                      <li>
                        <em className="contact-icon fab fa-telegram-plane"></em>
                        <div className="contact-text">
                          <span><a href="https://t.me/lootlaugh">View In Telegram</a></span>
                        </div>
                      </li>
                    </ul>

                    <form onSubmit={handleSubmit}>
                      <input
                        type="email"
                        className="footer-email"
                        placeholder="info@gmail.com"
                        required
                      />
                      <button type="submit">
                        <i className="fas fa-paper-plane"></i>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="footer-bottom">
            <div className="row">
              <div className="col-lg-12">
                <div className="copyright-text text-center">
                  <p>
                    Copyright © 2026 <a href="/">LootLaugh</a> All rights
                    reserved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
