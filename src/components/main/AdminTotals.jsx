import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_LEDGER_API_URL || "http://localhost:8787";
const USDT_DECIMALS = 6;
const TOKEN_DECIMALS = 6;

function formatUnits(raw, decimals) {
  const value = Number(raw || "0") / 10 ** decimals;
  if (!Number.isFinite(value)) {
    return "0";
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

export default function AdminTotals() {
  const [state, setState] = useState({
    loading: false,
    error: "",
    totals: null,
    history: [],
    updatedAt: "",
  });

  const load = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: "" }));
      const response = await fetch(`${API_BASE}/ledger`, { method: "GET" });
      if (!response.ok) {
        throw new Error(`Ledger API error: ${response.status}`);
      }

      const payload = await response.json();
      setState({
        loading: false,
        error: "",
        totals: payload.totals || null,
        history: payload.history || [],
        updatedAt: payload.updatedAt || "",
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || "Failed to load ledger",
      }));
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="pb-110">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="section-title text-center mb-40">
              <h2 className="title">Admin Totals</h2>
              <p>Live data from local sales ledger API</p>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12">
            <div className="status-card">
              {state.error ? (
                <div className="error-text">{state.error}</div>
              ) : null}
              <div>
                <b>API:</b> <span>{API_BASE}/ledger</span>
              </div>
              <div>
                <b>Orders:</b> <span>{state.totals?.orders ?? 0}</span>
              </div>
              <div>
                <b>Total USDT:</b>{" "}
                <span>{formatUnits(state.totals?.usdtRaw, USDT_DECIMALS)}</span>
              </div>
              <div>
                <b>Total Token Sent:</b>{" "}
                <span>
                  {formatUnits(state.totals?.projectTokenRaw, TOKEN_DECIMALS)}
                </span>
              </div>
              <div>
                <b>Total Buyer Share (95%):</b>{" "}
                <span>
                  {formatUnits(state.totals?.buyerTokenRaw, TOKEN_DECIMALS)}
                </span>
              </div>
              <div>
                <b>Total Referral Share (5%):</b>{" "}
                <span>
                  {formatUnits(state.totals?.sellerTokenRaw, TOKEN_DECIMALS)}
                </span>
              </div>
              <div>
                <b>Last Update:</b>{" "}
                <span>
                  {state.updatedAt
                    ? new Date(state.updatedAt).toLocaleString()
                    : "-"}
                </span>
              </div>

              <div className="text-start mt-4">
                <button
                  className="refresh-btn-pro"
                  onClick={load}
                  disabled={state.loading}
                >
                  {state.loading ? "Refreshing..." : "Refresh Totals"}
                </button>
              </div>

              <div className="mt-4">
                <h5>Recent Sales</h5>
                {state.history.length === 0 ? (
                  <p>No sales yet</p>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table className="table table-dark table-striped">
                      <thead>
                        <tr>
                          <th>Time</th>
                          <th>Buyer</th>
                          <th>Referral</th>
                          <th>USDT</th>
                          <th>Buyer Token</th>
                          <th>Referral Token</th>
                        </tr>
                      </thead>
                      <tbody>
                        {state.history.slice(0, 10).map((entry) => (
                          <tr key={entry.signature}>
                            <td>{new Date(entry.at).toLocaleString()}</td>
                            <td>
                              {entry.buyerWallet?.slice(0, 6)}...
                              {entry.buyerWallet?.slice(-6)}
                            </td>
                            <td>
                              {entry.referralWallet?.slice(0, 6)}...
                              {entry.referralWallet?.slice(-6)}
                            </td>
                            <td>{formatUnits(entry.usdtRaw, USDT_DECIMALS)}</td>
                            <td>
                              {formatUnits(
                                entry.buyerProjectRaw,
                                TOKEN_DECIMALS,
                              )}
                            </td>
                            <td>
                              {formatUnits(
                                entry.sellerProjectRaw,
                                TOKEN_DECIMALS,
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
