const { User, Block } = require('../../../models');

/**
 * Get user by email for login information
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
  return User.findOne({ email });
}

/**
 * Create email with hours & minutes in list block
 * @param {string} email - Email
 * @param {number} hours - Hours
 * @param {number} minutes - Minutes
 * @returns {Promise}
 */
async function createEmail(email, hours, minutes) {
  return Block.create({
    email,
    hours,
    minutes,
  });
}

/**
 * Get account by email to prevent duplicate email
 * @param {string} email - Account Email
 * @returns {Promise}
 */
async function getEmail(email) {
  return Block.findOne({ email });
}

/**
 * Delete email in list block
 * @param {string} email - Email
 * @returns {Promise}
 */
async function deleteEmail(email) {
  return Block.deleteOne({ email: email });
}

module.exports = {
  getUserByEmail,
  createEmail,
  getEmail,
  deleteEmail,
};
