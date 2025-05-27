import mongoose, { Schema, Model } from 'mongoose';
import { BetDocument } from '../types/index.js';

interface BetModel extends Model<BetDocument> {}

const betSchema = new Schema<BetDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    game: {
      type: Schema.Types.ObjectId,
      ref: 'Game',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    isLuckySeven: {
      type: Boolean,
      required: true,
    },
    result: {
      type: String,
      enum: ['pending', 'win', 'lose'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<BetDocument, BetModel>('Bet', betSchema);
