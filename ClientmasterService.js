'use strict';
const restify = require('restify');
const bunyan = require('bunyan');
const moment = require('moment');
const CronJob = require('cron').CronJob;
const logger = restify.getLogger('ClientmasterService');
const maindb = require('../../../storage/checkoutdb/models');
const db = require('../../../storage/main/models');
//const loggers = require('../logger');
const loggers = bunyan.createLogger({
    name: 'myapp',
    streams: [{
        level: 'debug',
        //                        stream: process.stdout,
        path: './syncingdebug.log'
    }, {
        level: 'error',
        path: './syncingerror.log'
    }]
});


// exports.create = (req, res, next) => {
//   return maindb.sequelize
//   .query('SELECT * FROM ClientMaster ', {
//     replacements:[],
//     type: maindb.sequelize.QueryTypes.SELECT
//   }).then((data) => {
//     logger.debug(data);
//     res.send(data);
//     // return db.clientmaster
//     // .bulkCreate(data, { individualHooks: true })
//     // .then((success) => {
//     //   logger.debug('success====', success);
//       return next();
//     // });
//     // return next();
//   }).catch((ex) => {
//     logger.error(ex.message);
//     return next(new restify.InternalError(ex.message));
//   });
// };

const getLastSyncservice = () => {
    return new Promise((resolve) => {
        // db.schedularMeta.removeAttribute('id');
        return db.schedularMeta
            .findOne({
                where: {
                    name: 'xbServices'
                },
                raw: true
            })
            .then((doc) => {
                if ((!doc || !doc.syncAt)) {
                    return resolve('1970-01-01');
                }
                return resolve(moment(doc.syncAt).format('YYYY-MM-DD HH:mm:ss'));
            })
            .catch((err) => {
                logger.error('error while getting last sync date', err);
                return resolve('1970-01-01');
            });
    });
};

const setLastSyncService = (req, res, next) => {
    return db.clientmasterr
        .findOne({
            order: '"createdAt" DESC',
            attributes: ['createdAt'],
            raw: true
        })
        // return db.clientmasterr
        //   .findAll()
        .then((services) => {
            //       services.createdAt = new Date();
            logger.debug('services======', services);
            return db.schedularsmeta
                .upsert({
                    name: 'xbServices',
                    syncAt: services.createdAt
                })
                .then((data) => {
                    logger.debug('data=====', data);
                    // return next();
                })
                .catch((err) => {
                    // return next(new restify.InternalError(err));
                });
        })
        .catch((err) => {
            // return next(new restify.InternalError(err));
        });
};

const execute = () => {
    return new Promise((resolve, reject) => {
        logger.debug('syncing xpressbees services...');
        return maindb.sequelize
            .query('SELECT * FROM ClientMaster with(nolock) ', {
                replacements: [],
                type: maindb.sequelize.QueryTypes.SELECT
            }).then((res) => {
                return resolve(res);
            }).catch((err) => {
                return reject(err);
            });
    });
};

const init = () => {
    setLastSyncService();
    return execute()
        .then((rows) => {
            loggers.debug('rows==', rows);
            rows.forEach(function(sync) {
                // logger.debug('syncing data=====', sync);
                sync.createdAt = new Date();
                sync.updatedAt = new Date();
                db.clientmasterr.upsert(sync)
                    .then((data) => {
                        loggers.debug('aaaaaaaaaaaaaaaaaaaaaaa=====', data);
                    }).catch((err) => {
                        loggers.error('error in mssql connection : ', err);
                    });
            });
            //In cases where no service requests were found
        });
};
// };

const job = new CronJob({
    cronTime: '10 * * * *',
    onTick: () => {
        init();
    },
    start: true,
    timeZone: 'Asia/Kolkata'
});

module.exports = job;
