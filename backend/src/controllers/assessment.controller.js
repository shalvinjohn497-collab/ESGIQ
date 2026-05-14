
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
    console.log('Latest assessment ID:', assessment?._id);
    console.log(
      `Latest assessment fetched — rows count: ${assessment?.rows?.length || 0}, waterRows count: ${assessment?.waterRows?.length || 0}`
    );
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
      name: `Assessment ${new Date().toLocaleDateString('en-IN')}`,
      status: 'draft',
      rows: [],
      waterRows: [],
      fuelRows: [],
      wasteRows: [],
      flags: {},
      uploadStatus: {},
      scores: {},
      emissions: {},
      certifications: [],
      strengths: [],
      gaps: [],
      roadmap: [],
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
  uploadCategory: asyncHandler(async (req, res) => {
    const { category, rows } = req.body;
    const validCategories = {
      electricity: 'rows',
      water: 'waterRows',
      fuel: 'fuelRows',
      waste: 'wasteRows',
    };
    if (!validCategories[category]) {
      return res.status(400).json({ success: false, error: 'Invalid category' });
    }
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ success: false, error: 'Rows array is required and cannot be empty' });
    }
    const updateField = validCategories[category];
    const uploadStatusField = `uploadStatus.${category}`;
    const update = {
      $set: {
        [updateField]: rows,
        [uploadStatusField]: {
          monthsUploaded: rows.length,
          source: 'excel',
          uploadedAt: new Date(),
        },
      },
    };
    const assessment = await Assessment.findOneAndUpdate(
      { _id: req.params.id, userId: getUserId(req) },
      update,
      { new: true, runValidators: false }
    );
    if (!assessment) {
      return res.status(404).json({ success: false, error: 'Not found' });
    }
    res.json({ success: true, assessment });
  }),

  saveGovernance: asyncHandler(async (req, res) => {
    const { flags } = req.body;
    if (!flags || typeof flags !== 'object' || Array.isArray(flags)) {
      return res.status(400).json({ success: false, error: 'Flags object is required' });
    }
    const assessment = await Assessment.findOneAndUpdate(
      { _id: req.params.id, userId: getUserId(req) },
      { $set: { flags } },
      { new: true, runValidators: false }
    );
    if (!assessment) {
      return res.status(404).json({ success: false, error: 'Not found' });
    }
    res.json({ success: true, assessment });
  }),
};