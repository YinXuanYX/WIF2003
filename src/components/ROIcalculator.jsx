import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

import bgImage from "/src/assets/background.webp";
import costImage from "/src/assets/cost.png";
import revenueImage from "/src/assets/revenue.png";
import yearsImage from "/src/assets/year.png";
import roiImage from "/src/assets/roi_formula.png";
import annualImage from "/src/assets/annual_roi_formula.png";
import profitLossImage from "/src/assets/profit_loss.png";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Calculator component for each investment option
function Calculator({
  title,
  setTotalRoi,
  setAnnualRoi,
  isBestTotal,
  isBestAnnual,
}) {
  // State for user inputs
  const [investmentInput, setInvestmentInput] = useState("");
  const [revenueInput, setRevenueInput] = useState("");
  const [yearsInput, setYearsInput] = useState("");

  //string to number conversion and calculations
  const investment = Number(investmentInput);
  const revenue = Number(revenueInput);
  const years = Number(yearsInput);

  const profit = revenue - investment;

  // Input validation flags
  const hasInput = investment > 0 || revenue > 0;
  const hasYearsInput = years > 0;
  const isCostInvalid = investmentInput !== "" && investment <= 0;
  const isRevenueInvalid = revenueInput !== "" && revenue <= 0;
  const isYearsInvalid = yearsInput !== "" && years <= 0;

  //ROI calculation
  const roi = investment > 0 ? (profit / investment) * 100 : 0;
  //Annual ROI calculation
  const annualRoi =
    investment > 0 && years > 0 && revenue > 0
      ? (Math.pow(revenue / investment, 1 / years) - 1) * 100
      : 0;

  // Update parent component with ROI values
  useEffect(() => {
    setTotalRoi(roi);
    setAnnualRoi(annualRoi);
  }, [roi, annualRoi, setTotalRoi, setAnnualRoi]);

  //Chart data preparation based on profit or loss
  let chartData;

  if (profit >= 0) {
    chartData = [
      { name: "Investment", value: investment },
      { name: "Profit", value: profit },
    ];
  } else {
    chartData = [
      { name: "Remaining", value: revenue },
      { name: "Loss", value: Math.abs(profit) },
    ];
  }

  let chartColors;

  if (profit >= 0) {
    chartColors = ["#2e65d4", "#198754"];
  } else {
    chartColors = ["#0d6efd", "#dc3545"];
  }

  // Control user input to prevent leading zeros and invalid characters
  const normalizeNumberInput = (value) =>
    value.length > 1 && value.startsWith("0")
      ? value.replace(/^0+/, "")
      : value;

  const preventInvalidNumberKeys = (e) => {
    if (["-", "+", "e", "E"].includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className="card shadow p-4 h-100">
      <h4 className="mb-3">{title}</h4>

      {/* Investment Cost Input */}
      <div className="mb-3">
        <label className="form-label d-flex align-items-center gap-2 ms-2">
          <img src={costImage} alt="icon" style={{ width: "24px" }} />
          Investment Cost (RM)
        </label>{" "}
        <input
          type="number"
          min="0"
          className="form-control"
          value={investmentInput}
          onChange={(e) => {
            let value = e.target.value;
            value = normalizeNumberInput(value);
            setInvestmentInput(value);
          }}
          onKeyDown={preventInvalidNumberKeys}
          placeholder="Enter investment cost"
        />
        {isCostInvalid && (
          <div className="text-danger mt-1">Please enter a positive number</div>
        )}
      </div>

      {/* Revenue Input */}
      <div className="mb-3">
        <label className="form-label d-flex align-items-center gap-2 ms-2">
          <img src={revenueImage} alt="icon" style={{ width: "24px" }} />
          Revenue / Return (RM)
        </label>
        <input
          type="number"
          min="0"
          className="form-control"
          value={revenueInput}
          onChange={(e) => {
            let value = e.target.value;
            value = normalizeNumberInput(value);
            setRevenueInput(value);
          }}
          onKeyDown={preventInvalidNumberKeys}
          placeholder="Enter total return"
        />
        {isRevenueInvalid && (
          <div className="text-danger mt-1">Please enter a positive number</div>
        )}
      </div>

      {/* Investment Years Input */}
      <div className="mb-3">
        <label className="form-label d-flex align-items-center gap-2 ms-2">
          <img src={yearsImage} alt="icon" style={{ width: "24px" }} />
          Investment Years
        </label>
        <input
          type="number"
          min="1"
          className="form-control"
          value={yearsInput}
          onChange={(e) => {
            let value = e.target.value;
            value = normalizeNumberInput(value);
            setYearsInput(value);
          }}
          onKeyDown={preventInvalidNumberKeys}
          placeholder="Enter number of years"
        />
        {isYearsInvalid && (
          <div className="text-danger mt-1">
            Please enter a value greater than 0
          </div>
        )}
      </div>

      {/* Result Display */}
      <div className="bg-light p-3 rounded mt-3">
        <div>
          <h5 className="mb-3 text-decoration-underline">Result</h5>

          <div className="d-flex align-items-center gap-2 mb-3">
            <img
              src={profitLossImage}
              alt="Profit/Loss"
              style={{ width: "32px" }}
            />

            <p className="mb-0 fs-4">Profit / Loss: RM {profit.toFixed(2)}</p>
          </div>
          <p className="mb-3">
            Total ROI: {roi.toFixed(2)}%
            {/* Show badge for best total ROI */}
            {isBestTotal && hasInput && (
              <span className="badge bg-success ms-2">Best Total ROI</span>
            )}
          </p>

          <p className="mb-3">
            Annual ROI: {years > 0 ? annualRoi.toFixed(2) : "0.00"}%
            {/* Show badge for best annual ROI */}
            {isBestAnnual && hasYearsInput && (
              <span className="badge bg-primary ms-2">Best Annual ROI</span>
            )}
          </p>
        </div>
        <div>
          <div className="d-flex align-items-center justify-content-center">
            <div
              style={{
                width: "100%",
                height: "220px",
                minWidth: 0,
                minHeight: 0,
              }}
            >
              {/* Pie Chart */}
              {hasInput ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={30}
                      outerRadius={60}
                      paddingAngle={1}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {chartData.map((item, index) => (
                        <Cell key={index} fill={chartColors[index]} />
                      ))}
                    </Pie>

                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-muted py-5">
                  Enter investment and revenue to display the chart.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Parent component to hold both calculators and comparison logic-------------------------------------------------------------------------------------
function App() {
  const [roiA, setRoiA] = useState(0);
  const [roiB, setRoiB] = useState(0);

  const [annualA, setAnnualA] = useState(0);
  const [annualB, setAnnualB] = useState(0);

  return (
    <div
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >
      <div className="container py-3">
        <h2 className="text-center mb-4">
          ROI Calculator with Investment Comparison
        </h2>

        <div className="row g-4">
          {/* Option A */}
          <div className="col-md-6">
            <Calculator
              title="Option A"
              setTotalRoi={setRoiA}
              setAnnualRoi={setAnnualA}
              isBestTotal={roiA > roiB}
              isBestAnnual={annualA > annualB}
            />
          </div>

          {/* Option B */}
          <div className="col-md-6">
            <Calculator
              title="Option B"
              setTotalRoi={setRoiB}
              setAnnualRoi={setAnnualB}
              isBestTotal={roiB > roiA}
              isBestAnnual={annualB > annualA}
            />
          </div>
        </div>

        {/* Informational Alert */}
        <div className="alert alert-info mt-3">
          <strong>Note:</strong> A higher <strong>Total ROI</strong> means you
          will earn more profit overall. A higher <strong>Annual ROI</strong>{" "}
          means you will earn returns faster each year. Choose based on your
          investment goal.
        </div>

        {/* Informational Cards, formula images */}
        <div className="row g-4 mb-4 ">
          {/* Card 1 */}
          <div className="col-md-3">
            <div
              className="card shadow p-4 h-100"
              style={{ backgroundColor: "#ececec" }}
            >
              <h5>What is ROI?</h5>
              <p>
                Return on Investment (ROI) measures how much profit is earned
                compared to the investment cost.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="col-md-4">
            <div
              className="card shadow p-4 h-100"
              style={{ backgroundColor: "#ececec" }}
            >
              <h5>ROI Formula:</h5>
              <div>
                <img src={roiImage} alt="ROI Formula" className="img-fluid" />
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="col-md-5">
            <div
              className="card shadow p-4 h-100"
              style={{ backgroundColor: "#ececec" }}
            >
              <h5>Annual ROI Formula:</h5>
              <div>
                <img
                  src={annualImage}
                  alt="Annual ROI Formula"
                  className="img-fluid"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
