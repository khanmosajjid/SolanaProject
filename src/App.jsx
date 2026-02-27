import React, { useEffect, useState } from "react";
import Header from "./components/common/Header";
import Hero from "./components/main/Hero";
import Contribution from "./components/main/Contribution";
import BuyToken from "./components/main/BuyToken";
import About from "./components/main/About";
import Brand from "./components/main/Brand";
import Features from "./components/main/Features";
import TokenChart from "./components/main/TokenChart";
import Roadmap from "./components/main/Roadmap";
import Faq from "./components/main/Faq";
import Footer from "./components/common/Footer";
import ScrollToTop from "./components/main/ScrollToTop";

import { Toaster } from "react-hot-toast";
import { useLocation } from "react-router-dom";
// import Preloader from "./components/common/Preloader";

const App = () => {

  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   window.addEventListener("load", () => {
  //     setTimeout(() => {
  //       setLoading(false);
  //     }, 0);
  //   });
  // }, []);

   const location = useLocation();

  useEffect(() => {
    if (location.hash === "#buyToken") {
      const section = document.getElementById("buyToken");
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  return (
    <>
      {/* {loading && <Preloader />} */}
      <Toaster position="top-center" />
      <Header />
      <main>
        <Hero />
        <BuyToken />
        <Contribution />
        <Brand />
        <About />
        <Features />
        <TokenChart />
        <Roadmap />
        <Faq />
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
};

export default App;
