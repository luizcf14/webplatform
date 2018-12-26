exports.run = function (ee, request, callBack) {
    
    let query = JSON.parse(JSON.stringify(request.query));
    let keys  = Object.keys(query); 

    //let geometry = ee.Geometry.Point([-43.67340087890625, -2.365508121744195]);
    let geometry = ee.Geometry.Point([parseFloat(query['lon']), parseFloat(query['lat'])]);
    let anoInicial = 1985;
    let anoFinal   = 2017;
    let totalAnos  = anoFinal - anoInicial;

    let listaImagens = ee.List([]);
    for(let anoAtual = anoInicial; anoAtual <= anoFinal; anoAtual++)
    {   
        listaImagens = listaImagens.add(ee.Image('users/luizcf14/Classificados/MABA_'+ anoAtual +'_ft_3'));
    }
    let pontos = ee.ImageCollection(listaImagens).filterBounds(geometry);
    let totalPontos = pontos.size().getInfo();
    let listaPontos = pontos.toList(totalPontos);
    let pontosValores = {};

    for(let indice = 0, anoAtual = anoInicial; indice < totalPontos; indice++, anoAtual++)
    {
        let pontoAtual = ee.Image(listaPontos.get(ee.Number(indice)));        
        pontoAtual = pontoAtual.clip(geometry);
        pontoAtual = pontoAtual.reduceRegion(ee.Reducer.mean(), geometry);
        
        pontoAtual.evaluate(function(info){            
            let chave  = Object.keys(info);
            chave      = chave[0];
            let ano    = parseInt(chave.replace('y', ''));            
            pontosValores[ano.toString()] = info[chave];
            if(chave === 'y' + anoFinal) {                
                callBack(JSON.stringify(pontosValores));
            }
        });  
    }
    /*
    let min = 1;
    let max = 34;
    let result = [];
    for(let index = 0; index < max; index ++) {
        result[index] = getRandomIntInclusive(min, max);
    }
    //console.log(JSON.stringify(result));
    return JSON.stringify(result);
    */
    
};

//module.exports = {
//    run: run
//};