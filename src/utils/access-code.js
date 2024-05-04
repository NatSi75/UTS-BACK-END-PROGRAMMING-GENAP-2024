const bcrypt = require('bcrypt');

/**
 * Hash a plain text access code
 * @param {string} access_code - The access code to be hashed
 * @returns {string}
 */
async function hashAccessCode(access_code) {
  const saltRounds = 16;
  const hashedAccessCode = await new Promise((resolve, reject) => {
    bcrypt.hash(access_code, saltRounds, (err, hash) => {
      if (err) {
        reject(err);
      } else {
        resolve(hash);
      }
    });
  });

  return hashedAccessCode;
}

/**
 * Compares a plain text pin and its hashed to determine its equality
 * Mainly use for comparing login credentials
 * @param {string} access_code - A plain text access code
 * @param {string} hashedAccessCode - A hashed access code
 * @returns {boolean}
 */
async function accessCodeMatched(access_code, hashedAccessCode) {
  return bcrypt.compareSync(access_code, hashedAccessCode);
}

module.exports = {
  hashAccessCode,
  accessCodeMatched,
};
