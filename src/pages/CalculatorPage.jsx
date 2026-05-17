import { useState, useCallback } from "react";
import ROIForm from "../components/calculator/ROIForm";
import ROIResults from "../components/calculator/ROIResults";
import InvestmentComparison from "../components/calculator/InvestmentComparison";
import useGoalsStore from "../stores/useGoalsStore";
import { useCashFlow } from "../hooks/useCashFlow";

function calculateCompoundInterest(
  principal,
  ratePercent,
  years,
  compoundingFrequency,
) {
  const r = ratePercent / 100;
  const n = compoundingFrequency;
  const t = years;
  const amount = principal * Math.pow(1 + r / n, n * t);
  return amount;
}

function CalculatorPage() {
  const [calculationResult, setCalculationResult] = useState(null);

  // get all financial goals from global store (Zustand)
  const goals = useGoalsStore((s) => s.goals);

  // get user's disposable income from cashflow hook
  const { disposableIncome } = useCashFlow();

  // calculate ROI when form data changes
  const handleCalculate = useCallback((data) => {
    const { principal, rate, years, compounding } = data;

    const futureValue = calculateCompoundInterest(
      principal,
      rate,
      years,
      compounding,
    );
    const netProfit = futureValue - principal;
    // calculate ROI percentage, ensure principal is not zero to avoid division by zero
    const roiPercent = principal > 0 ? (netProfit / principal) * 100 : 0;

    setCalculationResult({
      inputs: data,
      futureValue,
      netProfit,
      roiPercent,
    });
  }, []);

  const hasCalculated = calculationResult !== null;

  return (
    <div className="calculator-page animate-fade-in-up">
      <div className="dashboard-greeting mb-4">
        <h1>ROI Calculator</h1>
        <p>
          Project your investment growth using compound interest and compare
          different vehicles.
        </p>
      </div>

      <div className="row g-4">
        {/* Input Form */}
        <div className="col-lg-4">
          <ROIForm
            goals={goals}
            disposableIncome={disposableIncome}
            defaultValues={{
              principal: 10000,
              rate: 5,
              years: 10,
              compounding: 1,
            }}
            onChange={handleCalculate}
          />
        </div>

        {/* Results */}
        <div className="col-lg-8">
          <ROIResults
            hasCalculated={hasCalculated}
            inputs={calculationResult?.inputs}
            principal={calculationResult?.inputs?.principal || 0}
            futureValue={calculationResult?.futureValue || 0}
            netProfit={calculationResult?.netProfit || 0}
            roiPercent={calculationResult?.roiPercent || 0}
          />
        </div>

        {/* Comparison Tool */}
        <div className="col-12">
          <InvestmentComparison
            hasCalculated={hasCalculated}
            principal={calculationResult?.inputs.principal || 0}
            years={calculationResult?.inputs.years || 0}
            compounding={calculationResult?.inputs.compounding || 1}
          />
        </div>
      </div>
    </div>
  );
}

export default CalculatorPage;