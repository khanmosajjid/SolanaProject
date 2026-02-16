import React, { useState, useEffect } from "react";
import shape1 from "../../assets/img/images/contribution_shape01.png";
import shape2 from "../../assets/img/images/contribution_shape02.png";

const Contribution = () => {
  // 🔥 Change this value to control progress
  const [progress, setProgress] = useState(83);

  // Optional: Animate progress on load
  useEffect(() => {
    let start = 0;
    const interval = setInterval(() => {
      start += 1;
      if (start >= 83) {
        clearInterval(interval);
      }
      setProgress(start);
    }, 15);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="contribution" className="contribution-area pt-130 pb-130">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">

            <div className="contribution-title">
              <h2 className="title">
                <span>LOL {progress}%</span>, Total Sale Loot Laugh Token
              </h2>
            </div>

            <div className="progress-wrap">

              <ul className="list-wrap">
                <li>Pre-Sale</li>
                <li>Soft Cap</li>
                <li>Bonus</li>
              </ul>

              <div
                className="progress"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin="0"
                aria-valuemax="100"
              >
                <div
                  className="progress-bar"
                  style={{ width: `${progress}%`, transition: "width 0.4s ease" }}
                ></div>
              </div>

              <h6 className="progress-title">
                Min - $1 <span>Max - Unlimited</span>
              </h6>

            </div>
          </div>
        </div>
      </div>

      {/* Shapes */}
      <div className="contribution-shape-wrap">
        <img src={shape1} alt="shape" className="alltuchtopdown" />
        <img src={shape2} alt="shape" className="leftToRight" />
      </div>
    </section>
  );
};

export default Contribution;
