//require('express') return a function.
var path = require('path');
var express = require('express');

//Runs the function of the express variable.
var app = express();

//Application port.
var port = 21039;

//Altera o gerencamento do view engine do express.
//Repassa o gerenciamento para o EJS.
app.set('view engine', 'ejs');
//app.set('view', './views');

//Para exportar vários modulos.
module.exports = {
    getApp: function () { return app; },
    getPort: function () { return port; },
    initPublicPath: function (mainPath) {
        app.use(express.static(mainPath + path.sep + 'public'));
        //console.log(mainPath + path.sep + 'public');
    }
};

//initPublicPath
//https://stackoverflow.com/questions/18629327/adding-css-file-to-ejs