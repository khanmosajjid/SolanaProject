import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";

const Roadmap = () => {

  const roadmapData = [
    {
      quarter: "Q1 2026",
      title: "Launch",
      desc: " The Royal Network coin is an innovative decentralize network marketing project that aims to disrupt the traditional way.",
    },
    {
      quarter: "Q2 2026",
      title: "Presale",
      desc: "It is usually offered to a limited group of people at a lower price or with special benefits as an incentive for early participation.",
    },
    {
      quarter: "Q2 2026",
      title: "DEX",
      desc: "A DEX (Decentralized Exchange) is a type of cryptocurrency exchange that allows people to trade digital assets directly.",
    },
    {
      quarter: "Q3 2026",
      title: "Growth",
      desc: "It can refer to progress in size, value, number, strength, skill, or success, depending on the contex. Increase in  revenue, customers, market share.",
    },
    {
      quarter: "Q3 2026",
      title: "CEX",
      desc: "In a CEX, users deposit their funds into the exchange, and the platform handles trading, security, and order matchin on their behalf.",
    },
    {
      quarter: "Q3 2026",
      title: "Expansion",
      desc: " Expansion means the process of growing, spreading, or increasing in size, scope, or influence. Opening new branches, entering new markets.",
    },
  ];
  return (
    <section id="roadMap" className="roadmap-area pt-140">
      <div className="container-fluid p-0">

        {/* Section Title */}
        <div className="row g-0">
          <div className="col-lg-12">
            <div className="section-title text-center mb-70">
              <h2 className="title">Our Roadmap</h2>
            </div>
          </div>
        </div>

        {/* Swiper Slider */}
        <Swiper
          modules={[Autoplay]}
          loop={true}
          spaceBetween={15}
          slidesPerView={4}
          speed={1500}
          autoplay={{ delay: 2500, pauseOnMouseEnter: true, disableOnInteraction: false }}
          className="roadMap-active"
          breakpoints={{
            280: { slidesPerView: 1 },
            386: { slidesPerView: 1 },
            576: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            992: { slidesPerView: 3 },
            1200: { slidesPerView: 4 },
            1400: { slidesPerView: 4 },
          }}
        >
          {roadmapData.map((item, index) => (
            <SwiperSlide key={index}>
              <div>
                <div className="roadmap-item">
                  <span className="roadmap-title">{item.quarter}</span>
                  <div className="roadmap-content">
                    <h4 className="title">
                      <span className="dot"></span>
                      {item.title}
                    </h4>
                    <p>{item.desc}</p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

      </div>
    </section>
  );
};

export default Roadmap;