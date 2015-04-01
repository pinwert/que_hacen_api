var restify = require('restify');
var mongojs = require('mongojs');
var search = require('./services/search');
var diputados = require('./services/diputados');
var grupos = require('./services/grupos');
var formaciones = require('./services/formaciones');
var votaciones = require('./services/votaciones');
var iniciativas = require('./services/iniciativas');
var organos = require('./services/organos');
var bienes = require('./services/bienes');
var intervenciones = require('./services/intervenciones');

var serverConfig = {
    'server': 'localhost',
    'port': process.env.PORT || 3002,
    'mongoDB': 'que_hacen'
}

var apiServer = restify.createServer({
    "name": "api.quehacenlosdiputados.net"
});

var db = mongojs(serverConfig.mongoDB);

apiServer
    .use(restify.fullResponse())
    .use(restify.bodyParser())
    .use(restify.queryParser())
    .use(headers)
// Middleware limit request
.use(limitParse)
    .use(skipParse)
    .use(countParse)
// Middleware sort request
.use(sortParse)
// Middleware only request
.use(onlyParse)
// Middleware not request
.use(notParse)
// Middleware query request
.use(findParse);


/***** API *****/

apiServer.get('/diputados', getDiputados);
apiServer.get('/diputados/bienes', getBienes);
apiServer.get('/diputado/:id', getDiputado);
apiServer.get('/diputado/:id/votaciones', getVotacionesDiputado);
apiServer.get('/diputado/:id/iniciativas', getIniciativasDiputado);
apiServer.get('/diputado/:id/bienes', getBienesDiputado);
apiServer.get('/grupos', getGrupos);
apiServer.get('/grupo/:id', getGrupo);
apiServer.get('/grupo/:id/diputados', getDiputadosGrupo);
apiServer.get('/grupo/:id/iniciativas', getIniciativasGrupo);
apiServer.get('/formaciones', getFormaciones);
apiServer.get('/formacion/:id', getFormacion);
apiServer.get('/votaciones', getVotaciones);
apiServer.get('/votacion/:session', getVotacionesSesion);
apiServer.get('/votacion/:session/:votacion', getVotacionSesion);
apiServer.get('/iniciativas', getIniciativas);
apiServer.get('/intervenciones', getIntervenciones);
apiServer.get('/circunscripciones', getCircunscripciones);
apiServer.get('/circunscripcion/:id', getCircunscripcion);

apiServer.get('/circunscripcion/:id/diputados', function(req, res) {

    var collection = db.collection('circunscripciones');
    var noShow = {
        '_id': 0
    };

    collection
        .findOne({
            'id': parseInt(req.params.id)
        }, noShow, function(err, docs) {
            if (err) {
                res.send(err);
                return;
            }

            if (!("activo" in req.params.q)) {
                req.params.q['activo'] = 1;
            }

            req.params.q['circunscripcion'] = docs.nombre;

            db.collection('diputados')
                .find(req.params.q, req.params.only || req.params.not || noShow)
                .sort(req.params.order)
                .limit(req.params.limit)
                .toArray(function(err, docs2) {
                    if (err) {
                        res.send(err);
                        return;
                    }
                    res.send(docs2);
                });
        });
});

apiServer.get('/organos', function(req, res) {
    organos.get(req.params,function(err, docs) {
     	if (err) {
            res.send(err);
            return;
        }
        res.send(docs);
    });
});

apiServer.get('/eventos', function(req, res) {
    var collection = db.collection('eventos');
    var noShow = {
        '_id': 0
    };

    if (!req.params.order) {
        req.params.order = {};
        req.params.order['fechahoraJS'] = -1;
    }

    collection
        .find(req.params.q, req.params.only || req.params.not || noShow)
        .sort(req.params.order)
        .limit(req.params.limit)
        .toArray(function(err, docs) {
            if (err) {
                res.send(err);
                return;
            }
            res.send(docs);
        });
});

apiServer.get('/', function(req, res) {
    //console.log(db);
    res.send(apiServer.name);
});

apiServer.get('/search', function(req,res){
	search.search(req.query.bus,function(err,response){
	  	if(err){
		    res.status(err.status).send(err);
		    return;
	  	}		
		res.send(response);
	});
});

