const digitalBankingRepository = require('./digital-banking-repository');
const { hashPin, pinMatched } = require('../../../utils/pin');
const {
  hashAccessCode,
  accessCodeMatched,
} = require('../../../utils/access-code');
const { generateTokenAccount } = require('../../../utils/session-token');
const { floor } = require('lodash');

/* PENERENAPAN SOAL NO.1 */
/**
 * Get list of accounts
 * @param {number} page_number - Page Number
 * @param {number} page_size - Page Size
 * @param {string} sort - Sort
 * @param {string} search - Search
 * @returns {Object}
 */
async function getAccounts(page_number, page_size, sort, search) {
  // Split to array with 2 index [0] and [1]
  sort = sort.split(':');
  search = search.split(':');

  const accounts = await digitalBankingRepository.getAccountsPagination(
    page_number,
    page_size,
    search,
    sort
  );

  // Get total account (document) in collection 'accounts'
  const documents = await digitalBankingRepository.getCountAccounts();
  const documentsSearch =
    await digitalBankingRepository.getCountAccountsSearch(search);
  const totalDocuments = floor(documents / page_size);
  const totalDocumentsSearch = floor(documentsSearch / page_size);

  // Create variable and set value total pages
  if (
    (page_number > page_size && page_size == 0) ||
    (page_number == 0 && page_size == 0)
  ) {
    var total_pages = 1;
  } else {
    if (sort[0].length > 0) {
      if (totalDocumentsSearch == documentsSearch) {
        var total_pages = totalDocumentsSearch;
      } else {
        var total_pages = totalDocumentsSearch + 1;
      }
    } else {
      if (totalDocuments == documents) {
        var total_pages = totalDocuments;
      } else {
        var total_pages = totalDocuments + 1;
      }
    }
  }

  // Create variable and set value page_number_result & page_size_result for the result
  var tempPage_number = page_number;
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

  // Set value result
  const results = [];
  var data = [];
  if (tempPage_number == 0 && page_number == 1 && page_size > page_number) {
    var mod = accounts.length % page_size;
    var iterator = 0;
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
          account_number: account.account_number,
          name: account.name,
          email: account.email,
          ktp: account.ktp,
          phone_number: account.phone_number,
          balance: account.balance,
          created_at: account.created,
        });
      }

      results.push({
        data: data,
      });
      data = [];
      page_number++;
    }

    if (mod > 0) {
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
          account_number: account.account_number,
          name: account.name,
          email: account.email,
          ktp: account.ktp,
          phone_number: account.phone_number,
          balance: account.balance,
          created_at: account.created,
        });
      }

      results.push({
        data: data,
      });
    }
  } else {
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

    for (let l = 0; l < accounts.length; l += 1) {
      const account = accounts[l];
      data.push({
        id: account.id,
        account_number: account.account_number,
        name: account.name,
        email: account.email,
        ktp: account.ktp,
        phone_number: account.phone_number,
        balance: account.balance,
        created_at: account.created,
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
 * Check email and access code for login.
 * @param {string} email - Email
 * @param {string} access_code - Access Code
 * @returns {Array} An object containing, among others, the JWT token if the email and password are matched. Otherwise returns null.
 */
async function checkLoginCredentials(email, access_code) {
  const account = await digitalBankingRepository.getAccountByEmail(email);
  const accountPassword = account
    ? account.access_code
    : '<RANDOM_PASSWORD_FILLER>';
  const accessCodeChecked = await accessCodeMatched(
    access_code,
    accountPassword
  );
  if (account && accessCodeChecked) {
    return {
      id: account.id,
      name: account.name,
      email: account.email,
      token: generateTokenAccount(account.email, account.id),
    };
  }
  return null;
}

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
 * String error login
 * @param {string} account_email -Account Email
 * @param {number} attempt - Attempt
 * @param {boolean} condition - Condition
 * @returns {string}
 */
function stringErrorLogin(account_email, attempt, condition) {
  var time = getDate();
  if (condition == true) {
    return `[${time[0].year}-${time[1].month}-${time[2].date} ${time[3].hours}:${time[4].minutes}:${time[5].seconds}] Account ${account_email} mencoba login. Namun karena mendapat error 403 karena telah melebihi batas limit.`;
  } else {
    return `[${time[0].year}-${time[1].month}-${time[2].date} ${time[3].hours}:${time[4].minutes}:${time[5].seconds}] Account ${account_email} gagal login. Attempt = ${attempt}`;
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
 * Check account email in list block
 * @param {string} email - Email
 * @returns {boolean}
 */
async function checkBlock(email) {
  //Apakah email account yang sedang login ada di list block
  const accountBlock = await digitalBankingRepository.getEmail(email);
  if (!accountBlock) {
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
  const account = digitalBankingRepository.getEmail(email);
  if (account) {
    return account;
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
  const success = await digitalBankingRepository.deleteEmail(email);
  if (!success) {
    return null;
  } else {
    return true;
  }
}

/* SOAL NO.3 */
/**
 * Get details account
 * @param {string} id - Account ID
 * @returns {Array}
 */
async function getAccount(id) {
  const account = await digitalBankingRepository.getAccount(id);
  const data = [];
  if (account) {
    data.push({
      account_number: account.account_number,
      name: account.name,
      email: account.email,
      phone_number: account.phone_number,
      balance: account.balance,
    });
    return data;
  }

  return null;
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
    return false;
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
 * Check account by account number
 * @param {string} account_number - Account Number Receiver
 * @returns {boolean}
 */
async function getAccountByAccountNumber(account_number) {
  try {
    await digitalBankingRepository.getAccountByAccountNumber(account_number);
  } catch (err) {
    return false;
  }
  return true;
}

/**
 * Create new account
 * @param {string} account_number - Account Number
 * @param {string} name - Account Name
 * @param {string} email - Account Email
 * @param {Object} ktp - KTP
 * @param {string} phone_number - Phone Number
 * @param {number} balance - Balance
 * @param {string} pin - Account Pin
 * @param {string} access_code - Access Code
 * @returns {boolean}
 */
async function createNewAccount(
  account_number,
  name,
  email,
  ktp,
  phone_number,
  balance,
  pin,
  access_code
) {
  // Hash pin
  const hashedPin = await hashPin(pin);

  // Hash access code
  const hashedAccessCode = await hashAccessCode(access_code);

  try {
    await digitalBankingRepository.createNewAccount(
      account_number,
      name,
      email,
      ktp,
      phone_number,
      balance,
      hashedPin,
      hashedAccessCode
    );
  } catch (err) {
    return false;
  }

  return true;
}

var account_number_start = '000';
/**
 * Create account number
 * @returns {string}
 */
async function createAccountNumber() {
  const totalAccounts = (await digitalBankingRepository.getCountAccounts()) + 1;
  const stringTotalAccounts = totalAccounts.toString();

  if (totalAccounts > 0) {
    if (totalAccounts > 9) {
      account_number_start = '00';
    } else if (totalAccounts > 99) {
      account_number_start = '0';
    } else if (totalAccounts > 999) {
      account_number_start = '';
    }
    return account_number_start.concat(stringTotalAccounts);
  } else {
    return account_number_start.concat('1');
  }
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
 * @param {string} name - Account Name
 * @returns {boolean}
 */
async function nameIsRegistered(name) {
  const account = await digitalBankingRepository.getAccountByName(name);

  if (account) {
    return true;
  }

  return false;
}

/**
 * Check whether the account email is registered
 * @param {string} email - Account Email
 * @returns {boolean}
 */
async function emailIsRegistered(email) {
  const account = await digitalBankingRepository.getAccountByEmail(email);

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
 * @param {string} pin - Account Pin Old
 * @returns {boolean}
 */
async function checkPin(id, pin) {
  const account = await digitalBankingRepository.getAccount(id);
  if (account) {
    return pinMatched(pin, account.pin);
  } else {
    return false;
  }
}

/**
 * Change pin
 * @param {string} id - Account ID
 * @param {string} pin_new - New Account Pin
 * @returns {boolean}
 */
async function changePin(id, pin_new) {
  const account = await digitalBankingRepository.getAccount(id);

  // Check if account not found
  if (!account) {
    return null;
  }

  const hashedPin = await hashPin(pin_new);

  const changeSuccess = await digitalBankingRepository.changePin(id, hashedPin);

  if (!changeSuccess) {
    return null;
  }

  return true;
}

/**
 * Check whether the access code is correct
 * @param {string} id - Account ID
 * @param {string} access_code - Account Access Code Old
 * @returns {boolean}
 */
async function checkAccessCode(id, access_code) {
  const account = await digitalBankingRepository.getAccount(id);
  if (account) {
    return accessCodeMatched(access_code, account.access_code);
  } else {
    return false;
  }
}

/**
 * Change access code
 * @param {string} id - Account ID
 * @param {string} access_code - New Access Code
 * @returns {boolean}
 */
async function changeAccessCode(id, access_code) {
  const account = await digitalBankingRepository.getAccount(id);

  // Check if account not found
  if (!account) {
    return false;
  }

  const hashedAccessCode = await hashAccessCode(access_code);

  const changeSuccess = await digitalBankingRepository.changeAccessCode(
    id,
    hashedAccessCode
  );

  if (!changeSuccess) {
    return false;
  }

  return true;
}

/**
 * Change profile
 * @param {string} id - Account ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} phone_number - Phone Number
 * @returns {boolean}
 */
async function changeProfile(id, name, email, phone_number) {
  const account = await digitalBankingRepository.getAccount(id);

  // Check if account not found
  if (!account) {
    return false;
  }

  const changeSuccess = await digitalBankingRepository.changeProfile(
    id,
    name,
    email,
    phone_number
  );

  if (!changeSuccess) {
    return false;
  }

  return true;
}

/**
 * Check id and pin for action.
 * @param {string} id - Account ID
 * @param {string} pin - Account Pin
 * @returns {boolean}
 */
async function checkPinCredentials(id, pin) {
  const account = await digitalBankingRepository.getAccount(id);

  const accountPin = account ? account.pin : '<RANDOM_PASSWORD_FILLER>';
  const pinChecked = await pinMatched(pin, accountPin);

  if (account && pinChecked) {
    return true;
  }

  return false;
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
    await digitalBankingRepository.updateAccountById(id, new_balance);
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
    await digitalBankingRepository.updateAccountById(id, new_balance);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Transfer Money
 * @param {string} id - Account ID
 * @param {string} account_number - Account Number Receiver
 * @param {string} balance - Amount of money
 * @returns {boolean}
 */
async function transferMoney(id, account_number, balance) {
  const account_sender = await digitalBankingRepository.getAccount(id);
  const account_receiver =
    await digitalBankingRepository.getAccountByAccountNumber(account_number);

  if (!account_receiver) {
    return false;
  }

  var new_balance_sender = account_sender.balance - balance;
  var new_balance_receiver = account_receiver.balance + balance;

  const changeAccountSender = await digitalBankingRepository.updateAccountById(
    id,
    new_balance_sender
  );

  const changeAccountReceiver =
    await digitalBankingRepository.updateAccountByNumberAccount(
      account_number,
      new_balance_receiver
    );

  if (!changeAccountSender) {
    return false;
  } else if (!changeAccountReceiver) {
    return false;
  }

  return true;
}

/**
 * History Transaction for withdraw money and deposit money
 * @param {string} id - Account ID
 * @param {string} balance - Amount of money
 * @param {string} type - Type
 * @param {Array} date - Date
 * @returns {boolean}
 */
async function transaction(id, balance, type, date) {
  const dateString = `${date[2].date}/${date[1].month}/${date[0].year}`;
  if (type == 'Deposit Money') {
    var condition = true;
  } else {
    var condition = false;
  }
  const success = await digitalBankingRepository.updateAccountTransactionById(
    id,
    balance,
    type,
    dateString,
    condition
  );
  if (success) {
    return true;
  } else {
    return false;
  }
}

/**
 * History Transaction for transfer money
 * @param {string} id - Account ID
 * @param {string} account_number - Account Number Receiver
 * @param {string} balance - Amount of money
 * @param {string} type - Type
 * @param {Array} date - Date
 * @returns {boolean}
 */
async function transactionTransferMoney(
  id,
  account_number,
  balance,
  type,
  date
) {
  const dateString = `${date[2].date}/${date[1].month}/${date[0].year}`;
  const successSender =
    await digitalBankingRepository.updateAccountTransactionById(
      id,
      balance,
      type,
      dateString,
      false
    );
  const successReceiver =
    await digitalBankingRepository.updateAccountTransactionByAccountNumber(
      account_number,
      balance,
      type,
      dateString
    );
  if (successSender && successReceiver) {
    return true;
  } else {
    return false;
  }
}

/**
 * Get history transaction
 * @param {string} id - Account ID
 * @returns {Object}
 */
async function historyTransaction(id) {
  const account = await digitalBankingRepository.getAccount(id);
  return account.transaction;
}

/**
 * Delete history transaction
 * @param {string} id - Account ID
 * @returns {boolean}
 */
async function deleteHistoryTransaction(id) {
  const account = await digitalBankingRepository.getAccount(id);

  // Account not found
  if (!account) {
    return false;
  }

  try {
    await digitalBankingRepository.deleteHistoryTransaction(id);
  } catch (err) {
    return false;
  }

  return true;
}

module.exports = {
  /* PENERENAPAN SOAL NO.1 */
  getAccounts,

  /* PENERENAPAN SOAL NO.2 */
  checkEmail,
  checkLoginCredentials,
  getDate,
  attemptLogin,
  stringErrorLogin,
  createBlock,
  checkBlock,
  getDetailEmailBlock,
  deleteBlock,

  /* SOAL NO.3 */
  getAccount,
  getAccountById,
  getAccountByName,
  getAccountByAccountNumber,
  createNewAccount,
  createAccountNumber,
  deleteAccount,
  nameIsRegistered,
  emailIsRegistered,
  idIsRegistered,
  checkPin,
  changePin,
  checkAccessCode,
  changeAccessCode,
  changeProfile,
  checkPinCredentials,
  withdrawMoney,
  depositMoney,
  transferMoney,
  transaction,
  transactionTransferMoney,
  historyTransaction,
  deleteHistoryTransaction,
};
