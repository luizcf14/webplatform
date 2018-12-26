let path = require('path');
let server = require('./config/server');
let router = require('./config/router');
let ee = require('./config/earthEngine');

let keyFile = "serviceKey.json";

server.initPublicPath(__dirname);
ee = ee.init(__dirname + path.sep + keyFile);

let app = server.getApp();
let port = server.getPort();

//Change this.
let isLocal = false;

ee.initialize(null, null, () => {
    //Starts Server.
    app.listen(port, function () {
        console.log('Servidor inciado com sucesso! Porta  = ', port);
    });
    //Start Router
    router.initRouter(app, ee, __dirname, isLocal); 
});