const express = require('express');
const { verifyFirebaseToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { createBlock, verifyChain } = require('../services/contributionChain');
const ContributionBlock = require('../models/contributionBlock');
const Project = require('../models/project');

const router = express.Router();

async function updateProjectScore(projectId) {
  const blocks = await ContributionBlock.find({ project: projectId });
  const total = blocks.reduce((sum, b) => sum + (b.totalScore || 0), 0);
  await Project.findByIdAndUpdate(projectId, { impactScore: total });
  return total;
}

router.post('/:projectId', verifyFirebaseToken, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'content is required' });

    const block = await createBlock({
      project: req.params.projectId,
      contributor: req.user._id,
      content,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`project:${req.params.projectId}`).emit('contribution:new', block);
    }

    res.status(201).json(block);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:projectId', verifyFirebaseToken, async (req, res) => {
  try {
    const blocks = await ContributionBlock.find({ project: req.params.projectId }).sort({ index: 1 });
    res.json(blocks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:projectId/verify', verifyFirebaseToken, async (req, res) => {
  try {
    const result = await verifyChain(req.params.projectId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/vote', verifyFirebaseToken, async (req, res) => {
  try {
    const block = await ContributionBlock.findById(req.params.id);
    if (!block) return res.status(404).json({ error: 'Not found' });

    if (block.voters.some((v) => v.toString() === req.user._id.toString())) {
      return res.status(409).json({ error: 'You have already voted on this contribution' });
    }

    block.voters.push(req.user._id);
    block.peerUpvotes += 1;
    block.totalScore = block.peerUpvotes + (block.expertRating ? block.expertRating * 2 : 0);
    await block.save();

    const projectImpactScore = await updateProjectScore(block.project);

    const io = req.app.get('io');
    if (io) {
      io.to(`project:${block.project}`).emit('scoreUpdate', { block, projectImpactScore });
    }
    res.json({ block, projectImpactScore });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/expert-rate', verifyFirebaseToken, requireRole('expert', 'admin'), async (req, res) => {
  try {
    const { rating } = req.body;
    if (typeof rating !== 'number' || rating < 0 || rating > 5) {
      return res.status(400).json({ error: 'rating must be a number between 0 and 5' });
    }

    const block = await ContributionBlock.findById(req.params.id);
    if (!block) return res.status(404).json({ error: 'Not found' });

    block.expertRating = rating;
    block.totalScore = block.peerUpvotes + (rating * 2);
    await block.save();

    const projectImpactScore = await updateProjectScore(block.project);

    const io = req.app.get('io');
    if (io) {
      io.to(`project:${block.project}`).emit('scoreUpdate', { block, projectImpactScore });
    }
    res.json({ block, projectImpactScore });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
