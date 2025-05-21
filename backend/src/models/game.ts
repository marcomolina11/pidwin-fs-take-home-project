import mongoose, { Schema, Model } from 'mongoose';
import { GameDocument } from '../types/index.js';

interface GameModel extends Model<GameDocument> {}

const gameSchema: Schema = new Schema<GameDocument>({
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
  bets: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Bet',
    },
  ],
});

gameSchema.virtual('canAcceptBets').get(function (this: GameDocument) {
  const secondsElapsed = (Date.now() - this.createdAt.getTime()) / 1000;
  return secondsElapsed <= 10;
});

gameSchema.virtual('rollResult').get(function (this: GameDocument) {
  if (!this.dice1 || !this.dice2) return null;
  return this.dice1 + this.dice2;
});

gameSchema.virtual('isLuckySeven').get(function (this: GameDocument) {
  return this.rollResult === 7;
});

export default mongoose.model<GameDocument, GameModel>('Game', gameSchema);
