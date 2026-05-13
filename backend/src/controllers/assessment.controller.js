
import mongoose from 'mongoose';
import { asyncHandler } from '../middleware/error.middleware.js';
import Assessment from '../models/Assessment.model.js';

const DEMO_USER_ID = new mongoose.Types.ObjectId('aaaaaaaaaaaaaaaaaaaaaaaa');

function getUserId(req) {
  if (req.user.userId === 'demo-user-id') return DEMO_USER_ID;
  return new mongoose.Types.ObjectId(req.user.userId);
}

export const assessmentController = {

  list: asyncHandler(async (req, res) => {
    const assessments = await Assessment
      .find({ userId: getUserId(req) })
      .select('name sector status createdAt updatedAt uploadStatus')
      .sort({ updatedAt: -1 });
    res.json({ success: true, assessments });
  }),

  latest: asyncHandler(async (req, res) => {
    const assessment = await Assessment
      .findOne({ userId: getUserId(req) })
      .sort({ updatedAt: -1 });
    res.json({ success: true, assessment: assessment || null });
  }),

  getOne: asyncHandler(async (req, res) => {
    const assessment = await Assessment.findOne({
      _id: req.params.id,
      userId: getUserId(req),
    });
    if (!assessment)
      return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, assessment });
  }),

  create: asyncHandler(async (req, res) => {
    const assessment = await Assessment.create({
      userId: getUserId(req),
      sector: req.body.sector || 'HOSP',
      ...req.body,
    });
    res.status(201).json({ success: true, assessment });
  }),

  update: asyncHandler(async (req, res) => {
    const assessment = await Assessment.findOneAndUpdate(
      { _id: req.params.id, userId: getUserId(req) },
      { $set: req.body },
      { new: true, runValidators: false }
    );
    if (!assessment)
      return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, assessment });
  }),

  remove: asyncHandler(async (req, res) => {
    await Assessment.findOneAndDelete({
      _id: req.params.id,
      userId: getUserId(req),
    });
    res.json({ success: true });
  }),
};