const { lowerCase, trimStart } = require('lodash');
const { Account, account } = require('../../../models');

/**
 * Get a list of accounts without search
 * @param {number} page_number - Page Number
 * @param {number} page_size - Page Size
 * @param {string} sort_split - Sort
 * @returns {Promise}
 */
async function getAccounts(page_number, page_size, sort_split) {
  // change to lower case and remove space
  var sortTag = lowerCase(sort_split[0]).replace(/\s/g, '');

  // Conditional Statement untuk page_number & page_size diisi
  if (sortTag == 'account_name' && page_size > 0 && page_number > 0) {
    // jika field key dari sort adalah 'name'
    var results = await Account.find()
      .sort({ account_name: sort_split[1], _id: sort_split[1] })
      .skip((page_number - 1) * page_size)
      .limit(page_size);
  } else if (sortTag == 'account_email' && page_size > 0 && page_number > 0) {
    // jika field key dari sort adalah 'email'
    var results = await Account.find()
      .sort({ account_email: sort_split[1], _id: sort_split[1] })
      .skip((page_number - 1) * page_size)
      .limit(page_size);
  } else if (page_size > 0 && page_number > 0) {
    // jika sort dan search tidak diisi
    var results = await Account.find()
      .skip((page_number - 1) * page_size)
      .limit(page_size);
  }

  // Conditional Statement untuk page_number & page_size tidak diisi atau salah satunya
  if (sortTag == 'account_name' && page_size == 0 && page_number == 0) {
    // jika field key dari sort adalah 'name' dan page_number & page_size tidak diisi
    var results = await Account.find().sort({
      account_name: sort_split[1],
      _id: sort_split[1],
    });
  } else if (sortTag == 'account_email' && page_size == 0 && page_number == 0) {
    // jika field key dari sort adalah 'email' dan page_number & page_size tidak diisi
    var results = await Account.find().sort({
      account_email: sort_split[1],
      _id: sort_split[1],
    });
  } else {
    // jika page_number, page_size, sort dan search tidak diisi
    var results = await Account.find();
  }

  return results;
}

/**
 * Get a list of accounts with search 'name'
 * @param {number} page_number - Page Number
 * @param {number} page_size - Page Size
 * @param {string} sort_split - Sort
 * @param {string} search_word - Search
 * @returns {Promise}
 */
async function getAccountsName(
  page_number,
  page_size,
  sort_split,
  search_word
) {
  // change to lower case and remove space
  var sortTag = lowerCase(sort_split[0]).replace(/\s/g, '');

  // Conditional Statement untuk page_number & page_size diisi
  if (sortTag == 'account_name' && page_size > 0 && page_number > 0) {
    // jika field key dari sort adalah 'name'
    var results = await Account.find({
      account_name: { $regex: trimStart(search_word[1]) },
    })
      .sort({ account_name: sort_split[1], _id: sort_split[1] })
      .skip((page_number - 1) * page_size)
      .limit(page_size);
  } else if (sortTag == 'account_email' && page_size > 0 && page_number > 0) {
    // jika field key dari sort adalah 'email'
    var results = await Account.find({
      account_name: { $regex: trimStart(search_word[1]) },
    })
      .sort({ account_email: sort_split[1], _id: sort_split[1] })
      .skip((page_number - 1) * page_size)
      .limit(page_size);
  } else if (sortTag == '' && page_size > 0 && page_number > 0) {
    var results = await Account.find({
      account_name: { $regex: trimStart(trimStart(search_word[1])) },
    })
      .skip((page_number - 1) * page_size)
      .limit(page_size);
  }

  // Conditional Statement untuk salah satu dari page_number dan page_size yang tidak diisi
  if (sortTag == 'account_name' && page_size == 0 && page_number > 0) {
    // jika field key dari sort adalah 'name'
    var results = await Account.find({
      account_name: { $regex: trimStart(search_word[1]) },
    }).sort({ account_name: sort_split[1], _id: sort_split[1] });
  } else if (sortTag == 'account_email' && page_size == 0 && page_number > 0) {
    // jika field key dari sort adalah 'email'
    var results = await Account.find({
      account_name: { $regex: trimStart(search_word[1]) },
    }).sort({ account_email: sort_split[1], _id: sort_split[1] });
  } else if (sortTag == 'account_name' && page_number == 0 && page_size > 0) {
    // jika field key dari sort adalah 'name'
    var results = await Account.find({
      account_name: { $regex: trimStart(search_word[1]) },
    })
      .sort({ account_name: sort_split[1], _id: sort_split[1] })
      .limit(page_size);
  } else if (sortTag == 'account_email' && page_number == 0 && page_size > 0) {
    // jika field key dari sort adalah 'email'
    var results = await Account.find({
      account_name: { $regex: trimStart(search_word[1]) },
    })
      .sort({ account_email: sort_split[1], _id: sort_split[1] })
      .limit(page_size);
  }

  // Conditional Statement untuk page_number & page_size tidak diisi
  if (sortTag == 'account_name' && page_size == 0 && page_number == 0) {
    // jika field key dari sort adalah 'name'
    var results = await Account.find({
      account_name: { $regex: trimStart(search_word[1]) },
    }).sort({ account_name: sort_split[1], _id: sort_split[1] });
  } else if (sortTag == 'account_email' && page_size == 0 && page_number == 0) {
    // jika field key dari sort adalah 'email'
    var results = await Account.find({
      account_name: { $regex: trimStart(search_word[1]) },
    }).sort({ account_email: sort_split[1], _id: sort_split[1] });
  } else {
    // jika hanya search yang diisi
    // Jika hanya search dan page_size diisi
    // jika hanya search dan page_number yang diisi
    var results = await Account.find({
      account_name: { $regex: trimStart(trimStart(search_word[1])) },
    });
  }
  return results;
}

