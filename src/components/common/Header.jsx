import React, { useState, useEffect } from "react";
import logo from "../../assets/img/logo/logo-1.png";
import { BaseWalletMultiButton } from "@solana/wallet-adapter-react-ui";

const WALLET_BUTTON_LABELS = {
  "change-wallet": "Change Wallet",
  connecting: "Connecting ...",
  "copy-address": "Copy address",
  copied: "Copied",
  disconnect: "Disconnect",
  "has-wallet": "Connect",
  "no-wallet": "Connect Wallet",
};

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  const toggleMobile = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY >= 245) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.classList.add("mobile-menu-visible");
    } else {
      document.body.classList.remove("mobile-menu-visible");
    }

    return () => {
      document.body.classList.remove("mobile-menu-visible");
    };
  }, [mobileOpen]);

  return (
    <header id="header">
      <div
        id="sticky-header"
        className={`menu-area transparent-header ${isSticky ? "sticky-menu" : ""}`}
      >
        <div className="container custom-container">
          <div className="row">
            <div className="col-12">
              <div className="menu-wrap">
                <nav className="menu-nav">
                  {/* Logo */}
                  <div className="logo">
                    <a href="/">
                      <img src={logo} alt="Logo" />
                    </a>
                  </div>

                  {/* Desktop Menu */}
                  <div className="navbar-wrap main-menu d-none d-lg-flex">
                    <ul className="navigation">
                      <li className="active">
                        <a href="#header">Home</a>
                      </li>
                      <li>
                        <a href="#about">About</a>
                      </li>
                      <li>
                        <a href="#buy-token">Buy Token</a>
                      </li>
                      <li>
                        <a href="#chart">Platform</a>
                      </li>
                      <li>
                        <a href="#roadMap">Roadmap</a>
                      </li>
                      <li>
                        <a href="#faq">Faq's</a>
                      </li>
                    </ul>
                  </div>

                  {/* Header Action */}
                  <div className="header-action">
                    <ul className="list-wrap">
                      <li className="header-login">
                        {/* <button className="btn-connect">
                          <i className="fas fa-wallet"></i> Connect Wallet
                        </button> */}
                      </li>
                    </ul>
                  </div>

                  {/* Mobile Toggle */}
                  <div className="toggle-bar d-flex gap-3">
                    <div className="wallet-btn-box">
                      <div>
                        <BaseWalletMultiButton labels={WALLET_BUTTON_LABELS} />
                      </div>
                    </div>
                    <div className="navbar-btn">
                      {" "}
                      <div
                        className="mobile-nav-toggler"
                        onClick={toggleMobile}
                      >
                        <i className="fas fa-bars"></i>
                      </div>
                    </div>
                  </div>
                </nav>
              </div>

              {/* ---------------- Mobile Menu ---------------- */}
              <div className={`mobile-menu ${mobileOpen ? "active" : ""}`}>
                <nav className="menu-box">
                  <div className="close-btn" onClick={toggleMobile}>
                    <i className="fas fa-times"></i>
                  </div>

                  <div className="nav-logo">
                    <a href="/">
                      <img src={logo} alt="Logo" />
                    </a>
                  </div>

                  <ul className="navigation">
                    <li>
                      <a href="#header">Home</a>
                    </li>
                    <li>
                      <a href="#about">About</a>
                    </li>
                    <li>
                      <a href="#buyToken">Buy Token</a>
                    </li>
                    <li>
                      <a href="#chart">Platform</a>
                    </li>
                    <li>
                      <a href="#roadMap">Roadmap</a>
                    </li>
                    <li>
                      <a href="#faq">Faq's</a>
                    </li>
                  </ul>

                  <div className="social-links">
                    <ul className="clearfix list-wrap">
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
                </nav>
              </div>

              {mobileOpen && (
                <div className="menu-backdrop" onClick={toggleMobile}></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
