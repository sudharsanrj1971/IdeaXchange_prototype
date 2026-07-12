const ContributionBlock = require('../models/contributionBlock');

const createBlock = async ({ project, contributor, content, type = 'markdown', size = null }) => {
  if (!content) {
    throw new Error('content is required');
  }

  const deltaData = {
    content,
    type,
    size: typeof size === 'number' ? size : content.length,
  };

  const lastBlock = await ContributionBlock.findOne({ project }).sort({ index: -1 });
  const index = lastBlock ? lastBlock.index + 1 : 0;
  const prevBlockHash = lastBlock ? lastBlock.hash : null;
  const timestamp = new Date();

  const hash = ContributionBlock.computeHash({
    project,
    contributor,
    deltaData,
    prevBlockHash,
    index,
    timestamp,
  });

  const block = await ContributionBlock.create({
    project,
    contributor,
    deltaData,
    prevBlockHash,
    hash,
    index,
    timestamp,
  });

  return block;
};

const verifyChain = async (projectId) => {
  const blocks = await ContributionBlock.find({ project: projectId }).sort({ index: 1 });

  let prevHash = null;
  for (const block of blocks) {
    const expectedHash = ContributionBlock.computeHash({
      project: block.project,
      contributor: block.contributor,
      deltaData: block.deltaData,
      prevBlockHash: block.prevBlockHash,
      index: block.index,
      timestamp: block.timestamp,
    });

    if (expectedHash !== block.hash || block.prevBlockHash !== prevHash) {
      return { valid: false, brokenAtIndex: block.index };
    }

    prevHash = block.hash;
  }

  return { valid: true, brokenAtIndex: null };
};

module.exports = { createBlock, verifyChain };
