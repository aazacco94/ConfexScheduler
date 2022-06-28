const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

/**
 * Initializes a new temporary mock server instance.
 * @returns {Promise<void>} on success
 * @throws {Error} when the mock server cannot be initialized
 */
async function start() {
  try {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    console.debug(`Mock database uri: ${uri}`);
    await mongoose.connect(uri);
  } catch (err) {
    console.error(err);
    throw new Error('Could not instantiate mongo mock server');
  }
}

/**
 * Terminates the temporary server instance and deletes all of its data.
 * @returns {Promise<void>} on success
 */
async function stop() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
}

module.exports = { start, stop };
