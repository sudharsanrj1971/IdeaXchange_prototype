const mongoose = require('mongoose');

const reputationLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  delta: { type: Number, required: true },
  reason: { type: String, required: true },
  relatedApprovalRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'ApprovalRequest', default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ReputationLog', reputationLogSchema);
