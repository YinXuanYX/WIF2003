import React, { useEffect, useMemo, useState } from "react";
import "./InvestmentStrategy.css";
import useInvestmentProfile from "../hooks/useInvestmentProfile";

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

const PROFILE_DETAILS = {
  Conservative: {
    title: "Capital preservation",
    summary:
      "You favor stability and lower volatility. This mix emphasizes bonds and cash to smooth returns.",
  },
  Moderate: {
    title: "Balanced growth",
    summary:
      "You accept moderate risk for long-term growth. The mix balances equities with stabilizing assets.",
  },
  Aggressive: {
    title: "Growth focused",
    summary:
      "You can tolerate higher volatility for higher upside. The mix leans toward equities for growth.",
  },
};

const PROFILE_COLORS = {
  Conservative: { bg: "rgba(6, 182, 212, 0.12)", color: "#06b6d4" },
  Moderate: { bg: "rgba(245, 158, 11, 0.12)", color: "#f59e0b" },
  Aggressive: { bg: "rgba(239, 68, 68, 0.12)", color: "#ef4444" },
};

const ALLOC_COLORS = {
  bonds: "#3b82f6",
  equities: "#10b981",
  cash: "#f59e0b",
};

export default function InvestmentStrategy() {
  const [answers, setAnswers] = useState({});
  const [showWizard, setShowWizard] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const {
    data: riskProfile,
    isLoading,
    submitAssessment,
    resetProfile,
  } = useInvestmentProfile();

  const answeredCount = useMemo(
    () => Object.keys(answers).length,
    [answers]
  );

  const totalScore = useMemo(
    () => Object.values(answers).reduce((sum, value) => sum + value, 0),
    [answers]
  );

  const isComplete = answeredCount === QUESTIONS.length;
  const currentQuestion = QUESTIONS[currentStep];
  const isStepAnswered = currentQuestion
    ? answers[currentQuestion.id] !== undefined
    : false;
  const progressValue = showWizard
    ? Math.min(currentStep + 1, QUESTIONS.length)
    : answeredCount;
  const progressPercent = (progressValue / QUESTIONS.length) * 100;

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleStart = () => {
    setShowWizard(true);
    setCurrentStep(0);
    setShowCongrats(false);
  };

  const handleExit = () => {
    setShowWizard(false);
    setShowCongrats(false);
  };

  const handlePrev = () => {
    if (currentStep === 0) return;
    setCurrentStep((prev) => prev - 1);
  };

  const handleNext = () => {
    if (!isStepAnswered || isLoading) return;

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      return;
    }
    if (!isComplete) return;
    submitAssessment(answers);
    setShowCongrats(true);
    setCelebrate(true);
  };

  const handleViewResults = () => {
    setShowCongrats(false);
    setShowWizard(false);
  };

  const handleReset = () => {
    setAnswers({});
    resetProfile();
  };

  useEffect(() => {
    if (!celebrate) return;
    const timeoutId = setTimeout(() => setCelebrate(false), 1600);
    return () => clearTimeout(timeoutId);
  }, [celebrate]);

  const hasProfile = Boolean(riskProfile?.profile);
  const canReset = answeredCount > 0 || hasProfile;
  const profileDetails = hasProfile
    ? PROFILE_DETAILS[riskProfile.profile]
    : null;
  const displayScore = showWizard
    ? totalScore
    : hasProfile
    ? riskProfile.score
    : 0;
  const profileConfig = hasProfile
    ? PROFILE_COLORS[riskProfile.profile]
    : PROFILE_COLORS.Moderate;

  return (
    <div className="strategy-page">
      {celebrate && (
        <div className="celebration-overlay" aria-hidden="true">
          <span className="confetti confetti-1" />
          <span className="confetti confetti-2" />
          <span className="confetti confetti-3" />
          <span className="confetti confetti-4" />
          <span className="confetti confetti-5" />
          <span className="confetti confetti-6" />
        </div>
      )}
      {showWizard && (
        <div className="strategy-overlay" role="dialog" aria-modal="true">
          <div className="glass-card strategy-overlay-panel animate-scale-in">
            <div className="card-body">
              {showCongrats ? (
                <div className="text-center py-5 animate-scale-in">
                  <div className="mb-4" style={{ fontSize: "4rem" }}>🎉</div>
                  <h4 className="mb-3">Congratulations on completing this task!</h4>
                  <p className="text-muted mb-4">You have successfully completed the investment risk preference assessment.。</p>
                  <button className="btn btn-primary btn-lg px-4 rounded-pill" onClick={handleViewResults}>
                    check result
                  </button>
                </div>
              ) : (
                <>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="mb-1">Risk Profile Questionnaire</h5>
                      <p className="text-muted small mb-0">
                        Question {currentStep + 1} of {QUESTIONS.length}
                      </p>
                    </div>
                    <span className="badge bg-light text-dark">0-5 pts</span>
                  </div>

                  <div className="strategy-question mb-3">
                    <h5 className="mb-3">{currentQuestion.title}</h5>
                    <div className="strategy-options">
                      {currentQuestion.options.map((option) => {
                        const optionId = `${currentQuestion.id}-${option.value}`;
                        const isActive =
                          answers[currentQuestion.id] === option.value;

                        return (
                          <label
                            key={option.label}
                            htmlFor={optionId}
                            className={`strategy-option ${
                              isActive ? "is-active" : ""
                            }`}
                          >
                            <input
                              id={optionId}
                              className="form-check-input"
                              type="radio"
                              name={currentQuestion.id}
                              checked={isActive}
                              onChange={() =>
                                handleAnswer(currentQuestion.id, option.value)
                              }
                            />
                            <span>{option.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="progress strategy-progress">
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{ width: `${progressPercent}%` }}
                      aria-valuenow={progressPercent}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    />
                  </div>

                  <div className="strategy-wizard-actions mt-3">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={handlePrev}
                      disabled={currentStep === 0 || isLoading}
                    >
                      Back
                    </button>
                    <div className="d-flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="btn btn-link strategy-link-btn"
                        onClick={handleExit}
                        disabled={isLoading}
                      >
                        Exit
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleNext}
                        disabled={!isStepAnswered || isLoading}
                      >
                        {currentStep === QUESTIONS.length - 1
                          ? isLoading
                            ? "Generating..."
                            : "Finish & View Summary"
                          : "Next"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="dashboard-greeting mb-4 animate-fade-in-up">
        <h1>Investment Strategy</h1>
        <p>Assess your risk tolerance to generate a suggested allocation mix.</p>
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-7">
          <div
            className="glass-card h-100 animate-fade-in-up"
            style={{ "--animation-order": 0 }}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h6 className="stat-label mb-2">Risk Profile</h6>
                  <h5 className="mb-1">
                    {showWizard
                      ? "Survey in progress"
                      : hasProfile
                      ? "Summary"
                      : "No profile yet"}
                  </h5>
                  <p className="text-muted small mb-0">
                    {showWizard
                      ? "Answer one question at a time."
                      : hasProfile
                      ? "Your latest assessment result."
                      : "Start the survey to generate your summary."}
                  </p>
                </div>
                <span className="text-muted small">Score: {displayScore}/30</span>
              </div>

              {!hasProfile ? (
                <>
                  <div className="strategy-empty-state mb-4">
                    <div className="strategy-empty-icon">🧭</div>
                    <div>
                      <div className="fw-semibold mb-1">Start your survey</div>
                      <p className="text-muted small mb-0">
                        Answer six questions to unlock your profile and
                        allocation summary.
                      </p>
                    </div>
                  </div>
                  <div className="strategy-info-grid">
                    <div className="strategy-info-item">
                      <span>Questions</span>
                      <strong>6 total</strong>
                    </div>
                    <div className="strategy-info-item">
                      <span>Estimated time</span>
                      <strong>2 minutes</strong>
                    </div>
                    <div className="strategy-info-item">
                      <span>Score range</span>
                      <strong>0 to 30</strong>
                    </div>
                  </div>
                  <div className="d-flex flex-wrap gap-2 mt-3">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleStart}
                    >
                      Start survey
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={handleReset}
                      disabled={!canReset}
                    >
                      Reset
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <span
                      className="badge-profile animate-pulse-glow"
                      style={{
                        background: profileConfig.bg,
                        color: profileConfig.color,
                        border: `1px solid ${profileConfig.color}20`,
                      }}
                    >
                      {riskProfile.profile}
                    </span>
                    <span className="text-muted small">
                      Score: {riskProfile.score}/30
                    </span>
                  </div>

                  <div className="allocation-bar mb-3">
                    {Object.entries(riskProfile.allocation).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="allocation-bar__segment"
                          style={{
                            width: `${value}%`,
                            backgroundColor: ALLOC_COLORS[key],
                          }}
                        />
                      )
                    )}
                  </div>

                  <div className="d-flex justify-content-between flex-wrap gap-2">
                    {Object.entries(riskProfile.allocation).map(
                      ([key, value]) => (
                        <div key={key} className="text-center">
                          <div
                            className="d-inline-block rounded-circle me-1"
                            style={{
                              width: 8,
                              height: 8,
                              backgroundColor: ALLOC_COLORS[key],
                            }}
                          />
                          <span
                            className="text-muted text-capitalize"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {key} {value}%
                          </span>
                        </div>
                      )
                    )}
                  </div>

                  <div className="strategy-profile-copy mt-3">
                    <strong>{profileDetails.title}</strong>
                    <span>{profileDetails.summary}</span>
                  </div>

                  <div className="strategy-note">
                    Backend integration will replace this client-side scoring.
                  </div>

                  <div className="d-flex flex-wrap gap-2 mt-3">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleStart}
                    >
                      Retake survey
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={handleReset}
                      disabled={!canReset}
                    >
                      Reset
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-5">
          <div
            className="glass-card h-100 animate-fade-in-up"
            style={{ "--animation-order": 1 }}
          >
            <div className="card-body">
              <h6 className="stat-label mb-3">Scoring Bands</h6>
              <div className="strategy-band-list">
                <div className="strategy-band-row">
                  <span>0 - 10</span>
                  <strong>Conservative</strong>
                </div>
                <div className="strategy-band-row">
                  <span>11 - 20</span>
                  <strong>Moderate</strong>
                </div>
                <div className="strategy-band-row">
                  <span>21 - 30</span>
                  <strong>Aggressive</strong>
                </div>
              </div>

              <div className="strategy-tips mt-4">
                <h6 className="stat-label mb-2">How it works</h6>
                <ul className="strategy-tips-list">
                  <li>Each answer gives 0-5 points.</li>
                  <li>Total score maps to a profile.</li>
                  <li>Allocation is computed on the backend in Phase 2.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
