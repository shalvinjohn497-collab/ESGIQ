import mongoose from 'mongoose';

const MonthRowSchema = new mongoose.Schema({
  month: { type: String },
  elec: { type: Number, default: 0 },
  ren: { type: Number, default: 0 },
  diesel: { type: Number, default: 0 },
  cost: { type: Number, default: 0 },
}, { _id: false });

const WaterRowSchema = new mongoose.Schema({
  month: { type: String },
  municipal: { type: Number, default: 0 },
  tanker: { type: Number, default: 0 },
  borewell: { type: Number, default: 0 },
  recycled: { type: Number, default: 0 },
  totalWater: { type: Number, default: 0 },
}, { _id: false });

const FuelRowSchema = new mongoose.Schema({
  month: { type: String },
  fuelDiesel: { type: Number, default: 0 },
  png: { type: Number, default: 0 },
  runtime: { type: Number, default: 0 },
}, { _id: false });

const WasteRowSchema = new mongoose.Schema({
  month: { type: String },
  wet: { type: Number, default: 0 },
  dry: { type: Number, default: 0 },
  biomedical: { type: Number, default: 0 },
  hazardous: { type: Number, default: 0 },
  totalWaste: { type: Number, default: 0 },
}, { _id: false });

const AssessmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    default: () => `Assessment ${new Date().toLocaleDateString('en-IN')}`,
  },
  sector: { type: String, default: 'HOSP' },
  status: {
    type: String,
    enum: ['draft', 'complete'],
    default: 'draft',
  },
  rows:      { type: [MonthRowSchema], default: [] },
  waterRows: { type: [WaterRowSchema], default: [] },
  fuelRows:  { type: [FuelRowSchema],  default: [] },
  wasteRows: { type: [WasteRowSchema], default: [] },
  // New fields as requested
  scores:            { type: mongoose.Schema.Types.Mixed, default: {} },
  emissions:         { type: mongoose.Schema.Types.Mixed, default: {} },
  benchmarks:        { type: mongoose.Schema.Types.Mixed, default: {} },
  confidence:        { type: mongoose.Schema.Types.Mixed, default: {} },
  certifications:    { type: [mongoose.Schema.Types.Mixed], default: [] },
  strengths:         { type: [mongoose.Schema.Types.Mixed], default: [] },
  gaps:              { type: [mongoose.Schema.Types.Mixed], default: [] },
  roadmap:           { type: [mongoose.Schema.Types.Mixed], default: [] },
  generatedReports:  { type: [mongoose.Schema.Types.Mixed], default: [] },
  flags:        { type: mongoose.Schema.Types.Mixed, default: {} },
  uploadStatus: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

// Set runValidators: false as default for findOneAndUpdate
AssessmentSchema.pre('findOneAndUpdate', function(next) {
  if (this.options.runValidators === undefined) {
    this.options.runValidators = false;
  }
  
});

export default mongoose.model('Assessment', AssessmentSchema);