apiServer.get('/test', function(req, res) {
    //console.log(db);
    db.collection('eventos')
        .find({
            fechahoraJS: {
                $gte: new Date(Date.now())
            }
        })
    //.find()
    .toArray(function(err, docs) {
        if (err) {
            res.send(err);
            return;
        }
        res.send(docs);
    });

    /*db.collection('bienes').mapReduce( 
    function(){ 
      var output = { "diputadoID" : this._id }
      emit(this._id, output);
    },
    function(key, values) {
      return values;
    },
    {
      out : { inline : 1 }
    }, 
    function(err, resp){
      res.send(arguments);
    }
  );*/
    /*
  var mapFn = function(){ 
    var output = { "diputadoID" : db.diputados.findOne({ id: this.idDipu }) }
    emit(this._id, output);
  }
  var reduceFn = function(key, values) {
    return values;
  }
  var MR = {
      mapreduce: "bienes", 
      out:  { inline : 1 },
      map: mapFn.toString(),
      reduce: reduceFn.toString()
  }

  db.runCommand(MR, function(err, dbres) {
      res.send(dbres);
  });
*/

});

/**** handlers ********/

function getDiputados(req, res) {
    diputados.get(req.params,function(err, docs) {
        response(err,docs,res);
    });
}

function getBienes(req, res) {
    bienes.get(req.params,function(err, docs) {
        response(err,docs,res);
    });
}

function getDiputado(req, res) {
    diputados.getById(req.params,function(err, docs) {
        response(err,docs,res);
    });
}

function getVotacionesDiputado(req, res) {
    diputados.getVotaciones(req.params,function(err, docs) {
        if (err) {
            res.send(err);
            return;
        }
        req.params.nombre = docs.nombre;
        req.params.apellidos = docs.apellidos;
        votaciones.getByDiputado(req.params,function(err, docs) {
            response(err,docs,res);
        });
    });
}

function getIniciativasDiputado(req, res) {
    diputados.getVotaciones(req.params,function(err, docs) {
        if (err) {
            res.send(err);
            return;
        }
        if (!req.params.order) {
            req.params.order = {};
            req.params.order['presentadoJS'] = -1;
        }

        req.params.q['autores'] = {
            $in: [parseInt(req.params.id)]
        };
        req.params.q['tipo_autor'] = "Diputado";
        iniciativas.getByDiputado(req.params,function(err, docs) {
            response(err,docs,res);
        });
    });
}

function getBienesDiputado(req, res) {
    bienes.getByDiputado(req.params,function(err, docs) {
        response(err,docs,res);
    });
}

function getGrupos(req, res) {
    grupos.get(req.params,function(err, docs) {
        response(err,docs,res);
    });
}

function getGrupo(req, res) {
    grupos.getById(req.params,function(err, docs) {
        response(err,docs,res);
    });
}

function getDiputadosGrupo(req, res) {
    grupos.getDiputados(req.params,function(err,docs){
         if (err) {
            res.send(err);
            return;
        }

        req.params.q['grupo'] = docs.nombre;

        diputados.getByGrupo(req.params,function(err,docs){
            response(err,docs,res);
        });
    });
}

function getIniciativasGrupo(req, res) {

    grupos.getIniciativas(req.params, function(err, docs) {
        if (err) {
            res.send(err);
            return;
        }

        req.params.q['tipo_autor'] = "Grupo";
        
        iniciativas.getByGrupo(req.params,function(err,docs){
            response(err,docs,res);
        });
    });
}

function getFormaciones(req, res) {
    formaciones.get(req.params,function(err, docs) {
        response(err,docs,res); 
    });
}

function getFormacion(req, res) {
    formaciones.getById(req.params,function(err,docs){
        response(err,docs,res);
    });
}

function getVotaciones(req, res) {
    votaciones.get(req.params,function(err, docs) {
        if (err) {
            res.send(err);
            return;
        }
        if (req.params.count == 1) {
            return votaciones.count(req.params.q,function(err, resp) {
                if (err) {
                    res.send(err);
                    return;
                }
                var resul = {};
                resul.totalObjects = resp;
                resul.result = docs;
                res.send(resul);
            });
        }
        res.send(docs);
    });
}

function getVotacionesSesion(req, res) {
    votaciones.getBySesion(req.params,function(err, docs){
        response(err,docs,res);
    });
}

function getVotacionSesion(req, res) {    
    votaciones.getBySesionById(req.params,function(err, docs){
        response(err,docs,res);
    });
}

function getIniciativas(req, res) {
    iniciativas.get(req.params,function(err, docs) {
        if (err) {
            res.send(err);
            return;
        }
        if (req.params.count == 1) {
            return iniciativas.count(req.params,function(err, resp) {
                if (err) {
                    res.send(err);
                    return;
                }
                var resul = {};
                resul.totalObjects = resp;
                resul.result = docs;
                res.send(resul);
            });
        }
        res.send(docs);
    });
}

function getIntervenciones(req, res) {
    intervenciones.get(req.params,function(err, docs) {
        if (err) {
            res.send(err);
            return;
        }
        if (req.params.count == 1) {
            return intervenciones.count(req.params,function(err, resp) {
                if (err) {
                    res.send(err);
                    return;
                }
                var resul = {};
                resul.totalObjects = resp;
                resul.result = docs;
                res.send(resul);
            });
        }
        res.send(docs);
    });
}

