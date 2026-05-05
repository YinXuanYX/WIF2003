import React, { useMemo, useState } from "react";
import "./InvestmentStrategy.css";

const QUESTIONS = [
  {
    id: "q1",
    title: "Your investment time horizon",
    options: [
      { label: "Less than 1 year", value: 0 },
      { label: "1 to 2 years", value: 1 },
      { label: "3 to 5 years", value: 2 },
      { label: "6 to 10 years", value: 3 },
      { label: "11 to 15 years", value: 4 },
      { label: "More than 15 years", value: 5 },
    ],
  },
  {
    id: "q2",
    title: "Comfort with short-term volatility",
    options: [
      { label: "I avoid it completely", value: 0 },
      { label: "I prefer very stable returns", value: 1 },
      { label: "I can accept small swings", value: 2 },
      { label: "I can handle moderate swings", value: 3 },
      { label: "I can handle high swings", value: 4 },
      { label: "I am comfortable with large swings", value: 5 },
    ],
  },
  {
    id: "q3",
    title: "Primary goal for this investment",
    options: [
      { label: "Capital protection", value: 0 },
      { label: "Stable income", value: 1 },
      { label: "Balanced growth", value: 2 },
      { label: "Growth with some risk", value: 3 },
      { label: "High growth", value: 4 },
      { label: "Maximum growth potential", value: 5 },
    ],
  },
  {
    id: "q4",
    title: "Reaction to a 15% portfolio drop",
    options: [
      { label: "Sell immediately", value: 0 },
      { label: "Reduce risk quickly", value: 1 },
      { label: "Hold and wait", value: 2 },
      { label: "Buy a little more", value: 3 },
      { label: "Buy more confidently", value: 4 },
      { label: "Invest aggressively", value: 5 },
    ],
  },
  {
    id: "q5",
    title: "Experience with investing",
    options: [
      { label: "None", value: 0 },
      { label: "Basic savings products", value: 1 },
      { label: "Some mutual funds", value: 2 },
      { label: "Regular portfolio reviews", value: 3 },
      { label: "Active investor", value: 4 },
      { label: "Advanced investor", value: 5 },
    ],
  },
  {
    id: "q6",
    title: "How stable is your income?",
    options: [
      { label: "Unstable or uncertain", value: 0 },
      { label: "Somewhat unstable", value: 1 },
      { label: "Mixed stability", value: 2 },
      { label: "Mostly stable", value: 3 },
      { label: "Stable", value: 4 },
      { label: "Very stable", value: 5 },
    ],
  },
];

const ALLOCATIONS = {
  Conservative: { bonds: 60, equities: 20, cash: 20 },
  Moderate: { bonds: 40, equities: 50, cash: 10 },
  Aggressive: { bonds: 10, equities: 80, cash: 10 },
};

const getProfile = (score) => {
  if (score <= 10) return "Conservative";
  if (score <= 20) return "Moderate";
  return "Aggressive";
};

