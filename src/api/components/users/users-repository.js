const { User } = require('../../../models');

/**
 * Get a list of users with pagination
 * @param {number} page_number - Page Number
 * @param {number} page_size - Page Size
 * @param {string} search - Search
 * @param {string} sort - Sort
 * @returns {Promise}
 */
async function getUsersPagination(page_number, page_size, search, sort) {
  if (
    search[0].length > 0 &&
    search[1].length > 0 &&
    page_number > 0 &&
    page_size > 0
  ) {
    var results = User.find({
      $or: [{ name: { $regex: search[1] } }, { email: { $regex: search[1] } }],
    })
      .sort([sort])
      .skip((page_number - 1) * page_size)
      .limit(page_size);
  } else if (
    search[0].length > 0 &&
    search[1].length > 0 &&
    ((page_number == 0 && page_size == 0) || page_number > 0 || page_size > 0)
  ) {
    var results = User.find({
      $or: [{ name: { $regex: search[1] } }, { email: { $regex: search[1] } }],
    }).sort([sort]);
  } else if (search[0].length > 0 && search[1].length > 0) {
    var results = User.find({
      $or: [{ name: { $regex: search[1] } }, { email: { $regex: search[1] } }],
    });
  } else if (page_number > 0 && page_size > 0) {
    var results = User.find()
      .sort([sort])
      .skip((page_number - 1) * page_size)
      .limit(page_size);
  } else if (
    (page_number == 0 && page_size == 0) ||
    page_number > 0 ||
    page_size > 0
  ) {
    var results = User.find().sort([sort]);
  } else {
    // jika page_number, page_size dan sort tidak diisi
    var results = User.find();
  }

  return results;
}

/**
 * Get a list of users
 * @returns {Promise}
 */
async function getCountUsers() {
  return User.find().count();
}

/**
 * Get a total of users match search
 * @param {string} search
 * @returns {Promise}
 */
async function getCountUsersSearch(search) {
  return User.find({
    $or: [{ name: { $regex: search[1] } }, { email: { $regex: search[1] } }],
  }).count();
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
  getUsersPagination,
  getCountUsers,
  getCountUsersSearch,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserByEmail,
  changePassword,
};
