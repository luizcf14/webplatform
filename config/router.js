//app, route = nome da rota, view = localização da view no projeto.
function defaultRoute (app, route, view) {
    //app.get monitora a rota informada e devolve uma resposta.
    app.get(route, function(request, response){
        //Método render é do ejs!
        //O método rende procura automaticamento o diretorio views.
        //Ele espera um arquivo com a extensão 'ejs'
        response.render(view);
    });
};

var router = function(app){
    defaultRoute(app, '/', 'home/home');
    defaultRoute(app, '/about', 'about/about');
    defaultRoute(app, '*', 'pageNotFound/404');
    console.log('Sistema de rotas iniciado com sucesso.');
};

module.exports = {
    initRouter: router
};