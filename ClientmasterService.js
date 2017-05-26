'use strict';
const restify = require('restify');
const bunyan = require('bunyan');
const moment = require('moment');
const CronJob = require('cron').CronJob;
const logger = restify.getLogger('newservice');
const maindb = require('../../../storage/data/models');
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
//   .query('SELECT * FROM abc ', {
//     replacements:[],
//     type: maindb.sequelize.QueryTypes.SELECT
//   }).then((data) => {
//     logger.debug(data);
//     res.send(data);
//     // return db.abc
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
        return db.database
            .findOne({
                where: {
                    name: 'data'
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

const newservice = (req, res, next) => {
    return db.abc
        .findOne({
            order: '"createdAt" DESC',
            attributes: ['createdAt'],
            raw: true
        })
        // return db.clientmasterr
        //   .findAll()
        .then((services) => {
            //       services.createdAt = new Date();
            logger.debug('services', services);
            return db.schedularsmeta
                .upsert({
                    name: 'myservice',
                    syncAt: services.createdAt
                })
                .then((data) => {
                    logger.debug('data', data);
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
        logger.debug('syncdata...');
        return maindb.sequelize
            .query('SELECT * FROM database with(nolock) ', {
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
    newservice();
    return execute()
        .then((rows) => {
            loggers.debug('rows', rows);
            rows.forEach(function(sync) {
                sync.createdAt = new Date();
                sync.updatedAt = new Date();
                db.abc.upsert(sync)
                    .then((data) => {
                        loggers.debug('Data', data);
                    }).catch((err) => {
                        loggers.error('error in connection : ', err);
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
