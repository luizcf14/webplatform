var server = require('./config/server');
var app  = server.getApp();
var port = server.getPort();
var router = require('./config/router');

//Starts the server.
app.listen(port, function(){
    console.log('Servidor inciado com sucesso!');
});
//Start Router
router.initRouter(app);