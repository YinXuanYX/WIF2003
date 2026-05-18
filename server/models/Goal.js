import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Goal title must be under 100 characters'],
    },
    targetAmount: {
      type: Number,
      required: true,
      min: [0.01, 'Target amount must be positive'],
      max: [10000000, 'Target amount cannot exceed 10,000,000'],
    },
    savedAmount: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Saved amount cannot be negative'],
    },
    targetDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Goal = mongoose.model('Goal', goalSchema);
export default Goal;
