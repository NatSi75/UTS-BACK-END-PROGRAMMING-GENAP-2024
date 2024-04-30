const { lowerCase, trimStart } = require('lodash');
const { User, user } = require('../../../models');

/**
 * Get a list of users without search
 * @param {number} page_number - Page Number
 * @param {number} page_size - Page Size
 * @param {string} sort_split - Sort
 * @returns {Promise}
 */
async function getUsers(page_number, page_size, sort_split) {
  // change to lower case and remove space
  var sortTag = lowerCase(sort_split[0]).replace(/\s/g, '');

  // Conditional Statement untuk page_number & page_size diisi
  if (sortTag == 'name' && page_size > 0 && page_number > 0) {
    // jika field key dari sort adalah 'name'
    var results = await User.find()
      .sort({ name: sort_split[1], _id: sort_split[1] })
      .skip((page_number - 1) * page_size)
      .limit(page_size);
  } else if (sortTag == 'email' && page_size > 0 && page_number > 0) {
    // jika field key dari sort adalah 'email'
    var results = await User.find()
      .sort({ email: sort_split[1], _id: sort_split[1] })
      .skip((page_number - 1) * page_size)
      .limit(page_size);
  } else if (page_size > 0 && page_number > 0) {
    // jika sort dan search tidak diisi
    var results = await User.find()
      .skip((page_number - 1) * page_size)
      .limit(page_size);
  } else if (sortTag == 'name' && page_size == 0 && page_number == 0) {
    // Conditional Statement untuk page_number & page_size tidak diisi atau salah satunya
    // jika field key dari sort adalah 'name' dan page_number & page_size tidak diisi
    var results = await User.find().sort({
      name: sort_split[1],
      _id: sort_split[1],
    });
  } else if (sortTag == 'email' && page_size == 0 && page_number == 0) {
    // jika field key dari sort adalah 'email' dan page_number & page_size tidak diisi
    var results = await User.find().sort({
      email: sort_split[1],
      _id: sort_split[1],
    });
  } else if ((sortTag == 'name' && page_size > 0) || page_number > 0) {
    // jika field key dari sort adalah name dan antara page_number dengan page_size diisi
    var results = await User.find().sort({
      name: sort_split[1],
      _id: sort_split[1],
    });
  } else if ((sortTag == 'email' && page_size > 0) || page_number > 0) {
    // jika field key dari sort adalah email dan antara page_number dengan page_size diisi
    var results = await User.find().sort({
      email: sort_split[1],
      _id: sort_split[1],
    });
  } else {
    // jika page_number, page_size, sort dan search tidak diisi
    var results = await User.find();
  }

  return results;
}

/**
 * Get a list of users with search 'name'
 * @param {number} page_number - Page Number
 * @param {number} page_size - Page Size
 * @param {string} sort_split - Sort
 * @param {string} search_word - Search
 * @returns {Promise}
 */
async function getUsersName(page_number, page_size, sort_split, search_word) {
  // change to lower case and remove space
  var sortTag = lowerCase(sort_split[0]).replace(/\s/g, '');

  // Conditional Statement untuk page_number & page_size diisi
  if (sortTag == 'name' && page_size > 0 && page_number > 0) {
    // jika field key dari sort adalah 'name'
    var results = await User.find({
      name: { $regex: trimStart(search_word[1]) },
    })
      .sort({ name: sort_split[1], _id: sort_split[1] })
      .skip((page_number - 1) * page_size)
      .limit(page_size);
  } else if (sortTag == 'email' && page_size > 0 && page_number > 0) {
    // jika field key dari sort adalah 'email'
    var results = await User.find({
      name: { $regex: trimStart(search_word[1]) },
    })
      .sort({ email: sort_split[1], _id: sort_split[1] })
      .skip((page_number - 1) * page_size)
      .limit(page_size);
  } else if (sortTag == '' && page_size > 0 && page_number > 0) {
    var results = await User.find({
      name: { $regex: trimStart(trimStart(search_word[1])) },
    })
      .skip((page_number - 1) * page_size)
      .limit(page_size);
  } else if (sortTag == 'name' && page_size == 0 && page_number == 0) {
    // Conditional Statement untuk page_number & page_size tidak diisi
    // jika field key dari sort adalah 'name'
    var results = await User.find({
      name: { $regex: trimStart(search_word[1]) },
    }).sort({ name: sort_split[1], _id: sort_split[1] });
  } else if (sortTag == 'email' && page_size == 0 && page_number == 0) {
    // jika field key dari sort adalah 'email'
    var results = await User.find({
      name: { $regex: trimStart(search_word[1]) },
    }).sort({ email: sort_split[1], _id: sort_split[1] });
  } else if ((sortTag == 'name' && page_size > 0) || page_number > 0) {
    // Conditional Statement untuk salah satu dari page_number dan page_size yang tidak diisi
    // jika field key dari sort adalah 'name'
    var results = await User.find({
      name: { $regex: trimStart(search_word[1]) },
    }).sort({ name: sort_split[1], _id: sort_split[1] });
  } else if ((sortTag == 'email' && page_size > 0) || page_number > 0) {
    // jika field key dari sort adalah 'email'
    var results = await User.find({
      name: { $regex: trimStart(search_word[1]) },
    }).sort({ email: sort_split[1], _id: sort_split[1] });
  } else {
    // jika hanya search yang diisi (sort & page_number & page_size tidak diisi)
    // Jika hanya search dan page_size diisi (sort & page number tidak diisi)
    // jika hanya search dan page_number yang diisi (sort & page size tidak diisi)
    var results = await User.find({
      name: { $regex: trimStart(search_word[1]) },
    });
  }
  return results;
}

