'use strict';

const controller = require('./controller');
const BASE_URI = '/api/GetBulkShipmentStatus';
//const auth = require('../../auth/auth.service');

module.exports = function(router) {
  router.post(BASE_URI, controller.getBulkShipmentStatus);
};
