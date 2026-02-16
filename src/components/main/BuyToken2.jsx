import React, { useState, useRef } from "react";
import copySoundFile from "../../assets/img/sound/sound.mp3";

const BuyToken = () => {
  const exchangeRate = 0.001; // 1 USDT = 0.001 LOL
  const tokenAddress = "Oxe3c127466908c2ccdc43521c8315b87fd369d605";

  const [amount, setAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("USDT");
  const [copyText, setCopyText] = useState("Copy");
  const [showToast, setShowToast] = useState("");

  const audioRef = useRef(null);

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const calculatedValue = amount ? (amount * exchangeRate).toFixed(4) : 0;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(tokenAddress);

    // Play sound
    if (audioRef.current) {
      audioRef.current.play();
    }

    setCopyText("Copied");
    setShowToast("show");

    setTimeout(() => {
      setCopyText("Copy");
       setShowToast("");
    }, 2000);
  };

  return (
    <>
      <section id="buy-token" className="benefit pb-110">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="section-title text-center mb-70">
                <h2 className="title">Buy Token</h2>
              </div>
            </div>
          </div>

          <div className="row">
            {/* LEFT SIDE */}
            <div className="col-lg-6">
              <div className="col-md-12 mb-4 benefit-picss">
                <h3>Buy LOL Token</h3>
                <p>
                  Buy LOL tokens easily on the Solana network — fast, secure,
                  and low fees. Connect your wallet, choose how much you want to
                  buy or sell, and swap in seconds.
                </p>
              </div>

              <div className="col-md-12 mb-4 benefit-picss">
                <h3>Top Exchangers</h3>
                <p>
                We are preparing to list our token after pre -launch on a
                  top-tier exchange to ensure higher liquidity, better
                  accessibility, and a secure trading experience for our growing
                  community.
                </p>
              </div>

              <div className="col-md-12 mb-4 benefit-picss">
                <h3>Contract Address</h3>
                <p>Always make sure to use the official contract address when buying, selling, or listing the token. Copying the correct address helps avoid scams and fake tokens.</p>
              </div>
            </div>

            {/* RIGHT SIDE CARD */}
            <div className="col-lg-6 custom-flex">
              <div className="main-container">
                <div className="card-wrapper">
                  <div className="card-shadow"></div>

                  <div className="main-card">

                    
                    <div className="toggle-container">
                      <button className="toggle-btn active">
                        Buy Token
                      </button>
                    </div>

                    
                    <div className="mb-3">
                      <div className="custom-input-box">
                        <label className="text-light small d-block mb-2">
                          Spend
                        </label>

                        <div className="d-flex justify-content-between align-items-center">
                          <input
                            type="number"
                            value={amount}
                            onChange={handleAmountChange}
                            className="form-control border-0 text-light bg-transparent p-0 shadow-none input-text"
                            placeholder="Enter amount"
                          />

                          <select
                            className="bg-transparent text-light border-0 fw-bold"
                            value={selectedCurrency}
                            onChange={(e) =>
                              setSelectedCurrency(e.target.value)
                            }
                          >
                            <option value="USDT" className="text-dark">USDT</option>
                            <option value="SOL" className="text-dark">SOL</option>
                            <option value="EUR" className="text-dark">EUR</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="custom-input-box">
                        <label className="text-light small d-block mb-2">
                          You Get
                        </label>

                        <div className="d-flex justify-content-between align-items-center">
                          <input
                            type="text"
                            value={calculatedValue}
                            readOnly
                            className="form-control border-0 bg-transparent p-0 shadow-none input-text"
                          />

                          <select className="bg-transparent text-white fw-bold border-0">
                            <option className="text-dark">LOL</option>
                            <option className="text-dark">BTC</option>
                            <option className="text-dark">SOL</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <p className="rate-font text-white mb-4 fw-medium">
                      Exchange Rate 1 USDT = {exchangeRate} LOL
                    </p>

                    <div className="read-more-btn text-center">
                      <button className="buy-sell-btn">
                        Get Started
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            </div>


 


            {/* TOKEN COPY SECTION */}
            <div className="col-lg-8 m-auto d-flex align-items-center justify-content-center">
              <div className="token_copy_board">
                <span className="icon">
                  <i className="fa fa-link"></i>
                </span>

                <span className="code">
                  Token Contract Address:
                  <mark>{tokenAddress}</mark>
                </span>

                <audio ref={audioRef}>
                  <source src={copySoundFile} type="audio/mpeg" />
                </audio>

                <button
                  className="copy_btn"
                  type="button"
                  onClick={handleCopy}
                >
                  {copyText}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TOAST */}
        <div id="toast" className={`custom-toast ${showToast}`}>
          Copied to clipboard!
        </div>
    </>
  );
};

export default BuyToken;
