'use strict';

const controller = require('./controller');
const BASE_URI = '/api/status';
//const auth = require('../../auth/auth.service');

module.exports = function(router) {
  router.post(url, controller.status);
};
