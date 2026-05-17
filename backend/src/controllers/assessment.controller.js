import mongoose from 'mongoose';
import { asyncHandler } from '../middleware/error.middleware.js';
import Assessment from '../models/Assessment.model.js';

export const assessmentController = {

  list: asyncHandler(async (req, res) => {
    const assessments = await Assessment
      .find({ userId: new mongoose.Types.ObjectId(req.user.userId) })
      .select('name sector status createdAt updatedAt uploadStatus')
      .sort({ updatedAt: -1 });
    res.json({ success: true, assessments });
  }),

  latest: asyncHandler(async (req, res) => {
    const assessment = await Assessment
      .findOne({ userId: new mongoose.Types.ObjectId(req.user.userId) })
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
      userId: new mongoose.Types.ObjectId(req.user.userId),
    });
    if (!assessment)
      return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, assessment });
  }),

  create: asyncHandler(async (req, res) => {
    const assessment = await Assessment.create({
      userId: new mongoose.Types.ObjectId(req.user.userId),
      sector: req.body.sector,
      name: `Assessment ${new Date().toLocaleDateString('en-IN')}`,
      status: 'draft',
      rows: [],
      waterRows: [],
      fuelRows: [],
      wasteRows: [],
      flags: req.body.flags && typeof req.body.flags === 'object' ? req.body.flags : {},
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
      { _id: req.params.id, userId: new mongoose.Types.ObjectId(req.user.userId) },
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
      userId: new mongoose.Types.ObjectId(req.user.userId),
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
      { _id: req.params.id, userId: new mongoose.Types.ObjectId(req.user.userId) },
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
      { _id: req.params.id, userId: new mongoose.Types.ObjectId(req.user.userId) },
      { $set: { flags } },
      { new: true, runValidators: false }
    );
    if (!assessment) {
      return res.status(404).json({ success: false, error: 'Not found' });
    }
    res.json({ success: true, assessment });
  }),

  saveScores: asyncHandler(async (req, res) => {
    const { scores, emissions, benchmarks, confidence, certifications } = req.body;

    if (!scores || typeof scores !== 'object' || Array.isArray(scores)) {
      return res.status(400).json({ success: false, error: 'scores object is required' });
    }

    const $set = { scores };

    if (emissions  && typeof emissions  === 'object') $set.emissions  = emissions;
    if (benchmarks && typeof benchmarks === 'object') $set.benchmarks = benchmarks;
    if (confidence && typeof confidence === 'object') $set.confidence = confidence;
    if (Array.isArray(certifications))                $set.certifications = certifications;

    const assessment = await Assessment.findOneAndUpdate(
      { _id: req.params.id, userId: new mongoose.Types.ObjectId(req.user.userId) },
      { $set },
      { new: true, runValidators: false }
    );

    if (!assessment) {
      return res.status(404).json({ success: false, error: 'Not found' });
    }

    res.json({ success: true, assessment });
  }),
};