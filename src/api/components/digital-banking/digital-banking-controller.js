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
    const { email, access_code } = request.body;
    //Waktu sekarang
    const dateNow = digitalBankingService.getDate();
    //Waktu account login
    const dateLogin = digitalBankingService.attemptLogin(false, false);

    const successCheckBlock = await digitalBankingService.checkBlock(email);
    if (successCheckBlock == false) {
      // Jika email account nggak ada di list block
      // Check login credentials
      const loginSuccess = await digitalBankingService.checkLoginCredentials(
        email,
        access_code
      );

      if (loginSuccess) {
        digitalBankingService.attemptLogin(false, true);
      } else if (!loginSuccess && dateLogin[0].temp == 5) {
        //Jika attempt sudah lima kali, maka akan dimasukan ke list block
        await digitalBankingService.createBlock(
          email,
          dateLogin[1].hours,
          dateLogin[2].minutes
        );

        throw errorResponder(
          errorTypes.INVALID_CREDENTIALS,
          `Wrong Email or Access Code`,
          `${digitalBankingService.stringErrorLogin(email, dateLogin[0].temp, false)}`
        );
      } else if (!loginSuccess && dateLogin[0].temp < 5) {
        digitalBankingService.attemptLogin(true, false);
        //Selama attempt kurang dari 5, tidak akan dimasukan ke list block
        throw errorResponder(
          errorTypes.INVALID_CREDENTIALS,
          `Wrong Email or Access Code`,
          `${digitalBankingService.stringErrorLogin(email, dateLogin[0].temp, false)}`
        );
      }

      return response
        .status(200)
        .send(
          `Success Login! \nID : ${loginSuccess.id} \nName : ${loginSuccess.name} \nEmail : ${loginSuccess.email} \nToken : ${loginSuccess.token}`
        );
    } else if (successCheckBlock == true) {
      //Jika email account ada di list block
      const detailAccount =
        await digitalBankingService.getDetailEmailBlock(email);
      if (
        (detailUser.hours <= dateNow[3].hours &&
          detailUser.minutes <= dateNow[4].minutes) ||
        (detailUser.hours < dateNow[3].hours &&
          detailUser.minutes >= dateNow[4].minutes)
      ) {
        //Jika waktu menunggu user lebih kecil atau sama dengan waktu sekarang
        //maka dia boleh login dan menghilangkan dia dari list block
        // Check login credentials
        const loginSuccess = await digitalBankingService.checkLoginCredentials(
          email,
          access_code
        );

        if (loginSuccess) {
          digitalBankingService.deleteBlock(email);
          digitalBankingService.attemptLogin(false, true);
        } else if (!loginSuccess) {
          throw errorResponder(
            errorTypes.INVALID_CREDENTIALS,
            'Wrong Email or Access Code',
            `${digitalBankingService.stringErrorLogin(email, dateLogin[0].temp, false)}`
          );
        }
        return response.status(200).json(loginSuccess);
      } else {
        //Jika waktu menunggu account lebih besar dari waktu sekarang
        //maka dia tidak boleh login dan harus menunggu
        var waitingTime =
          (detailAccount.hours - dateNow[3].hours) * 60 +
          (detailAccount.minutes - dateNow[4].minutes);
        throw errorResponder(
          errorTypes.FORBIDDEN,
          `Too many failed login attempts, Waiting time ${waitingTime} minutes`,
          `${digitalBankingService.stringErrorLogin(email, dateLogin[0].temp, true)}`
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
      name,
      email,
      ktp,
      phone_number,
      balance,
      pin,
      pin_confirmation,
      access_code,
      access_code_confirmation,
    } = request.body;

    // Check confirmation pin
    if (pin !== pin_confirmation) {
      throw errorResponder(
        errorTypes.INVALID_PIN,
        'Pin confirmation mismatched'
      );
    }

    // Check confirmation access code
    if (access_code !== access_code_confirmation) {
      throw errorResponder(
        errorTypes.INVALID_ACCESS_CODE,
        'Access code confirmation mismatched'
      );
    }

    // Name must be unique
    const nameIsRegistered = await digitalBankingService.nameIsRegistered(name);
    if (nameIsRegistered) {
      throw errorResponder(
        errorTypes.NAME_ALREADY_TAKEN,
        'Name is already registered'
      );
    }

    // Email must be unique
    const emailIsRegistered =
      await digitalBankingService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    // Create account number
    const account_number = await digitalBankingService.createAccountNumber();

    const success = await digitalBankingService.createNewAccount(
      account_number,
      name,
      email,
      ktp,
      phone_number,
      balance,
      pin,
      access_code
    );

    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create new account'
      );
    }

    return response
      .status(200)
      .send(
        `Success Create New Account! \nAccount Number : ${account_number} \nName : ${name} \nEmail : ${email} \nPhone Number : ${phone_number}`
      );
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
async function checkBalance(request, response, next) {
  try {
    const { id } = request.params;
    //Waktu sekarang
    const dateNow = digitalBankingService.getDate();
    const successId = await digitalBankingService.idIsRegistered;
    if (!successId) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Account None');
    }
    const account = await digitalBankingService.getAccount(id);
    return response
      .status(200)
      .send(
        `Info Saldo \n${dateNow[2].date}/${dateNow[1].month} ${dateNow[3].hours}:${dateNow[4].minutes}:${dateNow[5].seconds}\n${account[0].account_number} Rp.${account[0].balance}`
      );
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle check profile account request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function checkProfile(request, response, next) {
  try {
    const { id } = request.params;
    const successId = await digitalBankingService.idIsRegistered;
    if (!successId) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Account None');
    }
    const account = await digitalBankingService.getAccount(id);
    return response
      .status(200)
      .send(
        `Profile \nName : ${account[0].name} \nEmail : ${account[0].email} \nPhone Number : ${account[0].phone_number}`
      );
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle change pin request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function changePin(request, response, next) {
  try {
    const id = request.params.id;
    const { pin, pin_new, pin_new_confirm } = request.body;

    // Check pin confirmation
    if (pin_new !== pin_new_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PIN,
        'Pin confirmation mismatched'
      );
    }

    // Check old pin
    if (!(await digitalBankingService.checkPin(id, pin))) {
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong pin');
    }

    const changeSuccess = await digitalBankingService.changePin(id, pin_new);

    if (!changeSuccess) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to change pin'
      );
    }

    return response.status(200).send(`Success Change Pin!`);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle change access code request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function changeAccessCode(request, response, next) {
  try {
    const id = request.params.id;
    const { access_code, access_code_new, access_code_new_confirm } =
      request.body;

    // Check pin confirmation
    if (access_code_new !== access_code_new_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PIN,
        'Access code confirmation mismatched'
      );
    }

    // Check old pin
    if (!(await digitalBankingService.checkAccessCode(id, access_code))) {
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong access code');
    }

    const changeSuccess = await digitalBankingService.changeAccessCode(
      id,
      access_code_new
    );

    if (!changeSuccess) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to change access code'
      );
    }

    return response.status(200).send(`Success Change Access Code!`);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle change profile request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function changeProfile(request, response, next) {
  try {
    const id = request.params.id;
    const { name, email, phone_number } = request.body;

    // Name must be unique
    const nameIsRegistered = await digitalBankingService.nameIsRegistered(name);
    if (nameIsRegistered) {
      throw errorResponder(
        errorTypes.NAME_ALREADY_TAKEN,
        'Name is already registered'
      );
    }

    // Email must be unique
    const emailIsRegistered =
      await digitalBankingService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    const changeSuccess = await digitalBankingService.changeProfile(
      id,
      name,
      email,
      phone_number
    );

    if (!changeSuccess) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to change profile'
      );
    }

    return response.status(200).send(`Success Change Profile!`);
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
    const { balance, pin } = request.body;
    //Waktu sekarang
    const dateNow = digitalBankingService.getDate();

    /// Confirmation
    const loginSuccess = await digitalBankingService.checkPinCredentials(
      id,
      pin
    );

    if (!loginSuccess) {
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong pin');
    }

    const success = await digitalBankingService.withdrawMoney(id, balance);
    if (success) {
      digitalBankingService.transaction(id, balance, 'Withdraw Money', dateNow);
    } else if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to withdraw money'
      );
    }

    return response
      .status(200)
      .send(
        `Success Withdraw Money! \n${dateNow[2].date}/${dateNow[1].month} ${dateNow[3].hours}:${dateNow[4].minutes}:${dateNow[5].seconds}`
      );
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
    const { balance, pin } = request.body;
    //Waktu sekarang
    const dateNow = digitalBankingService.getDate();

    // Confirmation
    const loginSuccess = await digitalBankingService.checkPinCredentials(
      id,
      pin
    );

    if (!loginSuccess) {
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong pin');
    }

    const success = await digitalBankingService.depositMoney(id, balance);
    if (success) {
      digitalBankingService.transaction(id, balance, 'Deposit Money', dateNow);
    } else if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to deposit money'
      );
    }

    return response
      .status(200)
      .send(
        `Success Deposit Money! \n${dateNow[2].date}/${dateNow[1].month} ${dateNow[3].hours}:${dateNow[4].minutes}:${dateNow[5].seconds}`
      );
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
    const { account_number_receiver, balance, pin } = request.body;
    //Waktu sekarang
    const dateNow = digitalBankingService.getDate();

    // Confirmation
    const loginSuccess = await digitalBankingService.checkPinCredentials(
      id,
      pin
    );

    if (!loginSuccess) {
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong pin');
    }

    const account = await digitalBankingService.getAccountByAccountNumber(
      account_number_receiver
    );

    if (!account) {
      throw errorResponder(
        errorTypes.INVALID_ACCOUNT_NUMBER,
        'Account number not found.'
      );
    }

    const success = await digitalBankingService.transferMoney(
      id,
      account_number_receiver,
      balance
    );

    if (success) {
      digitalBankingService.transactionTransferMoney(
        id,
        account_number_receiver,
        balance,
        'Transfer Money',
        dateNow
      );
    } else if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to transfer money'
      );
    }

    return response
      .status(200)
      .send(
        `Success Transfer Money to ${account_number_receiver}! \n${dateNow[2].date}/${dateNow[1].month} ${dateNow[3].hours}:${dateNow[4].minutes}:${dateNow[5].seconds}`
      );
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle history transaction request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function historyTransaction(request, response, next) {
  try {
    const { id } = request.params;
    const { pin } = request.body;
    const successId = await digitalBankingService.idIsRegistered;
    if (!successId) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Account None');
    }

    // Confirmation
    const loginSuccess = await digitalBankingService.checkPinCredentials(
      id,
      pin
    );

    if (!loginSuccess) {
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong pin');
    }

    const account = await digitalBankingService.historyTransaction(id);
    var data = [];
    if (account.length == 0) {
      data = `None History Transaction.`;
    } else {
      for (let i = 1; i <= account.length; i++) {
        data.push({
          Transaction: i,
          Date: account[i - 1].date,
          Type: account[i - 1].type,
          Balance: account[i - 1].balance,
        });
      }
    }

    return response.status(200).send(data);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle delete history transaction request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deleteHistoryTransaction(request, response, next) {
  try {
    const id = request.params.id;
    const pin = request.body.pin;

    // Confirmation
    const loginSuccess = await digitalBankingService.checkPinCredentials(
      id,
      pin
    );

    if (!loginSuccess) {
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong pin');
    }

    const success = await digitalBankingService.deleteHistoryTransaction(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete history transaction'
      );
    }

    return response.status(200).send('Success Delete History Transaction!');
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
    const pin = request.body.pin;

    // Confirmation
    const loginSuccess = await digitalBankingService.checkPinCredentials(
      id,
      pin
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

module.exports = {
  /* PENERENAPAN SOAL NO.1 */
  getAccounts,

  /* PENERENAPAN SOAL NO.2 */
  login,

  /* SOAL NO.3 */
  createNewAccount,
  checkBalance,
  checkProfile,
  changePin,
  changeAccessCode,
  changeProfile,
  withdrawMoney,
  depositMoney,
  transferMoney,
  historyTransaction,
  deleteHistoryTransaction,
  deleteAccount,
};
