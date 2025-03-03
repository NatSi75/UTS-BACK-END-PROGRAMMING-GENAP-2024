const usersRepository = require('./users-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');
const { floor } = require('lodash');

/**
 * Get list of users
 * @param {number} page_number - Page Number
 * @param {number} page_size - Page Size
 * @param {string} sort - Sort
 * @param {string} search - Search
 * @returns {Array}
 */
async function getUsers(page_number, page_size, sort, search) {
  // Split to array with 2 index [0] and [1]
  sort = sort.split(':');
  search = search.split(':');

  const users = await usersRepository.getUsersPagination(
    page_number,
    page_size,
    search,
    sort
  );

  // Get total user (document) in collection 'users'
  const documents = await usersRepository.getCountUsers();
  const documentsSearch = await usersRepository.getCountUsersSearch(search);
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
    page_size_result = users.length;
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
  if (tempPage_number == 0 && page_number == 1 && page_size >= page_number) {
    var mod = users.length % page_size;
    console.log(mod);
    var iterator = 0;
    // jika page_number tidak diisi dan page_size diisi
    // maka akan menampilkan semua halaman / semua data
    for (let j = 0; j < total_pages; j += 1) {
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
        const user = users[iterator];
        iterator++;
        data.push({
          id: user.id,
          name: user.name,
          email: user.email,
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

      // Push sisa data
      results.push({
        page_number: page_number,
        page_size: page_size,
        count: mod,
        total_pages: total_pages,
        has_previous_page: has_previous_page,
        has_next_page: has_next_page,
      });

      for (let i = 0; i < mod; i++) {
        const user = users[iterator];
        iterator++;
        data.push({
          id: user.id,
          name: user.name,
          email: user.email,
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

    for (let l = 0; l < users.length; l += 1) {
      const user = users[l];
      data.push({
        id: user.id,
        name: user.name,
        email: user.email,
      });
    }

    // Set result
    results.push({
      page_number: page_number_result,
      page_size: page_size_result,
      count: users.length,
      total_pages: total_pages,
      has_previous_page: has_previous_page,
      has_next_page: has_next_page,
      data: data,
    });
  }

  return results;
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Object}
 */
async function getUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {boolean}
 */
async function createUser(name, email, password) {
  // Hash password
  const hashedPassword = await hashPassword(password);

  try {
    await usersRepository.createUser(name, email, hashedPassword);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {boolean}
 */
async function updateUser(id, name, email) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.updateUser(id, name, email);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete user
 * @param {string} id - User ID
 * @returns {boolean}
 */
async function deleteUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.deleteUser(id);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Check whether the email is registered
 * @param {string} email - Email
 * @returns {boolean}
 */
async function emailIsRegistered(email) {
  const user = await usersRepository.getUserByEmail(email);

  if (user) {
    return true;
  }

  return false;
}

/**
 * Check whether the password is correct
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function checkPassword(userId, password) {
  const user = await usersRepository.getUser(userId);
  return passwordMatched(password, user.password);
}

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function changePassword(userId, password) {
  const user = await usersRepository.getUser(userId);

  // Check if user not found
  if (!user) {
    return null;
  }

  const hashedPassword = await hashPassword(password);

  const changeSuccess = await usersRepository.changePassword(
    userId,
    hashedPassword
  );

  if (!changeSuccess) {
    return null;
  }

  return true;
}

/**
 * Pagination
 * @param {string} page_number - Page Number
 * @param {string} page_size - Page Size
 * @param {string} sort - Sort
 * @param {string} search - Search
 * @returns {Object}
 */
async function pagination(page_number, page_size, sort, search) {
  const user = await usersRepository.getUserByPagination(
    page_number,
    page_size,
    sort,
    search
  );

  if (!user) {
    return null;
  }
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  emailIsRegistered,
  checkPassword,
  changePassword,
  pagination,
};
