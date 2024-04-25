const express = require('express');

const authenticationMiddleware = require('../../middlewares/authentication-middleware');
const celebrate = require('../../../core/celebrate-wrappers');
const digitalBankingControllers = require('./digital-banking-controller');
const digitalBankingValidator = require('./digital-banking-validator');

const route = express.Router();

module.exports = (app) => {
  app.use('/digital-banking', route);

  //Get list of accounts with pagination
  route.get(
    '',
    celebrate(digitalBankingValidator.pagination),
    digitalBankingControllers.getAccounts
  );

  //Create new account
  route.post(
    '/',
    celebrate(digitalBankingValidator.createNewAccount),
    digitalBankingControllers.createNewAccount
  );

  //Change pin
  route.post(
    '/:id/change-pin',
    celebrate(digitalBankingValidator.changePin),
    digitalBankingControllers.changePin
  );

  //Check Balance
  route.get(
    '/:id',
    celebrate(digitalBankingValidator.checkDelete),
    digitalBankingControllers.getAccount
  );

  //Close account
  route.delete(
    '/:id',
    celebrate(digitalBankingValidator.checkDelete),
    digitalBankingControllers.deleteAccount
  );

  //Withdraw money
  route.put(
    '/:id/withdraw-money',
    celebrate(digitalBankingValidator.Money),
    digitalBankingControllers.withdrawMoney
  );

  //Deposit money
  route.put(
    '/:id/deposit-money',
    celebrate(digitalBankingValidator.Money),
    digitalBankingControllers.depositMoney
  );

  //Transfer money
  route.put(
    '/:id/transfer-money',
    celebrate(digitalBankingValidator.transferMoney),
    digitalBankingControllers.transferMoney
  );
};
