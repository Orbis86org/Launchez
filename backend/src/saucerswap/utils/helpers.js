const { EntityIdHelper } = require('@hashgraph/sdk');

/**
 * Convert Hedera Account to EVM address
 *
 * @param account_id
 */
function convertAccountIdToEVMAddress(  account_id ) {
    const { shard, realm, num } = EntityIdHelper.fromString( account_id );

    return '0x' + EntityIdHelper.toSolidityAddress([shard, realm, num]);
};

/**
 * Sleeps for the given number of milliseconds.
 *
 * @param {number} ms - The number of milliseconds to sleep.
 * @returns {Promise<void>} - A Promise that resolves after the specified time.
 */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {convertAccountIdToEVMAddress, sleep};