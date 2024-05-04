const authenticationRepository = require('./authentication-repository');
const { generateToken } = require('../../../utils/session-token');
const { passwordMatched } = require('../../../utils/password');

/**
 * Get date now
 * @returns {Array}
 */
function getDate() {
  var time = new Date();
  var year = time.getFullYear();
  var month = time.getMonth() + 1;
  var date = time.getDate();
  var hours = time.getHours();
  var minutes = time.getMinutes();
  var seconds = time.getSeconds();
  const data = [];
  data.push(
    {
      year,
    },
    {
      month,
    },
    {
      date,
    },
    {
      hours,
    },
    {
      minutes,
    },
    {
      seconds,
    }
  );
  return data;
}

// Variable for function attempt login
var iterator = 1;
/**
 * Attempt for login.
 * @param {boolean} condition_addition -Condition
 * @param {boolean} condition_reset -Condition Reset
 * @returns {Array}
 */
function attemptLogin(condition_addition, condition_reset) {
  if (condition_reset == true) {
    iterator = 1;
  }
  var temp = iterator;
  var dateTime = new Date();
  var hours = dateTime.getHours();
  var minutes = dateTime.getMinutes();
  if (iterator == 5) {
    iterator = 1;
    minutes = dateTime.getMinutes() + 30;
    if (minutes > 60) {
      hours = hours + 1;
      minutes = minutes - 60;
    }
  }

  if (condition_addition == true) {
    iterator += 1;
  }

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
 * String error login
 * @param {string} email - Email
 * @param {number} attempt - Attempt
 * @param {boolean} condition - Condition
 * @returns {string}
 */
function stringErrorLogin(email, attempt, condition) {
  var time = getDate();
  if (condition == true) {
    return `[${time[0].year}-${time[1].month}-${time[2].date} ${time[3].hours}:${time[4].minutes}:${time[5].seconds}] User ${email} mencoba login. Namun karena mendapat error 403 karena telah melebihi batas limit.`;
  } else {
    return `[${time[0].year}-${time[1].month}-${time[2].date} ${time[3].hours}:${time[4].minutes}:${time[5].seconds}] User ${email} gagal login. Attempt = ${attempt}`;
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
    return false;
  } else {
    return true;
  }
}

/**
 * Check email in list block
 * @param {string} email - Email
 * @returns {boolean}
 */
async function checkBlock(email) {
  //Apakah email yang sedang login ada di list block
  const userBlock = await authenticationRepository.getEmail(email);
  if (!userBlock) {
    return false;
  } else {
    return true;
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

/**
 * Delete email in list blocks
 * @param {string} email - Email
 * @returns {boolean}
 */
async function deleteBlock(email) {
  const success = await authenticationRepository.deleteEmail(email);
  if (!success) {
    return false;
  } else {
    return true;
  }
}

module.exports = {
  getDate,
  attemptLogin,
  checkLoginCredentials,
  stringErrorLogin,
  createBlock,
  checkBlock,
  getDetailEmailBlock,
  deleteBlock,
};
