//app, route = nome da rota, view = localização da view no projeto.
let path = require('path');
let publicPath;
let geeFunction;
let sqlFunctions;
let statistics;
let pth;

function defaultRoute(app, route, view) {
    //app.get monitora a rota informada e devolve uma resposta.
    app.get(route, function (request, response) {
        //Método render é do ejs!
        //O método rende procura automaticamento o diretorio views.
        //Ele espera um arquivo com a extensão 'ejs'
        response.render(view);
    });
};

function geeAlfa(app, ee, db) {
    app.get(pth + '/gee/assetsVisualization/scriptAlfa', function (request, response) {
        geeFunction = require(publicPath + path.sep + 'gee' + path.sep + 'assetsVisualization' + path.sep + 'scriptAlfa.js');
        geeFunction.run(ee, request, response, db);
        //response.send(geeFunction.run(ee, request, response, db));
        //response.send({ 'token': Mapa.token, 'mapid': Mapa.mapid});
    });
};

function geeTemporalVisualization(app, ee) {
    app.get(pth + '/gee/temporalVisualization/pixelVariation', function (request, response) {
        geeFunction = require(publicPath + path.sep + 'gee' + path.sep + 'temporalVisualization' + path.sep + 'pixelVariation.js');
        geeFunction.run(ee, request, function (result) {
            response.send(result);
        });
    });
};

function postgisFunctions(app, db) {
    app.get(pth + '/postgis/sqlFunctions', function (request, response) {
        sqlFunctions = require(publicPath + path.sep + 'postgis' + path.sep + 'sqlFunctions.js');
        sqlFunctions.run(request, response, db);
    });
};

function getStatistics(app, ee) {
    console.log(pth + '/gee/tools/statistics');
    app.get(pth + '/gee/tools/statistics', function (request, response) {
        statistics = require(publicPath + path.sep + 'gee' + path.sep + 'tools' + path.sep + 'statistics.js');
        statistics.run(ee, request, response);
    });
};

let router = function (app, ee, public, isLocal, db) {
    pth = isLocal ? '' : '/';
    //pth = '';
    defaultRoute(app, '/', 'home/home.ejs');
    defaultRoute(app, '/about', 'about/about');

    geeAlfa(app, ee, db);
    geeTemporalVisualization(app, ee);
    postgisFunctions(app, db);
    getStatistics(app, ee);
    //defaultRoute(app, '*', ' pageNotFound/404.ejs');
    publicPath = public + path.sep + 'public';
};

module.exports = {
    initRouter: router
};
