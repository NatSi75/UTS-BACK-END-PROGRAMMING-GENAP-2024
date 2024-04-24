const mongoose = require('mongoose');
const config = require('../core/config');
const logger = require('../core/logger')('app');

const usersSchema = require('./users-schema');
const { use } = require('passport');

mongoose.connect(`${config.database.connection}/${config.database.name}`, {
  useNewUrlParser: true,
});

const db = mongoose.connection;
db.once('open', () => {
  logger.info('Successfully connected to MongoDB');
});

const User = mongoose.model('users', mongoose.Schema(usersSchema));

// Untuk bisa mengakses collection 'users', agar dapat memakai function tertentu.
const user = db.collection('users');

module.exports = {
  mongoose,
  User,
  user,
};
