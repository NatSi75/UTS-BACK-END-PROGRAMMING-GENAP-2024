const authenticationRepository = require('./authentication-repository');
const { generateToken } = require('../../../utils/session-token');
const { passwordMatched } = require('../../../utils/password');

// Variable for function attempt login
var iterator = 1;

/**
 * Check user email in list block
 * @param {string} email - Email
 * @returns {boolean}
 */
async function checkBlock(email) {
  //Apakah user yang sedang login ada di list block
  const userBlock = await authenticationRepository.getEmail(email);
  if (!userBlock) {
    return false;
  } else {
    return true;
  }
}

/**
 * Create email with hours & minutes in list blocks
 * @param {string} email - Email
 * @param {number} hours - Hours
 * @param {number} minutes - Minutes
 * @returns {boolean}
 */
async function createBlock(email, hours, minutes) {
  const success = await authenticationRepository.createEmail(
    email,
    hours,
    minutes
  );
  if (!success) {
    return null;
  } else {
    return true;
  }
}

/**
 * Delete email in list blocks
 * @param {string} email - Email
 * @returns {boolean}
 */
async function deleteBlock(email) {
  const success = await authenticationRepository.deleteEmail(email);
  if (!success) {
    return null;
  } else {
    return true;
  }
}

/**
 * Attempt for login.
 * @returns {Array}
 */
function attemptLogin() {
  var temp = iterator;
  var dateTime = new Date();
  var hours = dateTime.getHours();
  var minutes = dateTime.getMinutes();
  if (iterator == 5) {
    iterator = 0;
    minutes = dateTime.getMinutes() + 30;
    if (minutes > 60) {
      hours = hours + 1;
      minutes = minutes - 60;
    }
  }

  iterator += 1;
  const data = [];
  data.push(
    {
      temp,
    },
    {
      hours,
    },
    {
      minutes,
    }
  );
  return data;
}

/**
 * Check username and password for login.
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {object} An object containing, among others, the JWT token if the email and password are matched. Otherwise returns null.
 */
async function checkLoginCredentials(email, password) {
  const user = await authenticationRepository.getUserByEmail(email);
  const userPassword = user ? user.password : '<RANDOM_PASSWORD_FILLER>';
  const passwordChecked = await passwordMatched(password, userPassword);
  if (user && passwordChecked) {
    return {
      email: user.email,
      name: user.name,
      user_id: user.id,
      token: generateToken(user.email, user.id),
    };
  }
  return null;
}

/**
 * Check email
 * @param {string} email - Email
 * @returns {boolean}
 */
async function checkEmail(email) {
  const user = await authenticationRepository.getUserByEmail(email);

  if (user) {
    return true;
  } else {
    return false;
  }
}

/**
 * Get detail email in list block
 * @param {string} email - Email
 * @returns {object}
 */
function getDetailEmailBlock(email) {
  const user = authenticationRepository.getEmail(email);
  if (user) {
    return user;
  } else {
    return null;
  }
}

module.exports = {
  checkLoginCredentials,
  checkBlock,
  createBlock,
  deleteBlock,
  checkEmail,
  attemptLogin,
  getDetailEmailBlock,
};
