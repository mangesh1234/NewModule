'use strict';

const restify = require('restify');
const Joi = require('joi');
const maindb = require('../../../storage/abc/models');

exports.getShipmentManifestDetails = function(req, res, next) {
  const schema = Joi.object().keys({
    name: Joi.string().required(),
    fullname: Joi.string().required(),
    FromDate: Joi.string().allow(null).allow(''),
    ToDate: Joi.string().allow(null).allow('')
  });
  return schema.validate(req.body, {stripUnknown: true}, (err, params) => {
    //    if (params. ''){
    //      res.send({'ReturnMessage': 'Please provide token number',
    //               'TokenNumber': null,'TotalCountToBePicked': null, "PickedCount":null,
    //               'PendingCount': null, '': null,'': []});
    //    }
    if (err) {
      return next(new restify.myError.ValidationError(err));
    }
    maindb.sequelize
      .query('EXEC tablename :id, :nymber, :FromDate, :ToDate', {
        replacements: {
        id: '',
        number: 29,
        FromDate:null,
        ToDate:null
      },
      type: maindb.sequelize.QueryTypes.SELECT
    })
};


