const ApprovalRequest = require('../models/approvalRequest');
const ContributionBlock = require('../models/contributionBlock');
const { applyReputationChange } = require('./reputationService');

const ALLOWED_TRANSITIONS = {
  pending: ['approved', 'rejected'],
};

const APPROVE_DELTA = 10;
const REJECT_DELTA = -5;

const resolveApproval = async ({ approvalRequestId, reviewer, newStatus, reviewNote = '' }) => {
  const approval = await ApprovalRequest.findById(approvalRequestId);
  if (!approval) {
    throw new Error('Approval request not found');
  }

  const allowed = ALLOWED_TRANSITIONS[approval.status] || [];
  if (!allowed.includes(newStatus)) {
    throw new Error(`Illegal transition from '${approval.status}' to '${newStatus}'`);
  }

  approval.status = newStatus;
  approval.reviewer = reviewer;
  approval.reviewNote = reviewNote;
  approval.resolvedAt = new Date();
  await approval.save();

  const block = await ContributionBlock.findById(approval.contributionBlock);

  let reputationResult = null;
  if (block) {
    if (newStatus === 'approved') {
      reputationResult = await applyReputationChange({
        user: block.contributor,
        delta: APPROVE_DELTA,
        reason: 'contribution_approved',
        relatedApprovalRequest: approval._id,
      });
    } else if (newStatus === 'rejected') {
      reputationResult = await applyReputationChange({
        user: block.contributor,
        delta: REJECT_DELTA,
        reason: 'contribution_rejected',
        relatedApprovalRequest: approval._id,
      });
    }
  }

  return { approval, reputationResult };
};

module.exports = { resolveApproval };
