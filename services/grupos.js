
var mongojs = require('mongojs');
var config = require('../config');
var db = mongojs(config.serverConfig.mongoDB);
var collection = db.collection('grupos');
var noShow = {
    '_id': 0
};

function get(params,cb){
    collection.find(params.q, params.only || params.not || noShow)
        .sort(params.order)
        .limit(params.limit)
        .toArray(cb);
}

function getById(params,cb){
    params.q['id'] = parseInt(params.id);

    collection
        .findOne(params.q, params.only || params.not || noShow, cb);
}

function getDiputados(params,cb){
    collection
        .findOne({
            'id': parseInt(params.id)
        }, noShow, cb);
}


function getIniciativas(params,cb){
    collection
        .findOne({
            'id': parseInt(params.id)
        }, noShow, cb);
}		

module.exports = {
    get:get,
    getById:getById
}