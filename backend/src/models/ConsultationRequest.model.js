import mongoose from 'mongoose';

const ConsultationRequestSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:        { type: String, required: true },
  email:       { type: String, required: true },
  orgName:     { type: String, default: '' },
  message:     { type: String, default: '' },
  assessmentId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', default: null },
  status:      { type: String, enum: ['pending', 'contacted', 'closed'], default: 'pending' },
}, { timestamps: true });

export default mongoose.model('ConsultationRequest', ConsultationRequestSchema);
