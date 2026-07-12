const express = require('express');
const { verifyFirebaseToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { resolveApproval } = require('../services/approvalStateMachine');
const ApprovalRequest = require('../models/approvalRequest');

const router = express.Router();

router.post('/', verifyFirebaseToken, async (req, res) => {
  try {
    const { contributionBlock } = req.body;
    if (!contributionBlock) return res.status(400).json({ error: 'contributionBlock is required' });

    const approval = await ApprovalRequest.create({
      contributionBlock,
      requestedBy: req.user._id,
    });
    res.status(201).json(approval);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/pending', verifyFirebaseToken, requireRole('reviewer', 'admin'), async (req, res) => {
  try {
    const pending = await ApprovalRequest.find({ status: 'pending' }).populate('contributionBlock');
    res.json(pending);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', verifyFirebaseToken, requireRole('reviewer', 'admin'), async (req, res) => {
  try {
    const { status, reviewNote } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: "status must be 'approved' or 'rejected'" });
    }

    const { approval, reputationResult } = await resolveApproval({
      approvalRequestId: req.params.id,
      reviewer: req.user._id,
      newStatus: status,
      reviewNote,
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('approval:statusChanged', { approvalRequestId: approval._id, status: approval.status });
      if (reputationResult) {
        io.emit('reputation:changed', {
          userId: approval.requestedBy,
          newScore: reputationResult.newScore,
          delta: reputationResult.log.delta,
        });
      }
    }

    res.json(approval);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
