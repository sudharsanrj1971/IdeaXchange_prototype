const cron = require('node-cron');
const ContributionBlock = require('../models/contributionBlock');
const logger = require('../services/logger');
const crypto = require('crypto');

function calculateHash(block) {
  const blockString = JSON.stringify({
    index: block.index,
    previousHash: block.previousHash,
    timestamp: block.timestamp,
    contribution: block.contribution,
    nonce: block.nonce
  });
  return crypto.createHash('sha256').update(blockString).digest('hex');
}

async function verifyChainIntegrity() {
  logger.info('Starting scheduled ledger integrity check...');
  try {
    const blocks = await ContributionBlock.find().sort({ index: 1 });
    if (blocks.length === 0) return;

    for (let i = 0; i < blocks.length; i++) {
      const currentBlock = blocks[i];
      
      // 1. Verify index
      if (currentBlock.index !== i) {
        throw new Error(`Chain broken: Index mismatch at block ${i}`);
      }

      // 2. Verify hash linkage
      if (i > 0) {
        const previousBlock = blocks[i - 1];
        if (currentBlock.previousHash !== previousBlock.hash) {
          throw new Error(`Chain broken: Hash link broken at block ${i}`);
        }
      }

      // 3. Verify block hash calculation
      const recalculatedHash = calculateHash(currentBlock);
      if (currentBlock.hash !== recalculatedHash) {
        throw new Error(`Chain broken: Recalculated hash mismatch at block ${i}`);
      }
    }
    logger.info('Ledger integrity check passed successfully. Chain is secure.');
  } catch (err) {
    logger.error('CRITICAL: Ledger integrity verification failed! %s', err.message);
  }
}

function scheduleVerifyChain() {
  // Run every hour
  cron.schedule('0 * * * *', () => {
    verifyChainIntegrity();
  });
}

module.exports = { verifyChainIntegrity, scheduleVerifyChain };
