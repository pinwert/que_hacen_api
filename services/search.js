    var async = require('async'),
        serv_diputados = require('./diputados'),
        serv_votaciones = require('./votaciones'),
        serv_iniciativas = require('./iniciativas'),
        serv_circunscripciones = require('./circunscripciones'),
        serv_grupos = require('./grupos'),
        serv_organos = require('./organos');

    function search(q,cb){
        async.parallel({
            diputados: function(callback) {
                serv_diputados.get({
                    q:[{"normalized.url": q.replace(/[^-A-Za-z0-9]+/g, '-').toLowerCase()}],
                    only: ["id","nombre","apellidos","normalized", "grupo", "partido"],
                    limit: 20
                },callback);
            },
            votaciones: function(callback) {
                serv_votaciones.get({
                    q:[{"xml.resultado.informacion.textoexpediente": q},{"xml.resultado.informacion.titulo": q}],
                    not:["xml.resultado.votaciones"],
                    limit:20,
                    count:1
                },callback);
            },
            iniciativas: function(callback) {
                serv_iniciativas.get({
                    q:[{"titulo":q}],
                    limit: 20,
                    count:1
                },callback);
            },
            circunscripciones: function(callback) {
                serv_circunscripciones.get({
                    q:[{"nombre":q}],
                    not:["totales_votacion","desglose_votacion"],
                    limit: 20
                },callback);
            },
            grupos: function(callback) {
                serv_grupos.get({
                    q:[{"nombre":q}],
                    not:["formaciones","iniciativas"],
                    limit: 20
                },callback);
            },
            organos: function(callback) {
                serv_organos.get({
                    q:[{"nombre":q}],
                    only:["nombre","normalized"],
                    limit: 20
                },callback);
            }

        }, function(err, _results) {
            if(err){
                console.log(err.stack);
                cb(err);
            }
            var _ = require('lodash');
            console.log(_results);
            _results = _.compact(_results);
            var totalObjects = _.reduce(_results, function(memo, result, key) {
                var _res = result.length ? ((_.isArray(result[_.keys(result)[0]])) ? result[_.keys(result)[0]] : result[_.keys(result)[0]].result) : [];
                return memo + _res.length;
            }, 0);
            cb(null,{
                'search': {
                    totalResults: totalObjects,
                    query: q.replace(/"/g, ''),
                    results: _results,
                    error: err
                }
            });
        });
    }
    module.exports = {
        search:search
    }