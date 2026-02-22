import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


const Roadmap = () => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 1000,
    centerMode: true,
    centerPadding: "260px",
    autoplay: true,
    arrows: false,
    slidesToShow: 2,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 3,
          centerPadding: "100px",
        },
      },
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          centerPadding: "40px",
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
          centerMode: false,
        },
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 2,
          centerMode: false,
        },
      },
      {
        breakpoint: 575,
        settings: {
          slidesToShow: 1,
          centerMode: false,
        },
      },
    ],
  };

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

        {/* Slider */}
        <Slider {...settings} className="roadMap-active">
          {roadmapData.map((item, index) => (
            <div key={index}>
              <div className="roadmap-item mx-3">
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
          ))}
        </Slider>

      </div>
    </section>
  );
};

export default Roadmap;
