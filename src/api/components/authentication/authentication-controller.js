const { errorResponder, errorTypes } = require('../../../core/errors');
const authenticationServices = require('./authentication-service');

/**
 * Handle login request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function login(request, response, next) {
  try {
    const { email, password } = request.body;
    //Waktu sekarang
    const dateNow = authenticationServices.getDate();
    //Waktu account login
    const dateLogin = authenticationServices.attemptLogin(false, false);

    //Cek apakah email ada dalam list block
    const successCheckBlock = await authenticationServices.checkBlock(email);

    if (successCheckBlock == false) {
      // Jika email nggak ada di list block
      // Check login credentials
      const loginSuccess = await authenticationServices.checkLoginCredentials(
        email,
        password
      );

      if (loginSuccess) {
        //Jika berhasil login, attempt di reset
        authenticationServices.attemptLogin(false, true);
      } else if (!loginSuccess && dateLogin[0].temp == 5) {
        //Jika attempt sudah lima kali, maka akan dimasukan ke list block
        const createBlock = await authenticationServices.createBlock(
          email,
          dateLogin[1].hours,
          dateLogin[2].minutes
        );

        throw errorResponder(
          errorTypes.INVALID_CREDENTIALS,
          `Wrong Email or Password`,
          `${authenticationServices.stringErrorLogin(email, dateLogin[0].temp, false)}`
        );
      } else if (!loginSuccess && dateLogin[0].temp < 5) {
        authenticationServices.attemptLogin(true, false);
        //Selama attempt kurang dari 5, tidak akan dimasukan ke list block
        throw errorResponder(
          errorTypes.INVALID_CREDENTIALS,
          `Wrong Email or Password`,
          `${authenticationServices.stringErrorLogin(email, dateLogin[0].temp, false)}`
        );
      }

      return response.status(200).json(loginSuccess);
    } else if (successCheckBlock == true) {
      //Jika email user ada di list block
      const detailUser =
        await authenticationServices.getDetailEmailBlock(email);
      if (
        (detailUser.hours <= dateNow[3].hours &&
          detailUser.minutes <= dateNow[4].minutes) ||
        (detailUser.hours < dateNow[3].hours &&
          detailUser.minutes >= dateNow[4].minutes)
      ) {
        //Jika waktu menunggu user lebih kecil atau sama dengan waktu sekarang
        //maka dia boleh login
        // Check login credentials
        const loginSuccess = await authenticationServices.checkLoginCredentials(
          email,
          password
        );

        if (loginSuccess) {
          //Jika berhasil login, maka hilangkan email user dari list block
          //dan attempt di reset
          authenticationServices.deleteBlock(email);
          authenticationServices.attemptLogin(false, true);
        } else if (!loginSuccess) {
          throw errorResponder(
            errorTypes.INVALID_CREDENTIALS,
            'Wrong email or password',
            `${authenticationServices.stringErrorLogin(email, dateLogin[0].temp, false)}`
          );
        }
        return response.status(200).json(loginSuccess);
      } else {
        //Jika waktu menunggu user lebih besar dari waktu sekarang
        //maka dia tidak boleh login dan harus menunggu
        var waitingTime =
          (detailUser.hours - dateNow[3].hours) * 60 +
          (detailUser.minutes - dateNow[4].minutes);
        throw errorResponder(
          errorTypes.FORBIDDEN,
          `Too many failed login attempts, Waiting time ${Math.abs(waitingTime)} minutes`,
          `${authenticationServices.stringErrorLogin(email, dateLogin[0].temp, true)}`
        );
      }
    }
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  login,
};
