import mongoose from 'mongoose';

const schemeSchema = mongoose.Schema({
  scheme_name: { type: String, required: true },
  level: { type: String },
  state: { type: String },
  category: { type: String },
  tags: { type: mongoose.Schema.Types.Mixed },
  eligibility: { type: mongoose.Schema.Types.Mixed },
  documents: { type: mongoose.Schema.Types.Mixed },
  benefits: { type: String },
  steps: { type: mongoose.Schema.Types.Mixed },
}, {
  timestamps: true,
  strict: false,
});

const Scheme = mongoose.model('Scheme', schemeSchema);

export default Scheme;

