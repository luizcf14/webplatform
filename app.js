var path = require('path');
var server = require('./config/server');
var router = require('./config/router');
var ee = require('./config/earthEngine');
var db = require('./config/database');

var keyFile = "serviceKey.json";
var dbConfig = "database.json";

server.initPublicPath(__dirname);
ee = ee.init(__dirname + path.sep + keyFile);
db.init(__dirname + path.sep + dbConfig);

var app = server.getApp();
var port = server.getPort();

ee.initialize(null, null, () => {
    //Starts the server.
    app.listen(port, function () {
        console.log('Servidor inciado com sucesso! Porta  = ', port);
    });
    //Start Router
    router.initRouter(app, ee, __dirname, false, db);
});