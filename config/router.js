﻿//app, route = nome da rota, view = localização da view no projeto.
let path = require('path');
let publicPath;
let geeFunction;
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

let router = function (app, ee, public, isLocal, db) {
    //pth = isLocal ? '' : '/';
    pth = '';
    defaultRoute(app, '/', 'home/home.ejs');
    defaultRoute(app, '/about', 'about/about');

    geeAlfa(app, ee, db);
    geeTemporalVisualization(app, ee);

    //defaultRoute(app, '*', ' pageNotFound/404.ejs');
    publicPath = public + path.sep + 'public';
    console.log('Sistema de rotas iniciado com sucesso.', publicPath);    
};

module.exports = {
    initRouter: router
};
