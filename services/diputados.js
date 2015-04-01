
var mongojs = require('mongojs');
var config = require('../config');
var db = mongojs(config.serverConfig.mongoDB);
var collection = db.collection('diputados');
var noShow = {
    '_id': 0
};

function get(params,cb){
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

function getById(params,cb){

    collection
        .findOne({
            'id': parseInt(params.id)
        }, params.only || params.not || noShow, cb);
}

function getVotaciones(params, cb){

    collection
        .findOne({
            'id': parseInt(params.id)
        }, {
            '_id': 0,
            apellidos: 1,
            nombre: 1
        }, cb);
}

function getIniciativas(params,cb){
    collection
        .findOne({
            'id': parseInt(params.id)
        }, {
            apellidos: 1,
            nombre: 1
        },cb);
}

function getByGrupo(params, cb){
    if (!params.order) {
        params.order = {};
        params.order['normalized.apellidos'] = 1;
        params.order['normalized.nombre'] = 1;
    }

    params.q['activo'] = 1;

    collection
        .find(params.q, params.only || params.not || noShow)
        .sort(params.order)
        .limit(params.limit)
        .toArray(cb);
}

module.exports = {
    get:get
}