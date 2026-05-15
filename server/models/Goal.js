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
    },
    targetAmount: {
      type: Number,
      required: true,
    },
    savedAmount: {
      type: Number,
      required: true,
      default: 0,
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
