import React, { useState } from "react";

const Faq = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqData = [
    {
      question: "What is solana blockchain network.",
      answer: (
        <>
          The Solana blockchain network is a high-performance,
          decentralized blockchain platform designed to support fast,
          low-cost, and scalable applications, especially in crypto,
          DeFi, NFTs, and Web3.
          <br />
          Very fast transactions: Can process thousands of
          transactions per second
          <br />
          Low fees: Transactions usually cost a fraction of a cent
        </>
      ),
    },
    {
      question: "What is Loot Laugh (LOL)?",
      answer:
        "Loot Laugh is a meme-based crypto token designed for fun, community engagement, and viral growth. The name represents the idea of earning profits (“loot”) and celebrating success with laughter (“laugh”). It symbolizes the joy of early participation, strong community vibes, and light-hearted gains in the crypto space.",
    },
    {
      question: "What is your Payment Method for Buying?",
      answer: (
        <>
          Payment method for buying refers to the specific way a buyer
          pays money to purchase a product, service, or digital asset.
          <br />
          When someone wants to buy something, the payment method is
          the tool or system used to complete the transaction. Different
          platforms support different methods depending on security,
          speed, and location.
        </>
      ),
    },
  ];

  return (
    <section className="faq-area" id="faq">
      <div className="container">
        <div className="faq-inner-wrap">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-title text-center mb-70">
                <h2 className="title">Ask Quick Question</h2>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              <div className="faq-wrap">
                <div className="accordion">

                  {faqData.map((item, index) => (
                    <div
                      key={index}
                      className={`accordion-item ${
                        activeIndex === index ? "active" : ""
                      }`}
                    >
                      <h2 className="accordion-header">
                        <button
                          className={`accordion-button ${
                            activeIndex !== index ? "collapsed" : ""
                          }`}
                          type="button"
                          onClick={() => toggleAccordion(index)}
                        >
                          {item.question}
                        </button>
                      </h2>

                      {activeIndex === index && (
                        <div className="accordion-collapse collapse show">
                          <div className="accordion-body">
                            <p>{item.answer}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Faq;
