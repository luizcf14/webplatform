exports.run = function (ee, request, response, db) {
    var query = JSON.parse(JSON.stringify(request.query));
    var year = parseInt(query['year']);

    var image = ee.Image('projects/samm/SAMM/Mosaic/' + year);
    var pontosMangue;

    var regiao = 'AP';
    pontosMangue = ee.FeatureCollection('projects/samm/Mapbiomas/Classificacao/Pontos/' + regiao + '/pts_class_5_' + year);

    regiao = 'ESSP';
    pontosMangue = pontosMangue.merge(ee.FeatureCollection('projects/samm/Mapbiomas/Classificacao/Pontos/' + regiao + '/pts_class_5_' + year));

    regiao = 'MAR';
    pontosMangue = pontosMangue.merge(ee.FeatureCollection('projects/samm/Mapbiomas/Classificacao/Pontos/' + regiao + '/pts_class_5_' + year));

    regiao = 'PAMA';
    pontosMangue = pontosMangue.merge(ee.FeatureCollection('projects/samm/Mapbiomas/Classificacao/Pontos/' + regiao + '/pts_class_5_' + year));

    regiao = 'PEBA';
    pontosMangue = pontosMangue.merge(ee.FeatureCollection('projects/samm/Mapbiomas/Classificacao/Pontos/' + regiao + '/pts_class_5_' + year));

    regiao = 'PIPB';
    pontosMangue = pontosMangue.merge(ee.FeatureCollection('projects/samm/Mapbiomas/Classificacao/Pontos/' + regiao + '/pts_class_5_' + year));

    regiao = 'SPSC';
    pontosMangue = pontosMangue.merge(ee.FeatureCollection('projects/samm/Mapbiomas/Classificacao/Pontos/' + regiao + '/pts_class_5_' + year));

    var classification = ee.Image('projects/samm/SAMM/Classification_3/10_' + year);

    var NDVI = image.select('NDVI');
    var NDWI = image.select('NDWI');
    var NDVI_sub_NDWI = NDWI.subtract(NDVI);
    var MMRI = image.select('MMRI');

    //===Auto Stretch===
    var minMax = NDVI.reduceRegion({
        reducer: ee.Reducer.percentile([1, 95]),
        maxPixels: 1e12,
        scale: 30
    });
    //================== 
    var imgNDVI = NDVI.visualize({ min: minMax.get("NDVI_p1"), max: minMax.get("NDVI_p95") });
    response.send({
        //'key_1': [brasil.mapid, brasil.token, 'Landsat Mosaic', 0],
        'key_4': [newMangroveClassificationMap.mapid, newMangroveClassificationMap.token, 'Solved', 0], //Mangrove Brasil - (Cesar Diniz et al, 2018)
        'key_2': [chandraMap.mapid, chandraMap.token, 'NASA', 0], //Mangrove (Giri Chandra et al, 2013)
        'key_3': [mangroveMap.mapid, mangroveMap.token, 'MapBiomas', 1], //Mangrove Frequence            
        'points': success.rows
    });
};
//var module = { exports: {} };
//let exports = module.exports   = {};
//var exports = module.exports = {};
/*
exports.run = function (ee, request, response, db) {

    let query = JSON.parse(JSON.stringify(request.query));
    let year = parseInt(query['year']); // adiconar call que muda o valor do ano
    let chandra = ee.ImageCollection('LANDSAT/MANGROVE_FORESTS').mosaic();
    let asset = 'projects/mapbiomas-workspace/COLECAO3/integracao-ft-dev';
    //let assetCartas = 'projects/mapbiomas-workspace/AUXILIAR/cartas';
    let assetRegions = "projects/mapbiomas-workspace/AUXILIAR/regioes_1_1000000";

    let regions = ee.FeatureCollection(assetRegions);

    let collection = ee.ImageCollection(asset).filterMetadata('version', 'equals', '2');

    //let cartas = ee.FeatureCollection(assetCartas);
    let integrated = collection.min();
    let exp = '100*(b(0)+b(1)+b(2)+b(3)+b(4)+b(5)+b(6)+b(7)+b(8)+b(9)+b(10)+b(11)+b(12)+b(13)+b(14)+b(15)+b(16)+b(17)+b(18)+b(19)+b(20)+b(21)+b(22)+b(23)+b(24)+b(25)+b(26)+b(27)+b(28)+b(29)+b(30)+b(31)+b(32))/33';

    let mangroveFreq = integrated.eq(5).expression(exp);
    var annvFreq = integrated.eq(13).expression(exp);
    var florFreq = integrated.eq(3).expression(exp);
    var pastFreq = integrated.eq(15).or(integrated.eq(21)).expression(exp);
    var aguaFreq = integrated.eq(33).expression(exp);
    var savaFreq = integrated.eq(4).expression(exp);
    var PeDuFreq = integrated.eq(23).or(integrated.eq(25)).expression(exp);
    var riosFreq = integrated.eq(33).expression(exp);
    mangroveFreq = mangroveFreq.where(mangroveFreq.lte(10), 0);
    mangroveFreq = mangroveFreq.where(florFreq.gte(50), 0);
    mangroveFreq = mangroveFreq.where(mangroveFreq.lte(35).and(florFreq.gte(30)), 0);
    mangroveFreq = mangroveFreq.where(mangroveFreq.lte(35).and(savaFreq.gte(30)), 0);
    mangroveFreq = mangroveFreq.where(mangroveFreq.lte(35).and(pastFreq.gte(30)), 0);
    mangroveFreq = mangroveFreq.where(mangroveFreq.lte(35).and(annvFreq.gte(30)), 0);
    mangroveFreq = mangroveFreq.where(mangroveFreq.lte(35).and(PeDuFreq.gte(30)), 0);
    mangroveFreq = mangroveFreq.where(mangroveFreq.lte(35).and(florFreq.gte(30).and(riosFreq.gte(30))), 0);
    var newIntegration = ee.Image(0);

    var mangrove = integrated.select('classification_' + year);
    mangrove = mangrove.mask(mangrove.eq(5));
    mangrove = mangrove.updateMask(mangroveFreq.neq(0));
    newIntegration = newIntegration.addBands(mangrove.rename('classification_' + year));

    let newMangroveClassificationMap = newIntegration.select('classification_' + year).getMap({ 'palette': '#006400' });

    let mangroveMap = (mangroveFreq.mask(mangroveFreq.neq(0))).getMap({ 'palette': '00ff00,ffff00,ff0000', 'min': 1, 'max': 100 });
    let chandraMap = chandra.getMap({ 'palette': '#aa0000' })
    let maba = ee.Image('users/luizcf14/AmericaSul/BR_1991_class_MABA');
    let brasil = ee.Image('projects/mapbiomas-workspace/TRANSVERSAIS/ZONACOSTEIRA/Mosaic_ZC_' + year + '_colecao_3').getMap({
        bands: ["swir1", "nir", "red"], gamma: 1, min: 101, max: 141, opacity: 1
    });;
    //console.log('Função alfa executada corretamente!');
    let sql_query = `SELECT ID, ST_X(GEOM), ST_Y(GEOM) FROM MANGROVEPOINTS WHERE MANGROVE = TRUE LIMIT 5000`;
    db.sql_query(sql_query).then((success) => {
        console.log("Enviando resultados");
        response.send({
            //'key_1': [brasil.mapid, brasil.token, 'Landsat Mosaic', 0],
            'key_4': [newMangroveClassificationMap.mapid, newMangroveClassificationMap.token, 'Solved', 0], //Mangrove Brasil - (Cesar Diniz et al, 2018)
            'key_2': [chandraMap.mapid, chandraMap.token, 'NASA', 0], //Mangrove (Giri Chandra et al, 2013)
            'key_3': [mangroveMap.mapid, mangroveMap.token, 'MapBiomas', 1], //Mangrove Frequence            
            'points': success.rows
        });
    }).catch((error) => {
        response.send(error);
    });
};
*/