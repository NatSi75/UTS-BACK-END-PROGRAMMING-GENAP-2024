const joi = require('joi');
const { joiPasswordExtendCore } = require('joi-password');
const date = require('@joi/date');
const joiDate = joi.extend(date);
const joiPassword = joi.extend(joiPasswordExtendCore);

module.exports = {
  createNewAccount: {
    body: {
      name: joi.string().min(6).max(32).required().label('Name').messages({
        'string.min': 'Name minimum 6 length',
        'string.max': 'Name maximum 32 length',
        'string.required': 'You must write your name.',
      }),
      email: joi.string().email().required().label('Email'),
      ktp: {
        nik: joi.string().min(16).max(16).required().label('NIK'),
        place_ob: joi.string().required().label('Place Of Birth'),
        date_ob: joiDate
          .date()
          .format('DD-MM-YYYY')
          .raw()
          .greater(new Date('01-01-1950'))
          .max('01-01-2007')
          .required()
          .label('Date Of Birth'),
        gender: joi.string().valid('L', 'P').required().label('Gender'),
        blood_type: joi
          .string()
          .valid('A', 'B', 'AB', 'O')
          .required()
          .label('Blood Type'),
        address: joi.string().max(50).required().label('Address'),
      },
      phone_number: joi
        .string()
        .regex(/^\d{4}-\d{4}-\d{4}$/)
        .required()
        .label('Phone Number'),
      balance: joi
        .number()
        .integer()
        .positive()
        .greater(99999)
        .required()
        .label('Balance'),
      pin: joiPassword
        .string()
        .regex(/^[0-9]{6}$/)
        .min(6)
        .max(6)
        .required()
        .label('Pin'),
      pin_confirmation: joi.ref('pin'),
      access_code: joiPassword
        .string()
        .minOfNumeric(1)
        .regex(/^[a-z]{1,6}[0-9]{1,6}$/)
        .min(6)
        .max(6)
        .required()
        .label('Access Code'),
      access_code_confirmation: joi.ref('access_code'),
    },
  },
  //For route withdrawMoney & depositMoney
  Money: {
    body: {
      balance: joi
        .number()
        .integer()
        .positive()
        .greater(19999)
        .required()
        .label('Balance'),
      pin: joiPassword
        .string()
        .regex(/^[0-9]{6}$/)
        .min(6)
        .max(6)
        .required()
        .label('Pin'),
    },
  },
  //For route check profil & delete account
  checkDelete: {
    body: {
      pin: joiPassword
        .string()
        .regex(/^[0-9]{6}$/)
        .min(6)
        .max(6)
        .required()
        .label('Pin'),
    },
  },

  changePin: {
    body: {
      pin: joiPassword
        .string()
        .regex(/^[0-9]{6}$/)
        .min(6)
        .max(6)
        .required()
        .label('Pin'),
      pin_new: joiPassword
        .string()
        .regex(/^[0-9]{6}$/)
        .min(6)
        .max(6)
        .required()
        .label('New Pin'),
      pin_new_confirm: joi.ref('pin_new'),
    },
  },

  changeAccessCode: {
    body: {
      access_code: joiPassword
        .string()
        .minOfNumeric(1)
        .regex(/^[a-z]{1,6}[0-9]{1,6}$/)
        .min(6)
        .max(6)
        .required()
        .label('Access Code'),
      access_code_new: joiPassword
        .string()
        .minOfNumeric(1)
        .regex(/^[a-z]{1,6}[0-9]{1,6}$/)
        .min(6)
        .max(6)
        .required()
        .label('Access Code'),
      access_code_new_confirm: joi.ref('access_code_new'),
    },
  },

  changeProfile: {
    body: {
      name: joi.string().min(6).max(32).required().label('Name').messages({
        'string.min': 'Name minimum 6 length',
        'string.max': 'Name maximum 32 length',
        'string.required': 'You must write your name.',
      }),
      email: joi.string().email().required().label('Email'),
      phone_number: joi
        .string()
        .regex(/^\d{4}-\d{4}-\d{4}$/)
        .required()
        .label('Phone Number'),
    },
  },

  transferMoney: {
    body: {
      account_number_receiver: joi
        .string()
        .min(4)
        .max(4)
        .required()
        .label('Account Number Receiver'),
      balance: joi
        .number()
        .integer()
        .positive()
        .greater(19999)
        .required()
        .label('Balance'),
      pin: joiPassword
        .string()
        .regex(/^[0-9]{6}$/)
        .min(6)
        .max(6)
        .required()
        .label('Pin'),
    },
  },

  login: {
    body: {
      email: joi.string().email().required().label('Account Email'),
      access_code: joiPassword
        .string()
        .minOfNumeric(1)
        .regex(/^[a-z]{1,6}[0-9]{1,6}$/)
        .min(6)
        .max(6)
        .required()
        .label('Access Code'),
    },
  },

  pagination: {
    query: {
      page_number: joi.number().integer().positive().default(0),
      page_size: joi.number().integer().positive().default(0),
      sort: joi.string().default('account_number:asc'),
      search: joi.string().default(':'),
    },
  },
};
