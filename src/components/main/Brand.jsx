import React from "react";

import metamask from "../../assets/img/brand/metamask-2.png";
import binance from "../../assets/img/brand/Binance.png";
import trustwallet from "../../assets/img/brand/trust-wallet.png";
import probit from "../../assets/img/brand/probit.png";
import tokenpocket from "../../assets/img/brand/tokenpocket.png";

const Brand = () => {
  const partners = [
    { img: metamask, alt: "Metamask" },
    { img: binance, alt: "Binance" },
    { img: trustwallet, alt: "Trust Wallet" },
    { img: probit, alt: "Probit" },
    { img: tokenpocket, alt: "TokenPocket" },
  ];

  return (
    <div className="brand-area">
      <div className="container-fluid p-0">
        
        <div className="row g-0">
          <div className="col-lg-12">
            <div className="brand-title text-center">
              <h6 className="title">Our Top Partner</h6>
            </div>
          </div>
        </div>

        <div className="brand-item-wrap">
          <div className="row g-3 justify-content-center brand-active">
            {partners.map((partner, index) => (
              <div className="col-lg-2" key={index}>
                <div className="brand-item text-center">
                  <img
                    src={partner.img}
                    width={150}
                    alt={partner.alt}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Brand;
