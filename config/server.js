//require('express') return a function.
var express = require('express');

//Runs the function of the express variable.
var app = express();

//Application port.
var port = 5000;

//Altera o gerencamento do view engine do express.
//Repassa o gerenciamento para o EJS.
app.set('view engine', 'ejs');
//app.set('view', './views');

//Para exportar vários modulos.
module.exports = {
    getApp: function() {return app;},
    getPort: function() {return port}
};