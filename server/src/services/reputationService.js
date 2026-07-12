const User = require('../models/user');
const ReputationLog = require('../models/reputationLog');

const applyReputationChange = async ({ user, delta, reason, relatedApprovalRequest = null }) => {
  const log = await ReputationLog.create({
    user,
    delta,
    reason,
    relatedApprovalRequest,
  });

  const updatedUser = await User.findByIdAndUpdate(
    user,
    { $inc: { reputationScore: delta } },
    { new: true }
  );

  return { log, newScore: updatedUser.reputationScore };
};

module.exports = { applyReputationChange };
