import mongoose from 'mongoose';

const schemeSchema = mongoose.Schema({
  scheme_name: { type: String, required: true },
  level: { type: String, required: true },
  state: { type: String },
  category: { type: String, required: true },
  tags: [{ type: String }],
  eligibility: {
    age: { min: { type: Number }, max: { type: Number } },
    income: { max: { type: Number } },
    occupation: [{ type: String }],
    gender: { type: String },
    bpl: { type: Boolean },
    disability: { type: Boolean },
  },
  documents: [{ type: String }],
  benefits: { type: String, required: true },
  steps: [{ type: String }],
}, {
  timestamps: true,
});

const Scheme = mongoose.model('Scheme', schemeSchema);

export default Scheme;
