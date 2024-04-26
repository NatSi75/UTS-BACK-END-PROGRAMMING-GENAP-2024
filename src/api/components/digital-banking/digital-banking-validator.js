const joi = require('joi');
const { joiPasswordExtendCore } = require('joi-password');
const { account_pin } = require('../../../models/accounts-schema');
const joiPassword = joi.extend(joiPasswordExtendCore);

module.exports = {
  createNewAccount: {
    body: {
      account_name: joi.string(),
      account_email: joi.string(),
      balance: joi.number(),
      account_pin: joiPassword
        .string()
        .noWhiteSpaces()
        .min(6)
        .max(6)
        .required()
        .label('Pin'),
      account_pin_confirm: joi.string().required().label('Pin Confirmations'),
    },
  },
  //For route withdrawMoney & depositMoney
  Money: {
    body: {
      balance: joi.number(),
      account_pin: joiPassword
        .string()
        .noWhiteSpaces()
        .min(6)
        .max(6)
        .required()
        .label('Pin'),
    },
  },
  //For route check balance & delete account
  checkDelete: {
    body: {
      account_pin: joiPassword
        .string()
        .noWhiteSpaces()
        .min(6)
        .max(6)
        .required()
        .label('Pin'),
    },
  },

  changePin: {
    body: {
      account_pin: joiPassword
        .string()
        .noWhiteSpaces()
        .min(6)
        .max(6)
        .required()
        .label('Pin'),
      account_pin_new: joiPassword
        .string()
        .noWhiteSpaces()
        .min(6)
        .max(6)
        .required()
        .label('New Pin'),
      account_pin_new_confirm: joiPassword
        .string()
        .noWhiteSpaces()
        .min(6)
        .max(6)
        .required()
        .label('New pin confirmation'),
    },
  },

  transferMoney: {
    body: {
      account_name_receiver: joi.string(),
      balance: joi.number(),
      account_pin: joiPassword
        .string()
        .noWhiteSpaces()
        .min(6)
        .max(6)
        .required()
        .label('Pin'),
    },
  },

  login: {
    body: {
      account_email: joi.string().email().required().label('Email'),
      account_pin: joi.string().required().label('Pin'),
    },
  },

  pagination: {
    query: {
      page_number: joi.number().integer().positive(),
      page_size: joi.number().integer().positive(),
      sort: joi.allow(),
      search: joi.allow(),
    },
  },
};
