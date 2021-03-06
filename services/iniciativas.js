
var mongojs = require('mongojs');
var config = require('../config');
var db = mongojs(config.serverConfig.mongoDB);
var collection = db.collection('iniciativas');
var noShow = {
    '_id': 0
};

function get(params,cb){
    if (!params.order) {
        params.order = {};
        params.order['presentadoJS2'] = -1;
    }

    collection
        .find(params.q, params.only || params.not || noShow)
        .limit(params.limit)
        .skip(params.skip)
        .sort(params.order)
        .toArray(cb);
}

function count(params,cb){
    collection.find(params.q).count(cb);
}

function getByDiputado(params,cb){
    collection
        .find(params.q, params.only || params.not || noShow)
        .sort(params.order)
        .limit(params.limit)
        .toArray(cb);
}

function getByGrupo(params,cb){
    if (!params.order) {
        params.order = {};
        params.order['presentadoJS'] = -1;
    }

    params.q['autores'] = {
        $in: [parseInt(params.id)]
    };

    collection
        .find(params.q, params.only || params.not || noShow)
        .sort(params.order)
        .limit(params.limit)
        .toArray(cb);
}

module.exports = {
    get:get,
    count:count,
    getByDiputado:getByDiputado,
    getByGrupo:getByGrupo
}