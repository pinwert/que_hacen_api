
var mongojs = require('mongojs');
var config = require('../config');
var db = mongojs(config.serverConfig.mongoDB);
var collection = db.collection('votacion');
var noShow = {
    '_id': 0
};

function get(params,cb){
    if (!params.order) {
        params.order = {};
        params.order['fecha'] = -1;
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
    if (!params.order) {
        params.order = {};
        params.order['fecha'] = -1;
    }

    params.q['xml.resultado.votaciones.votacion'] = {
        $elemMatch: {
            'diputado': params.apellidos + ', ' + params.nombre
        }
    };

    votaciones
        .find(params.q, params.only || params.not || {
            '_id': 0,
            'legislatura': 1,
            'num': 1,
            'numExpediente': 1,
            'url': 1,
            'fecha': 1,
            'xml.resultado.informacion': 1,
            'xml.resultado.totales': 1,
            'xml.resultado.votaciones.votacion.$': 1
        })
        .sort(params.order)
        .limit(params.limit)
        .toArray(cb);
}

function getBySesion(params,cb){
    if (!params.order) {
        params.order = {};
        params.order['fecha'] = -1;
    }

    params.q['xml.resultado.informacion.sesion'] = params.session;

    collection
        .find(params.q, params.only || params.not || noShow)
        .limit(params.limit)
        .sort(params.order)
        .toArray(cb);
}

function getBySesionById(params,cb){
    if (!params.order) {
        params.order = {};
        params.order['fecha'] = -1;
    }

    params.q['xml.resultado.informacion.sesion'] = params.session;
    params.q['xml.resultado.informacion.numerovotacion'] = params.votacion;

    collection
        .find(params.q, params.only || params.not || noShow)
        .limit(params.limit)
        .sort(params.order)
        .toArray(cb);
}

module.exports = {
    get:get,
    count:count,
    getByDiputado:getByDiputado,
    getBySesion:getBySesion,
    getBySesionById:getBySesionById
}