export default function InvestmentStrategy() {
  const [answers, setAnswers] = useState({});
  const [riskProfile, setRiskProfile] = useState(null);

  const answeredCount = useMemo(
    () => Object.keys(answers).length,
    [answers]
  );

  const totalScore = useMemo(
    () => Object.values(answers).reduce((sum, value) => sum + value, 0),
    [answers]
  );

  const isComplete = answeredCount === QUESTIONS.length;

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!isComplete) return;

    const profile = getProfile(totalScore);
    setRiskProfile({
      profile,
      score: totalScore,
      allocation: ALLOCATIONS[profile],
    });
  };

  const handleReset = () => {
    setAnswers({});
    setRiskProfile(null);
  };

  return (
    <div className="strategy-page">
      <div className="container py-5">
        <div className="strategy-hero shadow-sm">
          <div>
            <span className="strategy-badge">Module 4</span>
            <h1 className="strategy-title">Investment Strategy</h1>
            <p className="strategy-subtitle">
              Complete the 6-question assessment to unlock a tailored asset
              allocation. This is a front-end prototype only.
            </p>
          </div>
          <div className="strategy-scorecard">
            <div className="strategy-score">
              <span>Answered</span>
              <strong>
                {answeredCount}/{QUESTIONS.length}
              </strong>
            </div>
            <div className="strategy-meter">
              <span
                style={{
                  width: `${(answeredCount / QUESTIONS.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="row g-4 mt-3">
          <div className="col-12 col-lg-7">
            <form className="strategy-card" onSubmit={handleSubmit}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="mb-0">Risk Profile Questionnaire</h2>
                <span className="text-muted small">
                  Score: {totalScore}/30
                </span>
              </div>

              {QUESTIONS.map((question, index) => (
                <div key={question.id} className="strategy-question mb-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <p className="mb-2 fw-semibold">
                      {index + 1}. {question.title}
                    </p>
                    <span className="badge bg-light text-dark">
                      0-5 pts
                    </span>
                  </div>
                  <div>
                    {question.options.map((option) => (
                      <div className="form-check" key={option.label}>
                        <input
                          className="form-check-input"
                          type="radio"
                          name={question.id}
                          id={`${question.id}-${option.value}`}
                          checked={answers[question.id] === option.value}
                          onChange={() =>
                            handleAnswer(question.id, option.value)
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`${question.id}-${option.value}`}
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="d-flex flex-wrap gap-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!isComplete}
                >
                  Generate Risk Profile
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleReset}
                >
                  Reset
                </button>
                {!isComplete && (
                  <span className="text-muted small d-flex align-items-center">
                    Answer all questions to continue.
                  </span>
                )}
              </div>
            </form>
          </div>

          <div className="col-12 col-lg-5">
            {!riskProfile ? (
              <div className="strategy-card strategy-empty">
                <h2>Complete the assessment</h2>
                <p className="text-muted">
                  Once you finish, we will show your profile, score, and an
                  allocation breakdown.
                </p>
                <div className="strategy-band mt-3">
                  <div>
                    <span>0 - 10</span>
                    <strong>Conservative</strong>
                  </div>
                  <div>
                    <span>11 - 20</span>
                    <strong>Moderate</strong>
                  </div>
                  <div>
                    <span>21 - 30</span>
                    <strong>Aggressive</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="strategy-card">
                <div className="d-flex justify-content-between align-items-center">
                  <h2 className="mb-0">Your Risk Profile</h2>
                  <span className="badge bg-success">{riskProfile.profile}</span>
                </div>
                <p className="text-muted mt-2">
                  Total score: <strong>{riskProfile.score}</strong> out of 30
                </p>

                <div className="strategy-allocation">
                  <div>
                    <div className="d-flex justify-content-between">
                      <span>Bonds</span>
                      <strong>{riskProfile.allocation.bonds}%</strong>
                    </div>
                    <div className="progress">
                      <div
                        className="progress-bar bg-info"
                        role="progressbar"
                        style={{ width: `${riskProfile.allocation.bonds}%` }}
                        aria-valuenow={riskProfile.allocation.bonds}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="d-flex justify-content-between">
                      <span>Equities</span>
                      <strong>{riskProfile.allocation.equities}%</strong>
                    </div>
                    <div className="progress">
                      <div
                        className="progress-bar bg-primary"
                        role="progressbar"
                        style={{ width: `${riskProfile.allocation.equities}%` }}
                        aria-valuenow={riskProfile.allocation.equities}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="d-flex justify-content-between">
                      <span>Cash</span>
                      <strong>{riskProfile.allocation.cash}%</strong>
                    </div>
                    <div className="progress">
                      <div
                        className="progress-bar bg-warning"
                        role="progressbar"
                        style={{ width: `${riskProfile.allocation.cash}%` }}
                        aria-valuenow={riskProfile.allocation.cash}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      />
                    </div>
                  </div>
                </div>

                <div className="strategy-note">
                  Backend integration will replace this client-side scoring.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
