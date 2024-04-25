const mongoose = require('mongoose');
const config = require('../core/config');
const logger = require('../core/logger')('app');

const usersSchema = require('./users-schema');
const accountsSchema = require('./accounts-schema');
const blockSchema = require('./block-schema');

mongoose.connect(`${config.database.connection}/${config.database.name}`, {
  useNewUrlParser: true,
});

const db = mongoose.connection;
db.once('open', () => {
  logger.info('Successfully connected to MongoDB');
});

const User = mongoose.model('users', mongoose.Schema(usersSchema));
const Account = mongoose.model('accounts', mongoose.Schema(accountsSchema));
const Block = mongoose.model('blocks', mongoose.Schema(blockSchema));

// Untuk bisa mengakses collection, agar dapat memakai function tertentu.
const account = db.collection('accounts');
const user = db.collection('users');

module.exports = {
  mongoose,
  User,
  Account,
  Block,
  user,
  account,
};
