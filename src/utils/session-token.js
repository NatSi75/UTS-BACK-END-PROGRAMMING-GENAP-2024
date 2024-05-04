const jwt = require('jsonwebtoken');

const config = require('../core/config');

/**
 * Sign and generate JWT token
 * @param {string} email - Email
 * @param {string} userId - User ID
 * @returns {string} Token
 */
function generateToken(email, userId) {
  // Sign the JWT token with user info and set the expiration date
  return jwt.sign(
    {
      email,
      userId,
    },
    config.secret.jwt,
    {
      expiresIn: config.secret.jwtExpiresIn,
    }
  );
}

/**
 * Sign and generate JWT token
 * @param {string} email - Account Email
 * @param {string} id - Account ID
 * @returns {string} Token
 */
function generateTokenAccount(email, id) {
  // Sign the JWT token with account info and set the expiration date
  return jwt.sign(
    {
      email,
      id,
    },
    config.secret.jwt,
    {
      expiresIn: config.secret.jwtExpiresIn,
    }
  );
}
module.exports = {
  generateToken,
  generateTokenAccount,
};
