import mongoose, { Schema, Model } from 'mongoose';
import { GameDocument } from '../types/index.js';
import { BETTING_WINDOW_SECONDS } from '../constants/constants.js';

interface GameModel extends Model<GameDocument> {
  getCurrentGame(): Promise<GameDocument | null>;
}

const gameSchema: Schema = new Schema<GameDocument>(
  {
    isComplete: {
      type: Boolean,
      default: false,
    },
    dice1: {
      type: Number,
      min: 1,
      max: 6,
    },
    dice2: {
      type: Number,
      min: 1,
      max: 6,
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// virtual properties
gameSchema.virtual('canAcceptBets').get(function (this: GameDocument) {
  const secondsElapsed = (Date.now() - this.createdAt.getTime()) / 1000;
  return secondsElapsed <= BETTING_WINDOW_SECONDS;
});

gameSchema.virtual('rollResult').get(function (this: GameDocument) {
  if (!this.dice1 || !this.dice2) return null;
  return this.dice1 + this.dice2;
});

gameSchema.virtual('isLuckySeven').get(function (this: GameDocument) {
  return this.rollResult === 7;
});

// static methods
gameSchema.statics.getCurrentGame =
  async function (): Promise<GameDocument | null> {
    return this.findOne({ isComplete: false })
      .sort({ createdAt: -1 }) // Sort by creation time descending (newest first)
      .exec();
  };

export default mongoose.model<GameDocument, GameModel>('Game', gameSchema);
