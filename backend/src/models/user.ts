import mongoose, { Schema, Model } from 'mongoose';
import { UserDocument } from '../types/index.js';

interface UserModel extends Model<UserDocument> {}

const userSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  tokens: { type: Number, required: true },
  currentWinStreak: { type: Number, default: 0 },
  highestWinStreak: { type: Number, default: 0 },
});

export default mongoose.model<UserDocument, UserModel>('User', userSchema);
