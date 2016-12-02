'use strict';

const controller = require('./service');
// const BASE_URI = '/api/clientmaster';
//
// module.exports = function(router) {
//   router.post(BASE_URI,  controller.create);
// };

// 'use strict';
// const services = require('./clientmaster');

exports.init = function() {
  controller.start();
};
