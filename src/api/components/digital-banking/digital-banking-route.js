const express = require('express');

const authenticationMiddleware = require('../../middlewares/authentication-middleware-digital-banking');
const celebrate = require('../../../core/celebrate-wrappers');
const digitalBankingControllers = require('./digital-banking-controller');
const digitalBankingValidator = require('./digital-banking-validator');

const route = express.Router();

module.exports = (app) => {
  app.use('/digital-banking', route);

  //Get list of accounts with pagination
  route.get(
    '',
    authenticationMiddleware,
    celebrate(digitalBankingValidator.pagination),
    digitalBankingControllers.getAccounts
  );

  //Create new account
  route.post(
    '/',
    authenticationMiddleware,
    celebrate(digitalBankingValidator.createNewAccount),
    digitalBankingControllers.createNewAccount
  );

  //Login digital banking
  route.post(
    '/login',
    celebrate(digitalBankingValidator.login),
    digitalBankingControllers.login
  );

  //Change pin
  route.post(
    '/:id/change-pin',
    authenticationMiddleware,
    celebrate(digitalBankingValidator.changePin),
    digitalBankingControllers.changePin
  );

  //Check Balance
  route.get(
    '/:id',
    authenticationMiddleware,
    celebrate(digitalBankingValidator.checkDelete),
    digitalBankingControllers.getAccount
  );

  //Close account
  route.delete(
    '/:id',
    authenticationMiddleware,
    celebrate(digitalBankingValidator.checkDelete),
    digitalBankingControllers.deleteAccount
  );

  //Withdraw money
  route.put(
    '/:id/withdraw-money',
    authenticationMiddleware,
    celebrate(digitalBankingValidator.Money),
    digitalBankingControllers.withdrawMoney
  );

  //Deposit money
  route.put(
    '/:id/deposit-money',
    authenticationMiddleware,
    celebrate(digitalBankingValidator.Money),
    digitalBankingControllers.depositMoney
  );

  //Transfer money
  route.put(
    '/:id/transfer-money',
    authenticationMiddleware,
    celebrate(digitalBankingValidator.transferMoney),
    digitalBankingControllers.transferMoney
  );
};
