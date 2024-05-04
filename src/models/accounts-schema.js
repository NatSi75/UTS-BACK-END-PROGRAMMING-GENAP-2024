const accountsSchema = {
  account_number: String,
  name: String,
  email: String,
  ktp: Object,
  phone_number: String,
  balance: Number,
  transaction: { type: Array, default: [] },
  pin: String,
  access_code: String,
  created: { type: Date, default: Date.now },
};

module.exports = accountsSchema;
