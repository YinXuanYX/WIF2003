import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { calculatorSchema } from "../../schemas/calculator.schema";
import GlassCard from "../ui/GlassCard";
import SegmentedControl from "../ui/SegmentedControl";
import SliderInput from "../ui/SliderInput";

function ROIForm({
  defaultValues,
  onChange,
  disposableIncome = 0,
}) {
  const {
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(calculatorSchema),
    defaultValues,
    mode: "onChange",
  });

  // Watch individual fields for display
  const principal = watch("principal");
  const rate = watch("rate");
  const years = watch("years");
  const compounding = watch("compounding");

  // Handle form submission - only calculate when button is clicked
  const onCalculate = handleSubmit((formData) => {
    onChange({
      principal: Number(formData.principal),
      rate: Number(formData.rate),
      years: Number(formData.years),
      compounding: Number(formData.compounding),
    });
  });

  return (
    <GlassCard className="h-100" animationOrder={0}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h6 className="stat-label mb-0">
          <i className="bi bi-sliders me-1" />
          Investment Details
        </h6>
        {disposableIncome > 0 && (
          <span
            className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-2"
            style={{ fontSize: "0.7rem" }}
          >
            Disposable: RM {disposableIncome.toLocaleString()}
          </span>
        )}
      </div>

      <div className="flex-grow-1 d-flex flex-column gap-4">
        <div>
          <SliderInput
            label="Principal (RM)"
            value={principal}
            onChange={(val) =>
              setValue("principal", val === "" ? "" : Number(val), {
                shouldValidate: true,
              })
            }
            min={0}
            max={500000}
            step={1000}
            prefix="RM"
          />
          {errors.principal && (
            <div className="text-danger small mt-1">
              {errors.principal.message}
            </div>
          )}
        </div>

        <div>
          <SliderInput
            label="Annual Rate (%)"
            value={rate}
            onChange={(val) =>
              setValue("rate", val === "" ? "" : Number(val), {
                shouldValidate: true,
              })
            }
            min={0}
            max={20}
            step={0.1}
            suffix="%"
          />
          {errors.rate && (
            <div className="text-danger small mt-1">{errors.rate.message}</div>
          )}
        </div>

        <div>
          <SliderInput
            label="Time (Years)"
            value={years}
            onChange={(val) =>
              setValue("years", val === "" ? "" : Number(val), {
                shouldValidate: true,
              })
            }
            min={1}
            max={40}
            step={1}
            suffix="Y"
          />
          {errors.years && (
            <div className="text-danger small mt-1">{errors.years.message}</div>
          )}
        </div>

        <div>
          <label className="form-label small fw-semibold mb-2">
            Compounding Frequency
          </label>
          <SegmentedControl
            options={[
              { label: "Annually", value: 1 },
              { label: "Quarterly", value: 4 },
              { label: "Monthly", value: 12 },
              { label: "Daily", value: 365 },
            ]}
            value={Number(compounding) || 1}
            onChange={(val) =>
              setValue("compounding", val, { shouldValidate: true })
            }
          />
          {errors.compounding && (
            <div className="text-danger small mt-1">
              {errors.compounding.message}
            </div>
          )}
        </div>

        {/* Calculate Button */}
        <button
          type="button"
          onClick={onCalculate}
          disabled={!isValid}
          className="btn btn-primary w-100 mt-3"
          style={{
            background: isValid
              ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
              : "#cbd5e1",
            border: "none",
            borderRadius: "0.75rem",
            fontWeight: "600",
            cursor: isValid ? "pointer" : "not-allowed",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            if (isValid) e.target.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
          }}
        >
          <i className="bi bi-calculator me-2" />
          Calculate ROI
        </button>
      </div>
    </GlassCard>
  );
}

export default ROIForm;
