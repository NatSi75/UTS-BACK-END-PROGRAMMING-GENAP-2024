const digitalBankingRepository = require('./digital-banking-repository');
const { hashPin, pinMatched } = require('../../../utils/pin');
const { generateTokenAccount } = require('../../../utils/session-token');
const { lowerCase, floor } = require('lodash');

/* PENERENAPAN SOAL NO.1 */
/**
 * Get list of accounts
 * @param {number} page_number - Page Number
 * @param {number} page_size - Page Size
 * @param {string} sort_nospace - Sort No Space
 * @param {string} search - Search
 * @param {string} search_nospace - Search No Space
 * @returns {Array}
 */
async function getAccounts(
  page_number,
  page_size,
  sort_nospace,
  search,
  search_nospace
) {
  var accounts;
  var tempPage_number = page_number;

  // Variable check
  var checkName = false;
  var checkEmail = false;

  // 'email:test' to ['email','test']
  var sort_split = sort_nospace.split(':');
  var search_word = search.split(':');
  var search_split_filter = search_nospace.split(':');

  // change asc to 1 or desc to -1
  if (sort_split[1] == 'asc') {
    sort_split[1] = 1;
  } else if (sort_split[1] == 'desc') {
    sort_split[1] = -1;
  }

  // conditional field name
  if (search_split_filter[0] == 'account_name') {
    checkName = true;
    accounts = await digitalBankingRepository.getAccountsName(
      page_number,
      page_size,
      sort_split,
      search_word
    );
  } else if (search_split_filter[0] == 'account_email') {
    checkEmail = true;
    accounts = await digitalBankingRepository.getAccountsEmail(
      page_number,
      page_size,
      sort_split,
      search_word
    );
  } else {
    // jika search tidak diisi
    accounts = await digitalBankingRepository.getAccounts(
      page_number,
      page_size,
      sort_split
    );
  }

  // Get total user (document) in collection 'accounts'
  const totalDocuments = await digitalBankingRepository.getCountAccounts();
  const totalAccountName =
    await digitalBankingRepository.getCountAccountsName(search_word);
  const totalAccountEmail =
    await digitalBankingRepository.getCountAccountsEmail(search_word);

  // Create variable and set value total pages
  if (
    (page_number > page_size && page_size == 0) ||
    (page_number == 0 && page_size == 0)
  ) {
    var total_pages = 1;
  } else if (page_size > page_number && checkName == true) {
    var total_pages = floor(totalAccountName / page_size) + 1;
  } else if (page_size > page_number && checkEmail == true) {
    var total_pages = floor(totalAccountEmail / page_size) + 1;
  } else if (page_size < page_number && checkName == true) {
    var total_pages = floor(totalAccountName / page_size) + 1;
  } else if (page_size < page_number && checkEmail == true) {
    var total_pages = floor(totalAccountEmail / page_size) + 1;
  } else if (page_number > page_size) {
    var total_pages = floor(totalDocuments / page_size) + 1;
  } else if (page_number < page_size) {
    var total_pages = floor(totalDocuments / page_size) + 1;
  }

  // Create variable and set value page_number_result & page_size_result for the result
  var page_number_result = page_number;
  var page_size_result = page_size;
  if (
    (page_size == 0 && page_number > page_size) ||
    page_number == 1 ||
    page_number == 0
  ) {
    page_number_result = 1;
    page_size_result = accounts.length;
  } else if (page_number == 0 && page_size > page_number) {
    page_number_result = 1;
  }

  // Set new value for page_number
  if (page_number == 0) {
    page_number += 1;
  }

  // Create variable and set value has_next_page & has_previous_page
  if (total_pages > page_number) {
    var has_next_page = true;
  } else {
    var has_next_page = false;
  }

  if (page_number > 1 && page_number <= total_pages) {
    var has_previous_page = true;
  } else {
    var has_previous_page = false;
  }

  // Set value result
  const results = [];
  var data = [];
  var mod = accounts.length % page_size;
  var iterator = 0;
  if (tempPage_number == 0 && page_number == 1 && page_size > page_number) {
    // jika page_number tidak diisi dan page_size diisi
    // maka akan menampilkan semua halaman / semua data
    for (let j = 0; j < total_pages - 1; j += 1) {
      if (total_pages > page_number) {
        var has_next_page = true;
      } else {
        var has_next_page = false;
      }

      if (page_number > 1 && page_number <= total_pages) {
        var has_previous_page = true;
      } else {
        var has_previous_page = false;
      }

      results.push({
        page_number: page_number,
        page_size: page_size,
        count: page_size,
        total_pages: total_pages,
        has_previous_page: has_previous_page,
        has_next_page: has_next_page,
      });

      for (let k = 0; k < page_size; k += 1) {
        const account = accounts[iterator];
        iterator++;
        data.push({
          id: account.id,
          account_name: account.account_name,
          account_email: account.account_email,
        });
      }

      results.push({
        data: data,
      });
      data = [];
      page_number++;
    }

    if (total_pages > page_number) {
      var has_next_page = true;
    } else {
      var has_next_page = false;
    }

    if (page_number > 1 && page_number <= total_pages) {
      var has_previous_page = true;
    } else {
      var has_previous_page = false;
    }

    results.push({
      page_number: page_number,
      page_size: page_size,
      count: mod,
      total_pages: total_pages,
      has_previous_page: has_previous_page,
      has_next_page: has_next_page,
    });

    for (let i = 0; i < mod; i++) {
      const account = accounts[iterator];
      iterator++;
      data.push({
        id: account.id,
        account_name: account.account_name,
        account_email: account.account_email,
      });
    }

    results.push({
      data: data,
    });
  } else {
    for (let l = 0; l < accounts.length; l += 1) {
      const account = accounts[l];
      data.push({
        id: account.id,
        account_name: account.account_name,
        account_email: account.account_email,
      });
    }

    // Set result
    results.push({
      page_number: page_number_result,
      page_size: page_size_result,
      count: accounts.length,
      total_pages: total_pages,
      has_previous_page: has_previous_page,
      has_next_page: has_next_page,
      data: data,
    });
  }

  return results;
}

