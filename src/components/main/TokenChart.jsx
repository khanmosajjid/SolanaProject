import React from "react";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import logo from "../../assets/img/logo/logo-1.png";

ChartJS.register(ArcElement, Tooltip, Legend);

const TokenChart = () => {
    const data = {
        labels: [
            "Presale",
            "Liquidity",
            "Referral",
            "Marketing",
            "Team",
            "CEX",
        ],
        datasets: [
            {
                data: [30, 40, 5, 10, 5, 10],
                backgroundColor: [
                    "#faac1a",
                    "#ffe102",
                    "#f8ca0a",
                    "#db8e1e",
                    "#ffb402",
                    "#b28604",
                ],
                borderWidth: 0,
            },
        ],
    };

    const options = {
        responsive: true,
        cutout: "53%",
        plugins: {
            legend: {
                display: false,
            },
        },
    };

    return (
        <div id="chart" className="chart-area pt-70">
            <div className="container">
                <div className="chart-inner-wrap">
                    <div className="row align-items-center">

                        {/* LEFT SIDE */}
                        <div className="col-lg-6">
                            <div className="chart-wrap">
                                <div className="chart">
                                    <Doughnut data={data} options={options} />
                                </div>

                                <div className="chart-tab text-start">
                                    <ul className="nav nav-tabs" id="myTab" role="tablist">
                                        <li className="nav-item" role="presentation">
                                            <button
                                                className="nav-link active"
                                                id="funding-tab"
                                                data-bs-toggle="tab"
                                                data-bs-target="#funding-tab-pane"
                                                type="button"
                                                role="tab"
                                                aria-controls="funding-tab-pane"
                                                aria-selected="true"
                                            >
                                                Token Distribution
                                            </button>
                                        </li>

                                    </ul>
                                    <div className="tab-content" id="myTabContent">
                                        <div
                                            className="tab-pane fade show active"
                                            id="funding-tab-pane"
                                            role="tabpanel"
                                            aria-labelledby="funding-tab"
                                            tabindex="0"
                                        >
                                            <div className="chart-list">
                                                <ul className="list-wrap">
                                                    <li>Presale: 30%</li>
                                                    <li>Liquidity : 40%</li>
                                                    <li>Referral: 5%</li>
                                                    <li>Marketing: 10%</li>
                                                    <li>Team: 5%</li>
                                                    <li>CEX: 10%</li>
                                                </ul>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT SIDE */}
                        <div className="col-lg-6">
                            <div className="right-side-content ">
                                <img
                                    src={logo}
                                    className="img-fluid mb-3"
                                    alt="Logo"
                                />
                                <p>
                                    Loot Laugh is a decentralized, open-source <br />
                                    blockchain with smart contract
                                </p>
                                <ul className="list-wrap list-unstyled">
                                    <li><span>1</span> Symbol: LOL</li>
                                    <li><span>2</span> Blockchain: Solana</li>
                                    <li><span>3</span> Supply: 1B</li>
                                </ul>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default TokenChart;
