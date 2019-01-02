exports.run = function (ee, request, callBack) {
    var query = JSON.parse(JSON.stringify(request.query));

    var startYear = 2000;
    var endYear = 2017;
    var geometry = ee.Geometry.Point([parseFloat(query['lon']), parseFloat(query['lat'])]);

    var imageList = ee.List([]);
    for (var currentYear = startYear; currentYear <= endYear; currentYear++) {
        imageList = imageList.add(ee.Image('projects/samm/SAMM/Classification_3/10_' + currentYear));
    }
    var points = ee.ImageCollection(imageList).filterBounds(geometry);
    var totalPoints = points.size().getInfo();
    var pointsList = points.toList(totalPoints);

    var variation = [];
    for (var index = 0, currentYear = startYear; index < totalPoints; index++ , currentYear++) {
        var currentPoint = ee.Image(pointsList.get(ee.Number(index)));
        currentPoint = currentPoint.clip(geometry);
        currentPoint = currentPoint.reduceRegion(ee.Reducer.mean(), geometry).get('classification_' + currentYear);
        currentPoint.evaluate(function (result) {
            variation.push(result);
            if (variation.length == 17) {
                callBack(JSON.stringify(variation));
            }
        });
    }
};
/*exports.run = function (ee, request, callBack) {

    let query = JSON.parse(JSON.stringify(request.query));
    let keys  = Object.keys(query);

    //let geometry = ee.Geometry.Point([-43.67340087890625, -2.365508121744195]);
    let geometry = ee.Geometry.Point([parseFloat(query['lon']), parseFloat(query['lat'])]);
    let startYear = 1985;
    let endYear   = 2017;
    let totalAnos  = endYear - startYear;

    let imageList = ee.List([]);
    for(let currentYear = startYear; currentYear <= endYear; currentYear++)
    {
        imageList = imageList.add(ee.Image('users/luizcf14/Classificados/MABA_'+ currentYear +'_ft_3'));
    }
    let points = ee.ImageCollection(imageList).filterBounds(geometry);
    let totalPoints = points.size().getInfo();
    let pointsList = points.toList(totalPoints);
    let pointsValores = {};

    for(let index = 0, currentYear = startYear; index < totalPoints; index++, currentYear++)
    {
        let currentPoint = ee.Image(pointsList.get(ee.Number(index)));
        currentPoint = currentPoint.clip(geometry);
        currentPoint = currentPoint.reduceRegion(ee.Reducer.mean(), geometry);

        currentPoint.evaluate(function(info){
            let chave  = Object.keys(info);
            chave      = chave[0];
            let ano    = parseInt(chave.replace('y', ''));
            pointsValores[ano.toString()] = info[chave];
            if(chave === 'y' + endYear) {
                callBack(JSON.stringify(pointsValores));
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

//};

//module.exports = {
//    run: run
//};
