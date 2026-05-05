import React, { useEffect, useMemo, useState } from "react";
import "./InvestmentStrategy.css";
import useInvestmentProfile from "../hooks/useInvestmentProfile";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

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
  const { width, height } = useWindowSize();
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
    const timeoutId = setTimeout(() => setCelebrate(false), 5000);
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
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none' }}>
          <Confetti
            width={width}
            height={height}
            numberOfPieces={400}
            gravity={0.15}
            recycle={false}
            colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']}
          />
        </div>
      )}
      {showWizard && (
        <div className="strategy-overlay" role="dialog" aria-modal="true">
          <div className="glass-card strategy-overlay-panel animate-scale-in">
            <div className="card-body">
              {showCongrats ? (
                <div className="text-center py-5 animate-scale-in">
                  <div className="mb-4 d-flex justify-content-center">
                    <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: 80, height: 80, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontSize: '2.5rem' }}>
                      <i className="bi bi-check-lg"></i>
                    </div>
                  </div>
                  <h4 className="mb-3 fw-bold">Assessment Complete!</h4>
                  <p className="text-muted mb-4 px-3">We have successfully generated your customized investment risk profile and asset allocation strategy.</p>
                  <button className="btn btn-primary btn-lg px-5 rounded-pill shadow-sm" onClick={handleViewResults}>
                    View My Profile <i className="bi bi-arrow-right ms-2"></i>
                  </button>
                </div>
              ) : (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="d-flex align-items-center gap-3">
                      <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: 44, height: 44, background: 'rgba(var(--bs-primary-rgb), 0.1)', color: 'var(--bs-primary)' }}>
                        <i className="bi bi-patch-question-fill fs-5"></i>
                      </div>
                      <div>
                        <h5 className="mb-0 fw-bold">Question {currentStep + 1}</h5>
                        <p className="text-muted small mb-0 mt-1">of {QUESTIONS.length} • Risk Profile</p>
                      </div>
                    </div>
                    <span className="badge rounded-pill px-3 py-2" style={{ background: 'rgba(var(--bs-primary-rgb), 0.1)', color: 'var(--bs-primary)' }}>0-5 pts</span>
                  </div>

                  <div className="strategy-question mb-4">
                    <h5 className="mb-4 fw-semibold text-center">{currentQuestion.title}</h5>
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

                  <div className="progress strategy-progress mb-4" style={{ height: '8px' }}>
                    <div
                      className="progress-bar progress-bar-striped progress-bar-animated"
                      role="progressbar"
                      style={{ width: `${progressPercent}%`, borderRadius: '999px' }}
                      aria-valuenow={progressPercent}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    />
                  </div>

                  <div className="strategy-wizard-actions">
                    <button
                      type="button"
                      className="btn btn-light rounded-pill px-4"
                      onClick={handlePrev}
                      disabled={currentStep === 0 || isLoading}
                    >
                      <i className="bi bi-arrow-left me-2"></i>Back
                    </button>
                    <div className="d-flex flex-wrap gap-3 align-items-center">
                      <button
                        type="button"
                        className="btn btn-link text-muted text-decoration-none"
                        onClick={handleExit}
                        disabled={isLoading}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary rounded-pill px-4"
                        onClick={handleNext}
                        disabled={!isStepAnswered || isLoading}
                      >
                        {currentStep === QUESTIONS.length - 1
                          ? isLoading
                            ? <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Analyzing...</>
                            : <>Finish <i className="bi bi-check-lg ms-2"></i></>
                          : <>Next <i className="bi bi-arrow-right ms-2"></i></>}
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
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: 44, height: 44, background: 'rgba(var(--bs-primary-rgb), 0.1)', color: 'var(--bs-primary)' }}>
                    <i className="bi bi-person-bounding-box fs-5"></i>
                  </div>
                  <div>
                    <h5 className="mb-0 fw-bold">
                      {showWizard ? "Survey in progress" : hasProfile ? "Your Profile" : "Risk Profile"}
                    </h5>
                    <p className="text-muted small mb-0 mt-1">
                      {showWizard ? "Answer one question at a time." : hasProfile ? "Latest assessment result." : "Start the survey to generate your summary."}
                    </p>
                  </div>
                </div>
                {hasProfile && !showWizard && (
                  <span className="badge rounded-pill px-3 py-2" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>Completed</span>
                )}
              </div>

              {!hasProfile ? (
                <div className="py-2">
                  <div className="strategy-empty-state mb-4 border-0 p-4" style={{ background: 'linear-gradient(145deg, rgba(var(--bs-primary-rgb), 0.05) 0%, rgba(var(--bs-primary-rgb), 0.02) 100%)', borderRadius: '1.25rem' }}>
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div className="d-flex align-items-center justify-content-center rounded-circle shadow-sm bg-white" style={{ width: 48, height: 48, color: 'var(--bs-primary)' }}>
                        <i className="bi bi-compass fs-4"></i>
                      </div>
                      <div>
                        <div className="fw-bold fs-5">Start your survey</div>
                        <p className="text-muted small mb-0">Answer {QUESTIONS.length} questions to unlock your strategy.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="strategy-info-grid mb-4">
                    <div className="strategy-info-item text-center py-3">
                      <i className="bi bi-list-ol fs-4 text-primary mb-2 opacity-75"></i>
                      <span className="d-block small text-muted">Questions</span>
                      <strong className="fs-5">{QUESTIONS.length} total</strong>
                    </div>
                    <div className="strategy-info-item text-center py-3">
                      <i className="bi bi-stopwatch fs-4 text-primary mb-2 opacity-75"></i>
                      <span className="d-block small text-muted">Estimated time</span>
                      <strong className="fs-5">2 minutes</strong>
                    </div>
                    <div className="strategy-info-item text-center py-3">
                      <i className="bi bi-star fs-4 text-primary mb-2 opacity-75"></i>
                      <span className="d-block small text-muted">Score range</span>
                      <strong className="fs-5">0 to {QUESTIONS.length * 5}</strong>
                    </div>
                  </div>
                  
                  <div className="d-flex flex-wrap gap-3">
                    <button type="button" className="btn btn-primary btn-lg rounded-pill px-4 shadow-sm flex-grow-1" onClick={handleStart}>
                      <i className="bi bi-play-circle me-2"></i>Start Survey
                    </button>
                    {canReset && (
                      <button type="button" className="btn btn-light btn-lg rounded-pill px-4" onClick={handleReset}>
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-2 animate-scale-in">
                  <div className="text-center py-4 mb-4" style={{ background: 'linear-gradient(145deg, rgba(var(--bs-primary-rgb), 0.05) 0%, rgba(var(--bs-primary-rgb), 0.01) 100%)', borderRadius: '1.25rem', border: '1px solid rgba(var(--bs-primary-rgb), 0.1)' }}>
                    <div className="mb-3">
                      <span className="badge-profile fs-6 px-4 py-2 animate-pulse-glow" style={{ background: profileConfig.bg, color: profileConfig.color, border: `1px solid ${profileConfig.color}40`, boxShadow: `0 4px 12px ${profileConfig.bg}` }}>
                        <i className="bi bi-shield-check me-2"></i>{riskProfile.profile}
                      </span>
                    </div>
                    <div className="stat-value display-3 text-primary fw-bold mb-1">{riskProfile.score}<span className="fs-4 text-muted fw-normal opacity-50">/30</span></div>
                    <div className="text-muted small text-uppercase fw-semibold tracking-wide">Total Score</div>
                  </div>

                  <h6 className="fw-bold mb-3 d-flex align-items-center">
                    <i className="bi bi-pie-chart-fill text-primary me-2"></i> Suggested Allocation
                  </h6>
                  
                  <div className="allocation-bar mb-4" style={{ height: '12px', borderRadius: '999px', overflow: 'hidden', display: 'flex' }}>
                    {Object.entries(riskProfile.allocation).map(([key, value]) => (
                      <div
                        key={key}
                        className="allocation-bar__segment position-relative"
                        style={{ width: `${value}%`, backgroundColor: ALLOC_COLORS[key], transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
                        title={`${key}: ${value}%`}
                      />
                    ))}
                  </div>

                  <div className="d-flex justify-content-between flex-wrap gap-2 mb-4">
                    {Object.entries(riskProfile.allocation).map(([key, value]) => (
                      <div key={key} className="text-center bg-white border rounded-pill px-3 py-2 shadow-sm flex-grow-1">
                        <div className="d-inline-block rounded-circle me-2 align-middle" style={{ width: 10, height: 10, backgroundColor: ALLOC_COLORS[key] }} />
                        <span className="text-dark fw-medium text-capitalize" style={{ fontSize: '0.85rem' }}>{key}</span>
                        <span className="ms-2 text-muted fw-bold" style={{ fontSize: '0.85rem' }}>{value}%</span>
                      </div>
                    ))}
                  </div>

                  <div className="strategy-profile-copy p-4 mb-4 border-0 shadow-sm" style={{ background: 'var(--bs-card-bg)', borderRadius: '1rem' }}>
                    <div className="d-flex gap-3 align-items-start">
                      <i className="bi bi-info-circle-fill text-primary fs-4 mt-1"></i>
                      <div>
                        <strong className="d-block fs-6 mb-1 text-dark">{profileDetails.title}</strong>
                        <span className="text-muted" style={{ lineHeight: '1.6' }}>{profileDetails.summary}</span>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex flex-wrap gap-3 mt-4 pt-3 border-top border-light">
                    <button type="button" className="btn btn-primary rounded-pill px-4 shadow-sm" onClick={handleStart}>
                      <i className="bi bi-arrow-repeat me-2"></i>Retake Survey
                    </button>
                    <button type="button" className="btn btn-light rounded-pill px-4" onClick={handleReset}>
                      Clear Data
                    </button>
                  </div>
                </div>
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
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: 44, height: 44, background: 'rgba(var(--bs-primary-rgb), 0.1)', color: 'var(--bs-primary)' }}>
                  <i className="bi bi-bar-chart-steps fs-5"></i>
                </div>
                <h5 className="mb-0 fw-bold">Scoring Bands</h5>
              </div>
              
              <div className="strategy-band-list mb-4">
                <div className="strategy-band-row shadow-sm border-0 bg-white d-flex align-items-center">
                  <div className="rounded-circle me-3" style={{ width: 12, height: 12, backgroundColor: PROFILE_COLORS.Conservative.color }}></div>
                  <div className="flex-grow-1">
                    <strong className="d-block text-dark">Conservative</strong>
                    <span className="small text-muted">0 - 10 points</span>
                  </div>
                </div>
                <div className="strategy-band-row shadow-sm border-0 bg-white d-flex align-items-center">
                  <div className="rounded-circle me-3" style={{ width: 12, height: 12, backgroundColor: PROFILE_COLORS.Moderate.color }}></div>
                  <div className="flex-grow-1">
                    <strong className="d-block text-dark">Moderate</strong>
                    <span className="small text-muted">11 - 20 points</span>
                  </div>
                </div>
                <div className="strategy-band-row shadow-sm border-0 bg-white d-flex align-items-center">
                  <div className="rounded-circle me-3" style={{ width: 12, height: 12, backgroundColor: PROFILE_COLORS.Aggressive.color }}></div>
                  <div className="flex-grow-1">
                    <strong className="d-block text-dark">Aggressive</strong>
                    <span className="small text-muted">21 - 30 points</span>
                  </div>
                </div>
              </div>

              <div className="strategy-tips p-4 rounded-4" style={{ background: 'rgba(var(--bs-primary-rgb), 0.03)', border: '1px solid rgba(var(--bs-primary-rgb), 0.08)' }}>
                <h6 className="fw-bold mb-3 d-flex align-items-center text-primary">
                  <i className="bi bi-lightbulb-fill me-2"></i> How it works
                </h6>
                <ul className="strategy-tips-list mb-0">
                  <li className="mb-2">Each answer awards between <strong className="text-dark">0-5 points</strong> based on your risk tolerance.</li>
                  <li className="mb-2">Your total score is calculated to map directly to a tailored risk profile.</li>
                  <li>In Phase 2, asset allocation will be fully driven by backend AI analysis.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
