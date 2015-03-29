
var mongojs = require('mongojs');
var config = require('../config');
var db = mongojs(config.serverConfig.mongoDB);
var collection = db.collection('circunscripciones');
var noShow = {
    '_id': 0
};


function get(params,cb){
    if (!params.order) {
        params.order = {};
        params.order['normalized.nombre'] = 1;
    }

    collection
        .find(params.q, params.only || params.not || noShow)
        .limit(params.limit)
        .sort(params.order)
        .toArray(cb);
}

module.exports = {
    get:get
}