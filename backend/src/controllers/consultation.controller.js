import { asyncHandler } from '../middleware/error.middleware.js';
import ConsultationRequest from '../models/ConsultationRequest.model.js';
import User from '../models/User.model.js';

export const consultationController = {
  create: asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.userId).select('name email orgName');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const request = await ConsultationRequest.create({
      userId:       req.user.userId,
      name:         req.body.name  || user.name,
      email:        req.body.email || user.email,
      orgName:      req.body.orgName || user.orgName || '',
      message:      req.body.message || '',
      assessmentId: req.body.assessmentId || null,
    });

    res.status(201).json({ success: true, request });
  }),
};
