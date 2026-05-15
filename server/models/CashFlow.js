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
    },
    expenses: [
      {
        label: { type: String, required: true },
        amount: { type: Number, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const CashFlow = mongoose.model('CashFlow', cashFlowSchema);
export default CashFlow;
