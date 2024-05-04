const { Account, Block } = require('../../../models');

/* PENERENAPAN SOAL NO.1 */
/**
 * Get a list of accounts with pagination
 * @param {number} page_number - Page Number
 * @param {number} page_size - Page Size
 * @param {string} search - Search
 * @param {string} sort - Sort
 * @returns {Promise}
 */
async function getAccountsPagination(page_number, page_size, search, sort) {
  if (
    search[0].length > 0 &&
    search[1].length > 0 &&
    page_number > 0 &&
    page_size > 0
  ) {
    var results = Account.find({
      $or: [
        { account_number: { $regex: search[1] } },
        { name: { $regex: search[1] } },
        { email: { $regex: search[1] } },
        { 'ktp.nik': { $regex: search[1] } },
        { 'ktp.place_ob': { $regex: search[1] } },
        { 'ktp.date_ob': { $regex: search[1] } },
        { 'ktp.gender': { $regex: search[1] } },
        { 'ktp.blood_type': { $regex: search[1] } },
        { 'ktp.address': { $regex: search[1] } },
        { phone_number: { $regex: search[1] } },
      ],
    })
      .sort([sort])
      .skip((page_number - 1) * page_size)
      .limit(page_size);
  } else if (
    search[0].length > 0 &&
    search[1].length > 0 &&
    ((page_number == 0 && page_size == 0) || page_number > 0 || page_size > 0)
  ) {
    var results = Account.find({
      $or: [
        { account_number: { $regex: search[1] } },
        { name: { $regex: search[1] } },
        { email: { $regex: search[1] } },
        { 'ktp.nik': { $regex: search[1] } },
        { 'ktp.place_ob': { $regex: search[1] } },
        { 'ktp.date_ob': { $regex: search[1] } },
        { 'ktp.gender': { $regex: search[1] } },
        { 'ktp.blood_type': { $regex: search[1] } },
        { 'ktp.address': { $regex: search[1] } },
        { phone_number: { $regex: search[1] } },
      ],
    }).sort([sort]);
  } else if (search[0].length > 0 && search[1].length > 0) {
    // jika hanya search yang diisi (sort & page_number & page_size tidak diisi)
    var results = Account.find({
      $or: [
        { account_number: { $regex: search[1] } },
        { name: { $regex: search[1] } },
        { email: { $regex: search[1] } },
        { 'ktp.nik': { $regex: search[1] } },
        { 'ktp.place_ob': { $regex: search[1] } },
        { 'ktp.date_ob': { $regex: search[1] } },
        { 'ktp.gender': { $regex: search[1] } },
        { 'ktp.blood_type': { $regex: search[1] } },
        { 'ktp.address': { $regex: search[1] } },
        { phone_number: { $regex: search[1] } },
      ],
    });
  } else if (page_number > 0 && page_size > 0) {
    var results = Account.find()
      .sort([sort])
      .skip((page_number - 1) * page_size)
      .limit(page_size);
  } else if (
    (page_number == 0 && page_size == 0) ||
    page_number > 0 ||
    page_size > 0
  ) {
    var results = Account.find().sort([sort]);
  } else {
    // jika page_number, page_size dan sort tidak diisi
    var results = Account.find();
  }

  return results;
}

/**
 * Get a list of accounts
 * @returns {Promise}
 */
async function getCountAccounts() {
  return Account.find().count();
}

/**
 * Get a total of accounts match search
 * @param {string} search
 * @returns {Promise}
 */
async function getCountAccountsSearch(search) {
  return Account.find({
    $or: [
      { account_number: { $regex: search[1] } },
      { name: { $regex: search[1] } },
      { email: { $regex: search[1] } },
      { 'ktp.nik': { $regex: search[1] } },
      { 'ktp.place_ob': { $regex: search[1] } },
      { 'ktp.date_ob': { $regex: search[1] } },
      { 'ktp.gender': { $regex: search[1] } },
      { 'ktp.blood_type': { $regex: search[1] } },
      { 'ktp.address': { $regex: search[1] } },
      { phone_number: { $regex: search[1] } },
    ],
  }).count();
}

/* PENERENAPAN SOAL NO.2 */
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

/* SOAL NO.3 */
/**
 * Create new account
 * @param {string} account_number - Account Number
 * @param {string} name - Account Name
 * @param {string} email - Account Email
 * @param {Object} ktp - KTP
 * @param {string} phone_number - Phone Number
 * @param {number} balance - Balance
 * @param {string} pin - Hashed Account Pin
 * @param {string} access_code - Hashed Access Code
 * @returns {Promise}
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
  return Account.create({
    account_number,
    name,
    email,
    ktp,
    phone_number,
    balance,
    pin,
    access_code,
  });
}

/**
 * Get account detail
 * @param {string} id - Account ID
 * @returns {Promise}
 */