/* PENERENAPAN SOAL NO.2 */
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
 * Create email with hours & minutes in list blocks
 * @param {string} email - Email
 * @param {number} hours - Hours
 * @param {number} minutes - Minutes
 * @returns {boolean}
 */
async function createBlock(email, hours, minutes) {
  const success = await digitalBankingRepository.createEmail(
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
 * Get detail email in list block
 * @param {string} email - Email
 * @returns {object}
 */
function getDetailEmailBlock(email) {
  const account = digitalBankingRepository.getEmail(email);
  if (account) {
    return account;
  } else {
    return null;
  }
}

/**
 * Check email
 * @param {string} email - Email
 * @returns {boolean}
 */
async function checkEmail(email) {
  const account = await digitalBankingRepository.getAccountByEmail(email);

  if (account) {
    return true;
  } else {
    return false;
  }
}

/**
 * Check account email in list block
 * @param {string} email - Email
 * @returns {boolean}
 */
async function checkBlock(email) {
  //Apakah user yang sedang login ada di list block
  const accountBlock = await digitalBankingRepository.getEmail(email);
  if (!accountBlock) {
    return false;
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
  const success = await digitalBankingRepository.deleteEmail(email);
  if (!success) {
    return null;
  } else {
    return true;
  }
}

/**
 * Check email and pin for login.
 * @param {string} account_email - Email
 * @param {string} account_pin - Pin
 * @returns {object} An object containing, among others, the JWT token if the email and password are matched. Otherwise returns null.
 */
async function checkLoginCredentials(account_email, account_pin) {
  const account =
    await digitalBankingRepository.getAccountByEmail(account_email);
  const accountPassword = account
    ? account.account_pin
    : '<RANDOM_PASSWORD_FILLER>';
  const pinChecked = await pinMatched(account_pin, accountPassword);
  if (account && pinChecked) {
    return {
      email: account.account_email,
      name: account.account_name,
      account_id: account.id,
      token: generateTokenAccount(account.account_email, account.id),
    };
  }
  return null;
}

/* PENERENAPAN SOAL NO.3 */
/**
 * Get details account
 * @param {string} id - Account ID
 * @returns {boolean}
 */
async function getAccount(id) {
  const account = await digitalBankingRepository.getAccount(id);
  const data = [];
  if (account) {
    data.push({
      id: account.id,
      account_name: account.account_name,
      account_email: account.account_email,
      balance: account.balance,
    });
    return data;
  }

  return false;
}

/**
 * Check account by id
 * @param {string} id - Account ID
 * @returns {boolean}
 */
async function getAccountById(id) {
  try {
    await digitalBankingRepository.getAccount(id);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Check account by name
 * @param {string} account_name - Account Name
 * @returns {boolean}
 */
async function getAccountByName(account_name) {
  try {
    await digitalBankingRepository.getAccountByName(account_name);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Create new account
 * @param {string} account_name - Account Name
 * @param {string} account_email - Account Email
 * @param {number} balance - Balance
 * @param {string} account_pin - Account Pin
 * @returns {boolean}
 */
async function createNewAccount(
  account_name,
  account_email,
  balance,
  account_pin
) {
  // Hash pin
  const hashedPin = await hashPin(account_pin);

  try {
    await digitalBankingRepository.createNewAccount(
      account_name,
      account_email,
      balance,
      hashedPin
    );
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete account
 * @param {string} id - Account ID
 * @returns {boolean}
 */
async function deleteAccount(id) {
  const account = await digitalBankingRepository.getAccount(id);

  // Account not found
  if (!account) {
    return null;
  }

  try {
    await digitalBankingRepository.deleteAccount(id);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Check whether the account name is registered
 * @param {string} account_name - Account Name
 * @returns {boolean}
 */
async function nameIsRegistered(account_name) {
  const account = await digitalBankingRepository.getAccountByName(account_name);

  if (account) {
    return true;
  }

  return false;
}

/**
 * Check whether the account email is registered
 * @param {string} account_email - Account Email
 * @returns {boolean}
 */
async function emailIsRegistered(account_email) {
  const account =
    await digitalBankingRepository.getAccountByEmail(account_email);

  if (account) {
    return true;
  }

  return false;
}

/**
 * Check whether the account id is registered
 * @param {string} id - Account ID
 * @returns {boolean}
 */
async function idIsRegistered(id) {
  const account = await digitalBankingRepository.getAccount(id);

  if (account) {
    return true;
  }

  return false;
}

/**
 * Check whether the pin is correct
 * @param {string} id - Account ID
 * @param {string} account_pin - Account Pin Old
 * @returns {boolean}
 */
async function checkPin(id, account_pin) {
  const account = await digitalBankingRepository.getAccount(id);
  return pinMatched(account_pin, account.account_pin);
}

/**
 * Change account pin
 * @param {string} id - Account ID
 * @param {string} account_pin_new - New Account Pin
 * @returns {boolean}
 */
async function changePin(id, account_pin_new) {
  const account = await digitalBankingRepository.getAccount(id);

  // Check if account not found
  if (!account) {
    return null;
  }

  const hashedPin = await hashPin(account_pin_new);

  const changeSuccess = await digitalBankingRepository.changePin(id, hashedPin);

  if (!changeSuccess) {
    return null;
  }

  return true;
}

/**
 * Check id and pin for action.
 * @param {string} id - Account ID
 * @param {string} account_pin - Account Pin
 * @returns {object}
 */
async function checkPinCredentials(id, account_pin) {
  const account = await digitalBankingRepository.getAccount(id);

  const accountPin = account ? account.account_pin : '<RANDOM_PASSWORD_FILLER>';
  const pinChecked = await pinMatched(account_pin, accountPin);

  if (account && pinChecked) {
    return true;
  }

  return null;
}

/**
 * Withdraw money account
 * @param {string} id - Account ID
 * @param {string} balance - Balance
 * @returns {boolean}
 */
async function withdrawMoney(id, balance) {
  const account = await digitalBankingRepository.getAccount(id);

  // Account not found
  if (!account) {
    return null;
  }

  var new_balance = account.balance - balance;

  try {
    await digitalBankingRepository.updateAccount(id, new_balance);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * deposit money account
 * @param {string} id - Account ID
 * @param {string} balance - Balance
 * @returns {boolean}
 */
async function depositMoney(id, balance) {
  const account = await digitalBankingRepository.getAccount(id);

  // Account not found
  if (!account) {
    return null;
  }

  var new_balance = account.balance + balance;

  try {
    await digitalBankingRepository.updateAccount(id, new_balance);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Transfer Money
 * @param {string} id - Account ID
 * @param {string} account_name_receiver - Account Name Receiver
 * @param {string} balance - Amount of money
 * @returns {boolean}
 */
async function transferMoney(id, account_name_receiver, balance) {
  const account_sender = await digitalBankingRepository.getAccount(id);
  const account_receiver = await digitalBankingRepository.getAccountByName(
    account_name_receiver
  );

  if (!account_receiver) {
    return null;
  }

  var new_balance_sender = account_sender.balance - balance;
  var new_balance_receiver = account_receiver.balance + balance;

  const changeAccountSender = await digitalBankingRepository.updateAccountById(
    id,
    new_balance_sender
  );

  const changeAccountReceiver =
    await digitalBankingRepository.updateAccountByName(
      account_name_receiver,
      new_balance_receiver
    );

  if (!changeAccountSender) {
    return null;
  } else if (!changeAccountReceiver) {
    return null;
  }

  return true;
}

module.exports = {
  /* PENERENAPAN SOAL NO.1 */
  getAccounts,

  /* PENERENAPAN SOAL NO.2 */
  attemptLogin,
  createBlock,
  getDetailEmailBlock,
  checkEmail,
  checkBlock,
  deleteBlock,
  checkLoginCredentials,

  /* SOAL NO.3 */
  getAccount,
  getAccountById,
  getAccountByName,
  createNewAccount,
  deleteAccount,
  nameIsRegistered,
  emailIsRegistered,
  idIsRegistered,
  checkPin,
  changePin,
  checkPinCredentials,
  withdrawMoney,
  depositMoney,
  transferMoney,
};
