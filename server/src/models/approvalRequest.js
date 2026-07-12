const mongoose = require('mongoose');

const approvalRequestSchema = new mongoose.Schema({
  contributionBlock: { type: mongoose.Schema.Types.ObjectId, ref: 'ContributionBlock', required: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reviewNote: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date, default: null },
});

module.exports = mongoose.model('ApprovalRequest', approvalRequestSchema);