function getCircunscripciones(req, res) {
    circunscripciones.get(req.params,function(err, docs) {
        response(err,docs,res);
    });
}

function getCircunscripcion(req, res) {
    circunscripciones.getById(req.params,function(err, docs) {
        response(err,docs,res);
    });
}

/**** funtions ********/

function response(err,docs,res){
    if (err) {
        res.send(err);
        return;
    }
    res.send(docs);
}

function headers(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.set('content-type', 'application/json; charset=utf-8');
    next();
}
// ?limit=10
function limitParse(req, res, next) {
    req.params.limit = parseInt(req.params.limit || 0);
    next();
}

// ?skip=10
function skipParse(req, res, next) {
    req.params.skip = parseInt(req.params.skip || 0);
    next();
}

// ?count=1
function countParse(req, res, next) {
    req.params.count = parseInt(req.params.count || 0);
    next();
}

// ?order={"xml.resultado.totales.encontra":1}
function sortParse(req, res, next) {
    if (!req.params.order) {
        next();
        return;
    }
    var query = JSON.parse(req.params.order);
    var _sort = {};
    for (paramKey in query) {
        _sort[paramKey] = parseInt(query[paramKey]);
    }
    req.params.order = _sort;

    next();
}

// ?only=["nombre", "apellidos"]
function onlyParse(req, res, next) {

    if (!req.params.only) {
        next();
        return;
    }

    var onlyFields = JSON.parse(req.params.only);
    var noShow = {
        '_id': 0
    };
    for (field in onlyFields) {
        noShow[onlyFields[field]] = 1;
    }
    req.params.only = noShow;

    next();
}

// ?not=["id", "grupo"]
function notParse(req, res, next) {

    if (!req.params.not) {
        next();
        return;
    }

    var onlyFields = JSON.parse(req.params.not);
    var noShow = {
        '_id': 0
    };
    for (field in onlyFields) {
        noShow[onlyFields[field]] = 0;
    }
    req.params.not = noShow;

    next();
}

// ?q={"nombre":"mariano"}
// ?q={"fechahoraJS":{"$gte":"2014-03-27T00:00:00.000Z","$lte":"2014-03-29T00:00:00.000Z"}}
function findParse(req, res, next) {
    if (!req.params.q) {
        req.params.q = {};
        next();
        return;
    }
    req.params.q = parseQuery({}, req.params.q);
    console.log("findParse", req.params.q);
    next();
}

function parseQuery(findParams, query) {
    /*** ISODate pattern
    
    (/(\d{4})\D?(0[1-9]|1[0-2])\D?([12]\d|0[1-9]|3[01])(\D?([01]\d|2[0-3])\D?([0-5]\d)\D?([0-5]\d)?\D?(\d{3})?([zZ]|([\+-])([01]\d|2[0-3])\D?([0-5]\d)?)?)?/)
    .test("2013-05-31T00:00:00.000Z")
  
  */
    var ISODatePattern = new RegExp(/(\d{4})\D?(0[1-9]|1[0-2])\D?([12]\d|0[1-9]|3[01])(\D?([01]\d|2[0-3])\D?([0-5]\d)\D?([0-5]\d)?\D?(\d{3})?([zZ]|([\+-])([01]\d|2[0-3])\D?([0-5]\d)?)?)?/);
    var hasDates = ISODatePattern.test(query);
    var query = JSON.parse(query);
    for (data in query) {
        if (isObject(query[data]) || !isNaN(query[data])) {
            // es un número o un objeto
            if (hasDates) {
                transformDateRecursive(query)
            }
            findParams[data] = query[data];
        } else {
            // Es un texto
            findParams[data] = {
                $regex: query[data],
                $options: 'i'
            };
        }
        console.log("findParams", JSON.stringify(findParams));
    }
    return findParams;
}

function isObject(obj) {
    return Object.prototype.toString.call(new Object()) == obj;
}

function transformDateRecursive(obj) {
    var ISODatePattern = new RegExp(/(\d{4})\D?(0[1-9]|1[0-2])\D?([12]\d|0[1-9]|3[01])(\D?([01]\d|2[0-3])\D?([0-5]\d)\D?([0-5]\d)?\D?(\d{3})?([zZ]|([\+-])([01]\d|2[0-3])\D?([0-5]\d)?)?)?/);
    for (var k in obj) {
        if (isObject(obj[k]) && obj[k] !== null)
            transformDateRecursive(obj[k]);
        else {
            //console.log('final',obj[k],k);
            if (ISODatePattern.test(obj[k])) {
                obj[k] = new Date(obj[k]);
            }
        }
    }
}

apiServer.listen(serverConfig.port, function() {
    console.log('%s listening at %s', apiServer.name, apiServer.url)
});