/**
 * Get a list of accounts with search 'email'
 * @param {number} page_number - Page Number
 * @param {number} page_size - Page Size
 * @param {string} sort_split - Sort
 * @param {string} search_word - Search
 * @returns {Promise}
 */
async function getAccountsEmail(
  page_number,
  page_size,
  sort_split,
  search_word
) {
  // change to lower case and remove space
  var sortTag = lowerCase(sort_split[0]).replace(/\s/g, '');

  // Conditional Statement untuk page_number & page_size diisi
  if (sortTag == 'account_name' && page_size > 0 && page_number > 0) {
    // jika field key dari sort adalah 'name'
    var results = await Account.find({
      account_email: { $regex: trimStart(search_word[1]) },
    })
      .sort({ account_name: sort_split[1], _id: sort_split[1] })
      .skip((page_number - 1) * page_size)
      .limit(page_size);
  } else if (sortTag == 'account_email' && page_size > 0 && page_number > 0) {
    // jika field key dari sort adalah 'email'
    var results = await Account.find({
      account_email: { $regex: trimStart(search_word[1]) },
    })
      .sort({ account_email: sort_split[1], _id: sort_split[1] })
      .skip((page_number - 1) * page_size)
      .limit(page_size);
  } else if (sortTag == '' && page_size > 0 && page_number > 0) {
    var results = await Account.find({
      account_email: { $regex: trimStart(trimStart(search_word[1])) },
    })
      .skip((page_number - 1) * page_size)
      .limit(page_size);
  }

  // Conditional Statement untuk salah satu dari page_number dan page_size yang tidak diisi
  if (sortTag == 'account_name' && page_size == 0 && page_number > 0) {
    // jika field key dari sort adalah 'name'
    var results = await Account.find({
      account_email: { $regex: trimStart(search_word[1]) },
    }).sort({ account_name: sort_split[1], _id: sort_split[1] });
  } else if (sortTag == 'account_email' && page_size == 0 && page_number > 0) {
    // jika field key dari sort adalah 'email'
    var results = await Account.find({
      account_email: { $regex: trimStart(search_word[1]) },
    }).sort({ account_email: sort_split[1], _id: sort_split[1] });
  } else if (sortTag == 'account_name' && page_number == 0 && page_size > 0) {
    // jika field key dari sort adalah 'name'
    var results = await Account.find({
      account_email: { $regex: trimStart(search_word[1]) },
    })
      .sort({ account_name: sort_split[1], _id: sort_split[1] })
      .limit(page_size);
  } else if (sortTag == 'account_email' && page_number == 0 && page_size > 0) {
    // jika field key dari sort adalah 'email'
    var results = await Account.find({
      account_email: { $regex: trimStart(search_word[1]) },
    })
      .sort({ account_email: sort_split[1], _id: sort_split[1] })
      .limit(page_size);
  }

  // Conditional Statement untuk page_number & page_size tidak diisi
  if (sortTag == 'account_name' && page_size == 0 && page_number == 0) {
    // jika field key dari sort adalah 'name'
    var results = await Account.find({
      account_email: { $regex: trimStart(search_word[1]) },
    }).sort({ account_name: sort_split[1], _id: sort_split[1] });
  } else if (sortTag == 'account_email' && page_size == 0 && page_number == 0) {
    // jika field key dari sort adalah 'email'
    var results = await Account.find({
      account_email: { $regex: trimStart(search_word[1]) },
    }).sort({ account_email: sort_split[1], _id: sort_split[1] });
  } else {
    // jika hanya search yang diisi
    // Jika hanya search dan page_size diisi
    // jika hanya search dan page_number yang diisi
    var results = await Account.find({
      account_email: { $regex: trimStart(trimStart(search_word[1])) },
    });
  }
  return results;
}

