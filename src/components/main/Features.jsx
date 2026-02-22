import React from "react";

import mobilePay from "../../assets/img/images/mobile-pay-dog.png";
import lifetime from "../../assets/img/images/lifetime.png";
import security from "../../assets/img/images/security.png";
import privacy from "../../assets/img/images/privacy.png";

const Features = () => {
  const featuresData = [
    {
      title: "Mobile Payment Make Easy",
      desc: "Add new, trending and rare artwork to your collection.",
      img: mobilePay,
      width: 140,
    },
    {
      title: "Lifetime Free Transaction",
      desc: "Add new, trending and rare artwork to your collection.",
      img: lifetime,
      width: 140,
    },
    {
      title: (
        <>
          Protect the <br /> Identity
        </>
      ),
      desc: "Add new, trending and rare artwork to your collection.",
      img: security,
      width: 140,
    },
    {
      title: "Security & Control Over Money",
      desc: "Add new, trending and rare artwork to your collection.",
      img: privacy,
      width: 100,
    },
  ];

  return (
    <section id="feature" className="features-area pt-140 pb-110">
      <div className="container">
        
        {/* Section Title */}
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="section-title text-center mb-70">
              <h2 className="title">
                Revolutionary Crypto Platform with Exclusive Rewards Program
              </h2>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="row">
          {featuresData.map((item, index) => (
            <div className="col-lg-6" key={index}>
              <div className="features-item d-flex justify-content-between align-items-center">
                
                <div className="features-content py-3">
                  <h2 className="title">
                    <a href="#!">{item.title}</a>
                  </h2>
                  <p>{item.desc}</p>
                </div>

                <div className="features-img">
                  <img
                    src={item.img}
                    alt="feature"
                    width={item.width}
                    className="img-fluid"
                  />
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Features;
