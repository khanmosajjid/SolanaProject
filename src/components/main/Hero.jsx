import React, { useEffect, useState } from "react";
import bannerBg from "../../assets/img/banner/banner_bg.png";
import dog1 from "../../assets/img/images/dog-4.png";
import dog2 from "../../assets/img/images/dog-2.png";

const Hero = () => {
    // 🔥 Set your presale end date here
    const now = new Date();

    // 🔥 Add 3 Months (same like your jQuery logic)
    const futureDate = new Date(
        now.getFullYear(),
        now.getMonth() + 3,
        now.getDate(),
        now.getHours(),
        now.getMinutes(),
        now.getSeconds()
    ).getTime();

    const calculateTimeLeft = () => {
        const difference = futureDate - new Date().getTime();

        if (difference <= 0) {
            return { days: "00", hours: "00", minutes: "00", seconds: "00" };
        }

        const days = String(
            Math.floor(difference / (1000 * 60 * 60 * 24))
        ).padStart(2, "0");

        const hours = String(
            Math.floor((difference / (1000 * 60 * 60)) % 24)
        ).padStart(2, "0");

        const minutes = String(
            Math.floor((difference / 1000 / 60) % 60)
        ).padStart(2, "0");

        const seconds = String(
            Math.floor((difference / 1000) % 60)
        ).padStart(2, "0");

        return { days, hours, minutes, seconds };
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <section
            className="banner-area banner-bg"
            style={{ backgroundImage: `url(${bannerBg})` }}
        >
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        <div className="banner-content text-center">
                            <h2 className="title">
                                Discover the Next Big Opportunity: <br />
                                <span>Our Loot Laugh is presale token Live</span>
                            </h2>
                            <p>
                                A solana smart blockchain based marketplace for trading digital
                                <br />
                                goods & assets according.
                            </p>

                            {/* 🔥 Countdown */}
                            <div className="banner-countdown-wrap">
                                <div className="coming-time">
                                    <div className="time-count day">
                                        <span>{timeLeft.days}</span> Days
                                    </div>

                                    <div className="time-count hour">
                                        <span>{timeLeft.hours}</span> Hours
                                    </div>

                                    <div className="time-count min">
                                        <span>{timeLeft.minutes}</span> Minutes
                                    </div>

                                    <div className="time-count sec">
                                        <span className="bounc-sec">{timeLeft.seconds}</span> Seconds
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Down */}
            <div className="banner-scroll-down">
                <a href="#contribution">
                    <span></span>
                    <span></span>
                    <span></span>
                </a>
            </div>

            {/* Shapes */}
            <div className="banner-shape-wrap">
                <img src={dog1} alt="dog" className="leftToRight" />
                <img src={dog2} alt="dog" className="alltuchtopdown" />
            </div>
        </section>
    );
};

export default Hero;
