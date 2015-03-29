
var mongojs = require('mongojs');
var config = require('../config');
var db = mongojs(config.serverConfig.mongoDB);
var collection = db.collection('formaciones');
var noShow = {
    '_id': 0
};

function get(params,cb){
    collection
        .find(params.q, params.only || params.not || noShow)
        .limit(params.limit)
        .sort(params.order)
        .toArray(cb);
}

module.exports = {
    get:get
}