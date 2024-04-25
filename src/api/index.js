const express = require('express');

const authentication = require('./components/authentication/authentication-route');
const users = require('./components/users/users-route');
const digital_banking = require('./components/digital-banking/digital-banking-route');

module.exports = () => {
  const app = express.Router();

  authentication(app);
  users(app);
  digital_banking(app);

  return app;
};