/**
 * Get a list of users with search 'email'
 * @param {number} page_number - Page Number
 * @param {number} page_size - Page Size
 * @param {string} sort_split - Sort
 * @param {string} search_word - Search
 * @returns {Promise}
 */
async function getUsersEmail(page_number, page_size, sort_split, search_word) {
  // change to lower case and remove space
  var sortTag = lowerCase(sort_split[0]).replace(/\s/g, '');

  // Conditional Statement untuk page_number & page_size diisi
  if (sortTag == 'name' && page_size > 0 && page_number > 0) {
    // jika field key dari sort adalah 'name'
    var results = await User.find({
      email: { $regex: trimStart(search_word[1]) },
    })
      .sort({ name: sort_split[1], _id: sort_split[1] })
      .skip((page_number - 1) * page_size)
      .limit(page_size);
  } else if (sortTag == 'email' && page_size > 0 && page_number > 0) {
    // jika field key dari sort adalah 'email'
    var results = await User.find({
      email: { $regex: trimStart(search_word[1]) },
    })
      .sort({ email: sort_split[1], _id: sort_split[1] })
      .skip((page_number - 1) * page_size)
      .limit(page_size);
  } else if (sortTag == '' && page_size > 0 && page_number > 0) {
    var results = await User.find({
      email: { $regex: trimStart(search_word[1]) },
    })
      .skip((page_number - 1) * page_size)
      .limit(page_size);
  } else if (sortTag == 'name' && page_size == 0 && page_number == 0) {
    // Conditional Statement untuk page_number & page_size tidak diisi
    // jika field key dari sort adalah 'name'
    var results = await User.find({
      email: { $regex: trimStart(search_word[1]) },
    }).sort({ name: sort_split[1], _id: sort_split[1] });
  } else if (sortTag == 'email' && page_size == 0 && page_number == 0) {
    // jika field key dari sort adalah 'email'
    var results = await User.find({
      email: { $regex: trimStart(search_word[1]) },
    }).sort({ email: sort_split[1], _id: sort_split[1] });
  } else if ((sortTag == 'name' && page_size > 0) || page_number > 0) {
    // Conditional Statement untuk salah satu dari page_number dan page_size yang tidak diisi
    // jika field key dari sort adalah 'name'
    var results = await User.find({
      email: { $regex: trimStart(search_word[1]) },
    }).sort({ name: sort_split[1], _id: sort_split[1] });
  } else if ((sortTag == 'email' && page_size > 0) || page_number > 0) {
    // jika field key dari sort adalah 'email'
    var results = await User.find({
      email: { $regex: trimStart(search_word[1]) },
    }).sort({ email: sort_split[1], _id: sort_split[1] });
  } else {
    // jika hanya search yang diisi (sort & page_number & page_size tidak diisi)
    // Jika hanya search dan page_size diisi (sort & page number tidak diisi)
    // jika hanya search dan page_number yang diisi (sort & page size tidak diisi)
    var results = await User.find({
      email: { $regex: trimStart(search_word[1]) },
    });
  }
  return results;
}

/**
 * Get a list of users
 * @returns {Promise}
 */
async function getCountUsers() {
  return user.countDocuments();
}

/**
 * Get a total of users match name
 * @param {string} search_word
 * @returns {Promise}
 */
async function getCountUsersName(search_word) {
  return User.find({ name: { $regex: trimStart(search_word[1]) } }).count();
}

/**
 * Get a total of users match email
 * @param {string} search_word
 * @returns {Promise}
 */
async function getCountUsersEmail(search_word) {
  return User.find({ email: { $regex: trimStart(search_word[1]) } }).count();
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function getUser(id) {
  return User.findById(id);
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Hashed password
 * @returns {Promise}
 */
async function createUser(name, email, password) {
  return User.create({
    name,
    email,
    password,
  });
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {Promise}
 */
async function updateUser(id, name, email) {
  return User.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        name,
        email,
      },
    }
  );
}

/**
 * Delete a user
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function deleteUser(id) {
  return User.deleteOne({ _id: id });
}

/**
 * Get user by email to prevent duplicate email
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
  return User.findOne({ email });
}

/**
 * Update user password
 * @param {string} id - User ID
 * @param {string} password - New hashed password
 * @returns {Promise}
 */
async function changePassword(id, password) {
  return User.updateOne({ _id: id }, { $set: { password } });
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserByEmail,
  changePassword,
  getUsersName,
  getUsersEmail,
  getCountUsers,
  getCountUsersName,
  getCountUsersEmail,
};
