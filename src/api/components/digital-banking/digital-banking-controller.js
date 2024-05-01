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
    // Get request query
    var { page_number, page_size, sort, search } = request.query;

    // Check Format
    // jika ':' hanya ada 1, maka sesuai format
    // jika tidak ada ':' atau lebih dari 1, maka tidak sesuai format
    const search_length = search.replace(/[a-zA-Z0-9_\s]/g, '').length;
    const sort_length = sort.replace(/[a-zA-Z0-9_\s]/g, '').length;

    if (search_length > 1 && sort_length > 1) {
      // Jika keduanya tidak sesuai format
      search = ':';
      sort = ':1';
    } else if (search_length > 1) {
      // Jika search sesuai format
      search = ':';
    } else if (sort_length > 1) {
      // Jika sort sesuai format
      sort = ':1';
    }

    const accounts = await digitalBankingService.getAccounts(
      page_number,
      page_size,
      sort,
      search
    );

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
    const { account_email, account_pin } = request.body;
    //Waktu sekarang
    const dateNow = digitalBankingService.getDate();
    //Waktu account login
    const dateLogin = digitalBankingService.attemptLogin(false, false);

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
      } else if (!loginSuccess && dateLogin[0].temp == 5) {
        //Jika attempt sudah lima kali, maka akan dimasukan ke list block
        await digitalBankingService.createBlock(
          account_email,
          dateLogin[1].hours,
          dateLogin[2].minutes
        );

        throw errorResponder(
          errorTypes.INVALID_CREDENTIALS,
          `Wrong Email or Pin`,
          `${digitalBankingService.stringErrorLogin(account_email, dateLogin[0].temp, false)}`
        );
      } else if (!loginSuccess && dateLogin[0].temp < 5) {
        digitalBankingService.attemptLogin(true, false);
        //Selama attempt kurang dari 5, tidak akan dimasukan ke list block
        throw errorResponder(
          errorTypes.INVALID_CREDENTIALS,
          `Wrong Email or Pin`,
          `${digitalBankingService.stringErrorLogin(account_email, dateLogin[0].temp, false)}`
        );
      }

      return response.status(200).json(loginSuccess);
    } else if (successCheckBlock == true) {
      //Jika email account ada di list block
      const detailAccount =
        await digitalBankingService.getDetailEmailBlock(account_email);
      if (
        detailAccount.minutes <= dateNow[4].minutes &&
        detailAccount.hours <= dateNow[3].hours
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
            `${digitalBankingService.stringErrorLogin(account_email, dateLogin[0].temp, false)}`
          );
        }
        return response.status(200).json(loginSuccess);
      } else if (
        detailAccount.minutes > dateNow[4].minutes ||
        detailAccount.hours > dateNow[3].hours
      ) {
        //Jika waktu menunggu account lebih besar dari waktu sekarang
        //maka dia tidak boleh login dan harus menunggu
        var waitingTime =
          (detailAccount.hours - dateNow[3].hours) * 60 +
          (detailAccount.minutes - dateNow[4].minutes);
        throw errorResponder(
          errorTypes.FORBIDDEN,
          `Too many failed login attempts, Waiting time ${waitingTime} minutes`,
          `${digitalBankingService.stringErrorLogin(account_email, dateLogin[0].temp, true)}`
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
    const {
      account_name,
      account_email,
      balance,
      account_pin,
      account_pin_confirm,
    } = request.body;

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

    // Confirmation
    const loginSuccess = await digitalBankingService.checkPinCredentials(
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

    // Confirmation
    const loginSuccess = await digitalBankingService.checkPinCredentials(
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
    const { account_pin, account_pin_new, account_pin_new_confirm } =
      request.body;

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
    const { balance, account_pin } = request.body;

    /// Confirmation
    const loginSuccess = await digitalBankingService.checkPinCredentials(
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
    const { balance, account_pin } = request.body;

    // Confirmation
    const loginSuccess = await digitalBankingService.checkPinCredentials(
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
    const { account_name_receiver, balance, account_pin } = request.body;

    // Confirmation
    const loginSuccess = await digitalBankingService.checkPinCredentials(
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
