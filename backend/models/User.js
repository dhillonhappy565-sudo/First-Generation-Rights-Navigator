import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
  name: { type: String },
  phone: { type: String, required: true, unique: true },
  state: { type: String },
  age: { type: Number },
  gender: { type: String },
  occupation: { type: String },
  income: { type: Number },
  category: { type: String },
  purpose: { type: String },
  hasAadhaar: { type: Boolean, default: false },
  hasPAN: { type: Boolean, default: false },
  language: { type: String, default: 'English' },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

export default User;
