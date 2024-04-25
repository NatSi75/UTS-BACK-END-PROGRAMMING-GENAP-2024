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
    var dateTime = new Date();
    var yearNow = dateTime.getFullYear();
    var monthNow = dateTime.getMonth() + 1;
    var dateNow = dateTime.getDate();
    var hoursNow = dateTime.getHours();
    var minutesNow = dateTime.getMinutes();
    var secondsNow = dateTime.getSeconds();

    //Waktu user login
    data = authenticationServices.attemptLogin();
    var attempt = data[0].temp;
    var hours = data[1].hours;
    var minutes = data[2].minutes;

    const successCheckBlock = await authenticationServices.checkBlock(email);
    if (successCheckBlock == false) {
      // Jika email user nggak ada di list block
      // Check login credentials
      const loginSuccess = await authenticationServices.checkLoginCredentials(
        email,
        password
      );

      if (!loginSuccess && attempt == 5) {
        //Jika attempt sudah lima kali, maka akan dimasukan ke list block
        const successCreateBlock = await authenticationServices.createBlock(
          email,
          hours,
          minutes
        );

        throw errorResponder(
          errorTypes.INVALID_CREDENTIALS,
          `Wrong Email or Password`,
          `[${yearNow}-${monthNow}-${dateNow} ${hoursNow}:${minutesNow}:${secondsNow}] User ${email} gagal login. Attempt = ${attempt}`
        );
      } else if (!loginSuccess && attempt < 5) {
        //Selama attempt kurang dari 5, tidak akan dimasukan ke list block
        throw errorResponder(
          errorTypes.INVALID_CREDENTIALS,
          `Wrong Email or Password`,
          `[${yearNow}-${monthNow}-${dateNow} ${hoursNow}:${minutesNow}:${secondsNow}] User ${email} gagal login. Attempt = ${attempt}`
        );
      }

      return response.status(200).json(loginSuccess);
    } else if (successCheckBlock == true) {
      //Jika email user ada di list block
      const detailUser =
        await authenticationServices.getDetailEmailBlock(email);
      if (detailUser.minutes <= minutesNow && detailUser.hours <= hoursNow) {
        //Jika waktu menunggu user lebih kecil atau sama dengan waktu sekarang
        //maka dia boleh login dan menghilangkan dia dari list block
        const deleteEmail = await authenticationServices.deleteBlock(email);
        // Check login credentials
        const loginSuccess = await authenticationServices.checkLoginCredentials(
          email,
          password
        );

        if (!loginSuccess) {
          if (failedLogin && deleteEmail) {
            throw errorResponder(
              errorTypes.INVALID_CREDENTIALS,
              'Wrong email or password',
              `[${yearNow}-${monthNow}-${dateNow} ${hoursNow}:${minutesNow}:${secondsNow}] User ${email} gagal login. Attempt = ${attempt}`
            );
          }
        }
        return response.status(200).json(loginSuccess);
      } else if (
        detailUser.minutes > minutesNow ||
        detailUser.hours > hoursNow
      ) {
        //Jika waktu menunggu user lebih besar dari waktu sekarang
        //maka dia tidak boleh login dan harus menunggu
        var waitingTime =
          (detailUser.hours - hoursNow) * 60 + detailUser.minutes - minutesNow;
        throw errorResponder(
          errorTypes.FORBIDDEN,
          `Too many failed login attempts, Waiting time ${waitingTime} minutes`,
          `[${yearNow}-${monthNow}-${dateNow} ${hoursNow}:${minutesNow}:${secondsNow}] User ${email} mencoba login.Namun karena mendapat error 403 karena telah melebihi batas limit.`
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
