'use strict';

const controller = require('./fetch');
// const BASE_URI = '/api/student';
//
// module.exports = function(router) {
//   router.post(url,  controller.create);
// };

// 'use strict';
// const services = require('./database');

exports.init = function() {
  controller.start();
};
