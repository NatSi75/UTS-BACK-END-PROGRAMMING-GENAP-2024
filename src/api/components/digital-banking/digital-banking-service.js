const digitalBankingRepository = require('./digital-banking-repository');
const { hashPin, pinMatched } = require('../../../utils/pin');
const { lowerCase } = require('lodash');

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

  // change field name to lower case and no space
  var search_filter = lowerCase(search_split_filter[0]).replace(/\s/g, '');

  // conditional field name
  if (search_filter == 'account_name') {
    checkName = true;
    accounts = await digitalBankingRepository.getAccountsName(
      page_number,
      page_size,
      sort_split,
      search_word
    );
  } else if (search_filter == 'account_email') {
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
  }

  if (page_size < page_number && checkName == true) {
    var total_pages = floor(totalAccountName / page_size) + 1;
  } else if (page_size < page_number && checkEmail == true) {
    var total_pages = floor(totalAccountEmail / page_size) + 1;
  }

  if (page_number > page_size) {
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
 * Check id and pin for action.
 * @param {string} id - Account ID
 * @param {string} account_pin - Account Pin
 * @returns {object}
 */
async function checkLoginCredentials(id, account_pin) {
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
  createNewAccount,
  deleteAccount,
  checkPin,
  changePin,
  nameIsRegistered,
  emailIsRegistered,
  idIsRegistered,
  checkLoginCredentials,
  withdrawMoney,
  depositMoney,
  getAccounts,
  getAccount,
  getAccountById,
  getAccountByName,
  transferMoney,
};
