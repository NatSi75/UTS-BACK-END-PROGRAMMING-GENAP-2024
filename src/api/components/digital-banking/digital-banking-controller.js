const digitalBankingService = require('./digital-banking-service');
const { errorResponder, errorTypes } = require('../../../core/errors');

/* PENERENAPAN SOAL NO.1 */
/**
 * Handle get list of accounts request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getAccounts(request, response, next) {
  try {
    var accounts;
    // Get request query and set default value
    const page_number = request.query.page_number || 0;
    const page_size = request.query.page_size || 0;
    var sort = request.query.sort || ':1';
    var search = request.query.search || ':';

    // No space
    var sort_nospace = sort.replace(/\s/g, '');
    var search_nospace = search.replace(/\s/g, '');

    // Check Format
    // jika ':' hanya ada 1, maka sesuai format
    // jika tidak ada ':' atau lebih dari 1, maka tidak sesuai format
    const search_format = search.replace(/[a-zA-Z0-9_\s]/g, '');
    const sort_format = sort.replace(/[a-zA-Z0-9_\s]/g, '');
    const search_length = search_format.length;
    const sort_length = sort_format.length;

    if (search_length == 1 && sort_length == 1) {
      // Jika keduanya sesuai format
      accounts = await digitalBankingService.getAccounts(
        page_number,
        page_size,
        sort_nospace,
        search,
        search_nospace
      );
    } else if (search_length > 1 && sort_length > 1) {
      // Jika keduanya tidak sesuai format
      sort_nospace = ':1';
      search = ':';
      search_nospace = ':';
      accounts = await digitalBankingService.getAccounts(
        page_number,
        page_size,
        sort_nospace,
        search,
        search_nospace
      );
    } else if (search_length > 1) {
      // Jika search sesuai format
      search = ':';
      search_nospace = ':';
      accounts = await digitalBankingService.getAccounts(
        page_number,
        page_size,
        sort_nospace,
        search,
        search_nospace
      );
    } else {
      // Jika sort sesuai format
      sort_nospace = ':1';
      accounts = await digitalBankingService.getAccounts(
        page_number,
        page_size,
        sort_nospace,
        search,
        search_nospace
      );
    }

    return response.status(200).json(accounts);
  } catch (error) {
    return next(error);
  }
}

/* PENERENAPAN SOAL NO.2 */
/**
 * Handle login request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function login(request, response, next) {
  try {
    const account_email = request.body.account_email;
    const account_pin = request.body.account_pin;

    //Waktu sekarang
    var dateTime = new Date();
    var yearNow = dateTime.getFullYear();
    var monthNow = dateTime.getMonth() + 1;
    var dateNow = dateTime.getDate();
    var hoursNow = dateTime.getHours();
    var minutesNow = dateTime.getMinutes();
    var secondsNow = dateTime.getSeconds();

    //Waktu account login
    data = digitalBankingService.attemptLogin(false, false);
    var attempt = data[0].temp;
    var hours = data[1].hours;
    var minutes = data[2].minutes;

    const successCheckBlock =
      await digitalBankingService.checkBlock(account_email);
    if (successCheckBlock == false) {
      // Jika email account nggak ada di list block
      // Check login credentials
      const loginSuccess = await digitalBankingService.checkLoginCredentials(
        account_email,
        account_pin
      );

      if (loginSuccess) {
        digitalBankingService.attemptLogin(false, true);
      } else if (!loginSuccess && attempt == 5) {
        //Jika attempt sudah lima kali, maka akan dimasukan ke list block
        await digitalBankingService.createBlock(account_email, hours, minutes);

        throw errorResponder(
          errorTypes.INVALID_CREDENTIALS,
          `Wrong Email or Pin`,
          `[${yearNow}-${monthNow}-${dateNow} ${hoursNow}:${minutesNow}:${secondsNow}] Account ${account_email} gagal login. Attempt = ${attempt}`
        );
      } else if (!loginSuccess && attempt < 5) {
        digitalBankingService.attemptLogin(true, false);
        //Selama attempt kurang dari 5, tidak akan dimasukan ke list block
        throw errorResponder(
          errorTypes.INVALID_CREDENTIALS,
          `Wrong Email or Pin`,
          `[${yearNow}-${monthNow}-${dateNow} ${hoursNow}:${minutesNow}:${secondsNow}] Account ${account_email} gagal login. Attempt = ${attempt}`
        );
      }

      return response.status(200).json(loginSuccess);
    } else if (successCheckBlock == true) {
      //Jika email account ada di list block
      const detailAccount =
        await digitalBankingService.getDetailEmailBlock(account_email);
      if (
        detailAccount.minutes <= minutesNow &&
        detailAccount.hours <= hoursNow
      ) {
        //Jika waktu menunggu user lebih kecil atau sama dengan waktu sekarang
        //maka dia boleh login dan menghilangkan dia dari list block
        await digitalBankingService.deleteBlock(account_email);
        // Check login credentials
        const loginSuccess = await digitalBankingService.checkLoginCredentials(
          account_email,
          account_pin
        );

        if (loginSuccess) {
          digitalBankingService.attemptLogin(false, true);
        } else if (!loginSuccess) {
          throw errorResponder(
            errorTypes.INVALID_CREDENTIALS,
            'Wrong Email or Pin',
            `[${yearNow}-${monthNow}-${dateNow} ${hoursNow}:${minutesNow}:${secondsNow}] Account ${account_email} gagal login. Attempt = ${attempt}`
          );
        }
        return response.status(200).json(loginSuccess);
      } else if (
        detailAccount.minutes > minutesNow ||
        detailAccount.hours > hoursNow
      ) {
        //Jika waktu menunggu account lebih besar dari waktu sekarang
        //maka dia tidak boleh login dan harus menunggu
        var waitingTime =
          (detailAccount.hours - hoursNow) * 60 +
          detailAccount.minutes -
          minutesNow;
        throw errorResponder(
          errorTypes.FORBIDDEN,
          `Too many failed login attempts, Waiting time ${waitingTime} minutes`,
          `[${yearNow}-${monthNow}-${dateNow} ${hoursNow}:${minutesNow}:${secondsNow}] Account ${account_email} mencoba login.Namun karena mendapat error 403 karena telah melebihi batas limit.`
        );
      }
    }
  } catch (error) {
    return next(error);
  }
}

/* SOAL NO.3 */
/**
 * Handle create new account request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function createNewAccount(request, response, next) {
  try {
    const account_name = request.body.account_name;
    const account_email = request.body.account_email;
    const balance = request.body.balance;
    const account_pin = request.body.account_pin;
    const account_pin_confirm = request.body.account_pin_confirm;

    // Check confirmation password
    if (account_pin !== account_pin_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Account Pin confirmation mismatched'
      );
    }

    // Account name must be unique
    const nameIsRegistered =
      await digitalBankingService.nameIsRegistered(account_name);
    if (nameIsRegistered) {
      throw errorResponder(
        errorTypes.NAME_ALREADY_TAKEN,
        'Account Name is already registered'
      );
    }

    // Account email must be unique
    const emailIsRegistered =
      await digitalBankingService.emailIsRegistered(account_email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    const success = await digitalBankingService.createNewAccount(
      account_name,
      account_email,
      balance,
      account_pin
    );
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create new account'
      );
    }

    return response.status(200).json({ account_name, account_email, balance });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle check balance account request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getAccount(request, response, next) {
  try {
    const id = request.params.id;
    const account_pin = request.body.account_pin;

    // Check Login credential
    const loginSuccess = await digitalBankingService.checkLoginCredentials(
      id,
      account_pin
    );

    if (!loginSuccess) {
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong pin');
    }

    const success = await digitalBankingService.idIsRegistered;
    if (!success) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Account None');
    }

    const account = await digitalBankingService.getAccount(id);

    return response.status(200).json(account);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle delete account request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deleteAccount(request, response, next) {
  try {
    const id = request.params.id;
    const account_pin = request.body.account_pin;

    // Check Login credential
    const loginSuccess = await digitalBankingService.checkLoginCredentials(
      id,
      account_pin
    );

    if (!loginSuccess) {
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong pin');
    }

    const success = await digitalBankingService.deleteAccount(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete account'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle change account pin request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function changePin(request, response, next) {
  try {
    const id = request.params.id;
    const account_pin = request.body.account_pin;
    const account_pin_new = request.body.account_pin_new;
    const account_pin_new_confirm = request.body.account_pin_new_confirm;

    // Check pin confirmation
    if (account_pin_new !== account_pin_new_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PIN,
        'Pin confirmation mismatched'
      );
    }

    // Check old pin
    if (!(await digitalBankingService.checkPin(id, account_pin))) {
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong pin');
    }

    const changeSuccess = await digitalBankingService.changePin(
      id,
      account_pin_new
    );

    if (!changeSuccess) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to change pin'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle withdraw money account request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function withdrawMoney(request, response, next) {
  try {
    const id = request.params.id;
    const balance = request.body.balance;
    const account_pin = request.body.account_pin;

    // Check Login credential
    const loginSuccess = await digitalBankingService.checkLoginCredentials(
      id,
      account_pin
    );

    if (!loginSuccess) {
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong pin');
    }

    const success = await digitalBankingService.withdrawMoney(id, balance);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to withdraw money'
      );
    }

    const account = await digitalBankingService.getAccount(id);

    return response.status(200).json({ account });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle deposit money account request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function depositMoney(request, response, next) {
  try {
    const id = request.params.id;
    const balance = request.body.balance;
    const account_pin = request.body.account_pin;

    // Check Login credential
    const loginSuccess = await digitalBankingService.checkLoginCredentials(
      id,
      account_pin
    );

    if (!loginSuccess) {
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong pin');
    }

    const success = await digitalBankingService.depositMoney(id, balance);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to withdraw money'
      );
    }

    const account = await digitalBankingService.getAccount(id);

    return response.status(200).json({ account });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle withdraw money account request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function transferMoney(request, response, next) {
  try {
    const id = request.params.id;
    const account_name_receiver = request.body.account_name_receiver;
    const balance = request.body.balance;
    const account_pin = request.body.account_pin;

    // Check Login credential
    const loginSuccess = await digitalBankingService.checkLoginCredentials(
      id,
      account_pin
    );

    if (!loginSuccess) {
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong pin');
    }

    const success = await digitalBankingService.transferMoney(
      id,
      account_name_receiver,
      balance
    );

    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to transfer money'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  /* PENERENAPAN SOAL NO.1 */
  getAccounts,

  /* PENERENAPAN SOAL NO.2 */
  login,

  /* SOAL NO.3 */
  createNewAccount,
  getAccount,
  deleteAccount,
  changePin,
  withdrawMoney,
  depositMoney,
  transferMoney,
};
