const mongoose = require('mongoose');
const crypto = require('crypto');

const contributionBlockSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  contributor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deltaData: { type: mongoose.Schema.Types.Mixed, required: true },
  prevBlockHash: { type: String, default: null },
  hash: { type: String, required: true },
  index: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  peerUpvotes: { type: Number, default: 0 },
  expertRating: { type: Number, default: null },
  totalScore: { type: Number, default: 0 },
});

contributionBlockSchema.statics.computeHash = function ({ project, contributor, deltaData, prevBlockHash, index, timestamp }) {
  const payload = `${project}|${contributor}|${JSON.stringify(deltaData)}|${prevBlockHash}|${index}|${timestamp}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
};

module.exports = mongoose.model('ContributionBlock', contributionBlockSchema);
