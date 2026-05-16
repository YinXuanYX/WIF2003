import mongoose from 'mongoose';

const cashFlowSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    netIncome: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Net income cannot be negative'],
      max: [1000000, 'Net income cannot exceed 1,000,000'],
    },
    expenses: [
      {
        label: {
          type: String,
          required: true,
          trim: true,
          maxlength: [50, 'Expense label must be under 50 characters'],
        },
        amount: {
          type: Number,
          required: true,
          min: [0, 'Expense amount cannot be negative'],
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const CashFlow = mongoose.model('CashFlow', cashFlowSchema);
export default CashFlow;
