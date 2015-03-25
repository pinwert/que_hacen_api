
var mongojs = require('mongojs');
var config = require('../config');
var db = mongojs(config.serverConfig.mongoDB);

function get(params,cb){
	var collection = db.collection('diputados');
    var noShow = {
        '_id': 0
    };

    if (!Object.keys(params.q).length) {
        params.q['activo'] = 1;
    }

    if (!params.order) {
        params.order = {};
        params.order['normalized.apellidos'] = 1;
        params.order['normalized.nombre'] = 1;
    }

    collection
        .find(params.q, params.only || params.not || noShow)
        .sort(params.order)
        .limit(params.limit)
        .toArray(cb);
}

module.exports = {
    get:get
}