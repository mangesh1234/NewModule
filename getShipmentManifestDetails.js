'use strict';

const restify = require('restify');
const Joi = require('joi');
const logger = restify.getLogger('GetShipmentManifestDetails');
const maindb = require('../../../storage/checkoutdb/models');

exports.getShipmentManifestDetails = function(req, res, next) {
  const schema = Joi.object().keys({
    XBkey: Joi.string().required(),
    AWBNumbers: Joi.string().required(),
    FromDate: Joi.string().allow(null).allow(''),
    ToDate: Joi.string().allow(null).allow('')
  });
  return schema.validate(req.body, {stripUnknown: true}, (err, params) => {
    //    if (params.TokenNumber === ''){
    //      res.send({'ReturnMessage': 'Please provide token number',
    //               'TokenNumber': null,'TotalCountToBePicked': null, "PickedCount":null,
    //               'PendingCount': null, 'LastModifedDate': null,'PendinigAWBNumberDetails': []});
    //    }
    if (err) {
      return next(new restify.fcErrors.ValidationError(err));
    }
    maindb.sequelize
      .query('EXEC ShipmentDetailsForClientAPI :ShippingIds, :ClientID, :FromDate, :ToDate', {
        replacements: {
          // clientId create rowId of AddManifest Deatil Table
        ShippingIds: '1348294322537, 1348294322536',
        ClientID: 29,
        FromDate:null,
        ToDate:null
      },
      type: maindb.sequelize.QueryTypes.SELECT
    }).then((result) => {
      const shipmentMenifestDetail = [];
      const abc = [];
      result.forEach((v) => {
        shipmentMenifestDetail.push({'AWBNumber':v.ShippingId,
          'Status': 'Found',
          'StatusCode': 1,
          'ReceivedFrom': 'API',
          'DataReceived':[{
              'ShippingId':v.ShippingId,
              'CompanyName':v.CompanyName,
              'ManifestNo':v.ManifestNo,
              'OrderNo':v.OrderNo,
              'SubOrderNo':v.SubOrderNo,
              'OrderType':v.OrderType,
              'PaymentStatus':v.PaymentStatus,
              'AddressDetails':[{
                  'AddressType': 'PickupDetails',
                  'Name':v.PickupVendor,
                  'Address':v.PickVendorAddress,
                  'City':v.PickVendorCity,
                  'State':v.PickVendorCity,
                  'PinCode':v.PickVendorPinCode,
                  'PhoneNo':v.PickVendorPhoneNo,
                  'Code':v.PickupVendorCode
                  },
                  {'AddressType': 'DropDetails',
                   'Name':v.CustomerFirstName,
                   'Address':v.CustomerAddress,
                   'City':v.CustomerCity,
                   'State':v.CustomerState,
                   'PinCode':v.CustomerPinCode,
                   'PhoneNo':v.CustomerPhoneNo},
                 { 'AddressType': 'RTODetails',
                   'Name':v.RTOName,
                   'Address':v.RTOAddress,
                   'City':v.RTOCity,
                   'State':v.RTOState,
                   'PinCode':v.RTOPinCode,
                   'PhoneNo':v.RTOMobileNo,
                   'Code':v.RTOPinCode
                }],
              'Quantity':v.QTY,
              'ProductDetails':[{
               
              }]
            }]
        });
        //        abc.push({'ShippingId':v.ShippingId,
        //                  'CompanyName':v.CompanyName
        //                });                            
      });
      res.send({'GetShipmentManifestDetails': {
          'AuthKey': 'Valid',
          'ReturnMessage': 'Successful',
          'ReturnCode': 1,
          'AWBsQueryCount': 2,
          'AWBsFound': 1,
          'AWBsNotFound': 1,
          'ResultSet':shipmentMenifestDetail}});
      console.log('result======', result);
      return next();
    }).catch((ex) => {
      logger.error(ex.message);
      return next(new restify.InternalError(ex.message));
    });
  });
};


