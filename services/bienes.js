
var mongojs = require('mongojs');
var config = require('../config');
var db = mongojs(config.serverConfig.mongoDB);
var collection = db.collection('bienes');       
var noShow = {
    '_id': 0
};


function get(params,cb){
    if (!params.order) {
        params.order = {};
        params.order['tipo'] = 1;
    }

    collection
        .find(params.q, params.only || params.not || noShow)
        .sort(params.order)
        .limit(params.limit)
        .toArray(cb);
}

function getByDiputado(params,cb){
    if (!params.order) {
        params.order = {};
        params.order['tipo'] = 1;
    }

    params.q['idDipu'] = parseInt(params.id);

    collection
        .find(params.q, params.only || params.not || noShow)
        .sort(params.order)
        .limit(params.limit)
        .toArray(cb);
}

module.exports = {
    get:get,
    getByDiputado:getByDiputado
}