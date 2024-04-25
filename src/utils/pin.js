const bcrypt = require('bcrypt');

/**
 * Hash a plain text pin
 * @param {string} account_pin - The pin to be hashed
 * @returns {string}
 */
async function hashPin(account_pin) {
  const saltRounds = 16;
  const hashedPin = await new Promise((resolve, reject) => {
    bcrypt.hash(account_pin, saltRounds, (err, hash) => {
      if (err) {
        reject(err);
      } else {
        resolve(hash);
      }
    });
  });

  return hashedPin;
}

/**
 * Compares a plain text pin and its hashed to determine its equality
 * Mainly use for comparing login credentials
 * @param {string} account_pin - A plain text pin
 * @param {string} hashedPin - A hashed pin
 * @returns {boolean}
 */
async function pinMatched(account_pin, hashedPin) {
  return bcrypt.compareSync(account_pin, hashedPin);
}

module.exports = {
  hashPin,
  pinMatched,
};
