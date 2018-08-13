//app, route = nome da rota, view = localização da view no projeto.
let path = require('path');
let publicPath;
let geeFunction;

function defaultRoute(app, route, view) {
    //app.get monitora a rota informada e devolve uma resposta.
    app.get(route, function (request, response) {
        //Método render é do ejs!
        //O método rende procura automaticamento o diretorio views.
        //Ele espera um arquivo com a extensão 'ejs'	
       // console.log(request.url);

        response.render(view);	
    });
};

function geeAlfa(app, ee) {
    app.get('gee/assetsVisualization/scriptAlfa', function (request, response) {
	geeFunction = require(publicPath + path.sep + 'gee' + path.sep + 'assetsVisualization' + path.sep + 'scriptAlfa.js');
	response.send(geeFunction.run(ee));
        //response.send({ 'token': Mapa.token, 'mapid': Mapa.mapid});
    });
};
function geeTemporalVisualization(app, ee){
    app.get('gee/temporalVisualization/pixelVariation', function(request, response){
	geeFunction = require(publicPath + path.sep + 'gee' + path.sep + 'temporalVisualization' + path.sep + 'pixelVariation.js');
        geeFunction.run(ee, request, function(result){
            response.send(result);
        });                
    });
}

let router = function (app, ee, public) {
    defaultRoute(app, '/', 'home/home.ejs');
    defaultRoute(app, '/about', 'about/about');

    geeAlfa(app, ee);
    geeTemporalVisualization(app, ee);

    //defaultRoute(app, '*', ' pageNotFound/404');
    publicPath = public + path.sep + 'public';
    console.log('Sistema de rotas iniciado com sucesso.', publicPath);
};

module.exports = {
    initRouter: router
};