/**
 * Get a list of accounts
 * @returns {Promise}
 */
async function getCountAccounts() {
  return account.countDocuments();
}

/**
 * Get a total of accounts match name
 * @param {string} search_word
 * @returns {Promise}
 */
async function getCountAccountsName(search_word) {
  return Account.find({
    account_name: { $regex: trimStart(search_word[1]) },
  }).count();
}

/**
 * Get a total of accounts match email
 * @param {string} search_word
 * @returns {Promise}
 */
async function getCountAccountsEmail(search_word) {
  return Account.find({
    account_email: { $regex: trimStart(search_word[1]) },
  }).count();
}

/**
 * Create new account
 * @param {string} account_name - Account Name
 * @param {string} account_email - Account Email
 * @param {number} balance - balance
 * @param {string} account_pin - Hashed pin
 * @returns {Promise}
 */
async function createNewAccount(
  account_name,
  account_email,
  balance,
  account_pin
) {
  return Account.create({
    account_name,
    account_email,
    balance,
    account_pin,
  });
}

/**
 * Delete a account
 * @param {string} id - Account ID
 * @returns {Promise}
 */
async function deleteAccount(id) {
  return Account.deleteOne({ _id: id });
}

/**
 * Get account by name to prevent duplicate name
 * @param {string} account_name - Account Name
 * @returns {Promise}
 */
async function getAccountByName(account_name) {
  return Account.findOne({ account_name });
}

/**
 * Get account detail
 * @param {string} id - account ID
 * @returns {Promise}
 */
async function getAccount(id) {
  return Account.findById(id);
}

/**
 * Get account by email to prevent duplicate email
 * @param {string} account_email - Account Email
 * @returns {Promise}
 */
async function getAccountByEmail(account_email) {
  return Account.findOne({ account_email });
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
 * Update existing account by name
 * @param {string} account_name_receiver - Account ID
 * @param {string} balance - Balance
 * @returns {Promise}
 */
async function updateAccountByName(account_name_receiver, balance) {
  return Account.updateOne(
    {
      account_name: account_name_receiver,
    },
    {
      $set: {
        balance,
      },
    }
  );
}

/**
 * Update account pin
 * @param {string} id - Account ID
 * @param {string} account_pin - New hashed pin
 * @returns {Promise}
 */
async function changePin(id, account_pin) {
  return Account.updateOne({ _id: id }, { $set: { account_pin } });
}

module.exports = {
  createNewAccount,
  deleteAccount,
  getAccountByName,
  getAccountByEmail,
  getAccount,
  getAccounts,
  getAccountsEmail,
  getAccountsName,
  getCountAccounts,
  getCountAccountsName,
  getCountAccountsEmail,
  updateAccountById,
  updateAccountByName,
  changePin,
};
