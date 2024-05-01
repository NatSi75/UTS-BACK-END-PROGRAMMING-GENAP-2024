const joi = require('joi');
const { joiPasswordExtendCore } = require('joi-password');
const joiPassword = joi.extend(joiPasswordExtendCore);

module.exports = {
  createNewAccount: {
    body: {
      account_name: joi
        .string()
        .min(6)
        .max(32)
        .required()
        .label('Account Name'),
      account_email: joi.string().email().required().label('Account Email'),
      balance: joi
        .number()
        .integer()
        .positive()
        .greater(99999)
        .required()
        .label('Account Balance'),
      account_pin: joiPassword
        .string()
        .noWhiteSpaces()
        .min(6)
        .max(6)
        .required()
        .label('Account Pin'),
      account_pin_confirm: joi.string().required().label('Pin Confirmations'),
    },
  },
  //For route withdrawMoney & depositMoney
  Money: {
    body: {
      balance: joi
        .number()
        .integer()
        .positive()
        .required()
        .label('Account Balance'),
      account_pin: joiPassword
        .string()
        .noWhiteSpaces()
        .min(6)
        .max(6)
        .required()
        .label('Account Pin'),
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
        .label('Account Pin'),
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
        .label('Account Pin'),
      account_pin_new: joiPassword
        .string()
        .noWhiteSpaces()
        .min(6)
        .max(6)
        .required()
        .label('Account New Pin'),
      account_pin_new_confirm: joiPassword
        .string()
        .noWhiteSpaces()
        .min(6)
        .max(6)
        .required()
        .label('Account New pin confirmation'),
    },
  },

  transferMoney: {
    body: {
      account_name_receiver: joi
        .string()
        .min(6)
        .max(32)
        .required()
        .label('Account Name'),
      balance: joi
        .number()
        .integer()
        .positive()
        .required()
        .label('Account Balance'),
      account_pin: joiPassword
        .string()
        .noWhiteSpaces()
        .min(6)
        .max(6)
        .required()
        .label('Account Pin'),
    },
  },

  login: {
    body: {
      account_email: joi.string().email().required().label('Account Email'),
      account_pin: joiPassword
        .string()
        .noWhiteSpaces()
        .min(6)
        .max(6)
        .required()
        .label('Account Pin'),
    },
  },

  pagination: {
    query: {
      page_number: joi.number().integer().positive().default(0),
      page_size: joi.number().integer().positive().default(0),
      sort: joi.string().default(':1'),
      search: joi.string().default(':'),
    },
  },
};