async function getAccountById(id) {
  return Account.findById(id);
}

/**
 * Get account by name to prevent duplicate name
 * @param {string} name - Account Name
 * @returns {Promise}
 */
async function getAccountByName(name) {
  return Account.findOne({ name });
}

/**
 * Get account by email to prevent duplicate email
 * @param {string} email - Account Email
 * @returns {Promise}
 */
async function getAccountByEmail(email) {
  return Account.findOne({ email });
}

/**
 * Get account by account number
 * @param {string} account_number - Account Number
 * @returns {Promise}
 */
async function getAccountByAccountNumber(account_number) {
  return Account.findOne({ account_number });
}

/**
 * Update profile
 * @param {string} id - Account ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} phone_number - Phone Number
 * @returns {Promise}
 */
async function changeProfile(id, name, email, phone_number) {
  return Account.updateOne(
    { _id: id },
    {
      $set: {
        name,
        email,
        phone_number,
      },
    }
  );
}

/**
 * Update access code
 * @param {string} id - Account ID
 * @param {string} access_code - New Hashed Access Code
 * @returns {Promise}
 */
async function changeAccessCode(id, access_code) {
  return Account.updateOne({ _id: id }, { $set: { access_code } });
}

/**
 * Update pin
 * @param {string} id - Account ID
 * @param {string} pin - New Hashed Pin
 * @returns {Promise}
 */
async function changePin(id, pin) {
  return Account.updateOne({ _id: id }, { $set: { pin } });
}

/**
 * Update existing account by id
 * @param {string} id - Account ID
 * @param {string} balance - Balance
 * @returns {Promise}
 */
async function updateAccountById(id, balance) {
  return Account.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        balance,
      },
    }
  );
}

/**
 * Update existing account by account number
 * @param {string} account_number - Account Number
 * @param {string} balance - Balance
 * @returns {Promise}
 */
async function updateAccountByNumberAccount(account_number, balance) {
  return Account.updateOne(
    {
      account_number: account_number,
    },
    {
      $set: {
        balance,
      },
    }
  );
}

/**
 * Update existing account by id
 * @param {string} id - Account ID
 * @param {string} balance - Balance
 * @param {string} type - Type
 * @param {string} dateString - Date String
 * @param {boolean} condition - Plus or Minus
 * @returns {Promise}
 */
async function updateAccountTransactionById(
  id,
  balance,
  type,
  dateString,
  condition
) {
  if (condition == true) {
    var balanceUpdate = `+${balance}`;
  } else {
    var balanceUpdate = `-${balance}`;
  }
  return Account.updateOne(
    {
      _id: id,
    },
    {
      $push: {
        transaction: {
          date: dateString,
          type: type,
          balance: balanceUpdate,
        },
      },
    }
  );
}

/**
 * Update existing account by account number
 * @param {string} account_number - Account Number Receiver
 * @param {string} balance - Balance
 * @param {string} type - Type
 * @param {string} dateString - Date String
 * @returns {Promise}
 */
async function updateAccountTransactionByAccountNumber(
  account_number,
  balance,
  type,
  dateString
) {
  return Account.updateOne(
    {
      account_number: account_number,
    },
    {
      $push: {
        transaction: {
          date: dateString,
          type: type,
          balance: `+${balance}`,
        },
      },
    }
  );
}

/**
 * Delete history transaction
 * @param {string} id - Account ID
 * @returns {Promise}
 */
async function deleteHistoryTransaction(id) {
  return Account.updateOne(
    { _id: id },
    {
      $set: {
        transaction: [],
      },
    }
  );
}

/**
 * Delete a account
 * @param {string} id - Account ID
 * @returns {Promise}
 */
async function deleteAccount(id) {
  return Account.deleteOne({ _id: id });
}

module.exports = {
  /* PENERENAPAN SOAL NO.1 */
  getAccountsPagination,
  getCountAccounts,
  getCountAccountsSearch,

  /* PENERENAPAN SOAL NO.2 */
  createEmail,
  getEmail,
  deleteEmail,

  /* SOAL NO.3 */
  createNewAccount,
  getAccountById,
  getAccountByName,
  getAccountByEmail,
  getAccountByAccountNumber,
  changeProfile,
  changeAccessCode,
  changePin,
  updateAccountById,
  updateAccountByNumberAccount,
  updateAccountTransactionById,
  updateAccountTransactionByAccountNumber,
  deleteHistoryTransaction,
  deleteAccount,
};
