const express = require('express');

const authenticationMiddleware = require('../../middlewares/authentication-middleware-digital-banking');
const celebrate = require('../../../core/celebrate-wrappers');
const digitalBankingControllers = require('./digital-banking-controller');
const digitalBankingValidator = require('./digital-banking-validator');

const route = express.Router();

module.exports = (app) => {
  app.use('/digital-banking', route);

  //Login digital banking
  route.post(
    '/login',
    celebrate(digitalBankingValidator.login),
    digitalBankingControllers.login
  );

  //Create new account
  route.post(
    '/',
    authenticationMiddleware,
    celebrate(digitalBankingValidator.createNewAccount),
    digitalBankingControllers.createNewAccount
  );

  //Get list of accounts with pagination
  route.get(
    '',
    authenticationMiddleware,
    celebrate(digitalBankingValidator.pagination),
    digitalBankingControllers.getAccounts
  );

  //Check Profile
  route.get(
    '/:id/check-profile',
    authenticationMiddleware,
    digitalBankingControllers.checkProfile
  );

  //Check Balance
  route.get(
    '/:id/check-balance',
    authenticationMiddleware,
    digitalBankingControllers.checkBalance
  );

  //Change profile
  route.put(
    '/:id/change-profile',
    authenticationMiddleware,
    celebrate(digitalBankingValidator.changeProfile),
    digitalBankingControllers.changeProfile
  );

  //Change access code
  route.post(
    '/:id/change-access-code',
    authenticationMiddleware,
    celebrate(digitalBankingValidator.changeAccessCode),
    digitalBankingControllers.changeAccessCode
  );

  //Change pin
  route.post(
    '/:id/change-pin',
    authenticationMiddleware,
    celebrate(digitalBankingValidator.changePin),
    digitalBankingControllers.changePin
  );

  //Withdraw money
  route.patch(
    '/:id/withdraw-money',
    authenticationMiddleware,
    celebrate(digitalBankingValidator.Money),
    digitalBankingControllers.withdrawMoney
  );

  //Deposit money
  route.patch(
    '/:id/deposit-money',
    authenticationMiddleware,
    celebrate(digitalBankingValidator.Money),
    digitalBankingControllers.depositMoney
  );

  //Transfer money
  route.patch(
    '/:id/transfer-money',
    authenticationMiddleware,
    celebrate(digitalBankingValidator.transferMoney),
    digitalBankingControllers.transferMoney
  );

  //History Transaction
  route.get(
    '/:id/history-transaction',
    authenticationMiddleware,
    celebrate(digitalBankingValidator.onlyPin),
    digitalBankingControllers.historyTransaction
  );

  //Delete History Transaction
  route.delete(
    '/:id/history-transaction',
    authenticationMiddleware,
    celebrate(digitalBankingValidator.onlyPin),
    digitalBankingControllers.deleteHistoryTransaction
  );

  //Delete account
  route.delete(
    '/:id',
    authenticationMiddleware,
    celebrate(digitalBankingValidator.onlyPin),
    digitalBankingControllers.deleteAccount
  );
};
