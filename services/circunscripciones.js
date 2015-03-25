
var mongojs = require('mongojs');
var config = require('../config');
var db = mongojs(config.serverConfig.mongoDB);

function get(params,cb){
	cb(null,[]);
}

module.exports = {
    get:get
}