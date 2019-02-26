let proccess = function ({ "ee": ee, "isRequest": isRequest, "response": response, "db": db, "year": year }) {
    if (year.toString() != "NaN") {
        var integrated = ee.ImageCollection('projects/mapbiomas-workspace/COLECAO3/integracao-ft-dev').filterMetadata('version', 'equals', '2').min();
        var exp = '100*(b(0)+b(1)+b(2)+b(3)+b(4)+b(5)+b(6)+b(7)+b(8)+b(9)+b(10)+b(11)+b(12)+b(13)+b(14)+b(15)+b(16)+b(17)+b(18)+b(19)+b(20)+b(21)+b(22)+b(23)+b(24)+b(25)+b(26)+b(27)+b(28)+b(29)+b(30)+b(31)+b(32))/33';
        var mangroveFreq = integrated.eq(5).expression(exp);
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

        var mangroveMap = (mangroveFreq.mask(mangroveFreq.neq(0))).getMap({ 'palette': '00ff00,ffff00,ff0000', 'min': 1, 'max': 100 });

        var chandra = ee.ImageCollection('LANDSAT/MANGROVE_FORESTS').mosaic();
        var image = ee.Image('projects/samm/SAMM/Mosaic/' + year);
        var pontosMangue = null;

        var regioes = ['AP', 'ESSP', 'MAR', 'PAMA', 'PEBA', 'PIPB', 'SPSC'];
        regioes.forEach(regiao => {
            if (pontosMangue == null) {
                pontosMangue = ee.FeatureCollection('projects/samm/Mapbiomas/Classificacao/Pontos/' + regiao + '/pts_class_5_' + year);
            } else {
                pontosMangue = pontosMangue.merge(ee.FeatureCollection('projects/samm/Mapbiomas/Classificacao/Pontos/' + regiao + '/pts_class_5_' + year));
            }
        });

        var classification = ee.Image('projects/samm/SAMM/Classification_3/' + year).visualize({ palette: 'ff0000' });
        var NDVI = image.select('NDVI');
        var NDWI = image.select('NDWI');
        var NDVI_sub_NDWI = NDWI.subtract(NDVI).rename('NDVI_sub_NDWI');
        var MMRI = image.select('MMRI');

        NDVI = autoStretch(ee, NDVI, 'NDVI', false, 50, 180).getMap();
        NDWI = autoStretch(ee, NDWI, 'NDWI', false, 20, 180).getMap();
        NDVI_sub_NDWI = autoStretch(ee, NDVI_sub_NDWI, 'NDVI_sub_NDWI', false, -225, 235).getMap();
        MMRI = autoStretch(ee, MMRI, 'MMRI', false, 20, 200).getMap();
        pontosMangue = pontosMangue.getMap();
        classification = classification.getMap();
        chandra = chandra.getMap({ "opacity": 1, "bands": ["1"], "min": 1, "max": 1, "palette": ["aa0000"] });

        if (isRequest) {
            response.send({
                'Solved': [classification.mapid, classification.token, 'Solved', 0],
                'SEDAC - NASA': [chandra.mapid, chandra.token, 'SEDAC - NASA', 0],
                'MapBiomas': [mangroveMap.mapid, mangroveMap.token, 'MapBiomas', 1],
                'NDVI': [NDVI.mapid, NDVI.token, 'NDVI', 0],
                'NDWI': [NDWI.mapid, NDWI.token, 'NDWI', 0],
                'NDVI - NDWI': [NDVI_sub_NDWI.mapid, NDVI_sub_NDWI.token, 'NDVI - NDWI', 0],
                'MMRI': [MMRI.mapid, MMRI.token, 'MMRI', 0],
                'points': [pontosMangue.mapid, pontosMangue.token, 'Pontos', 0]
            });
        } else {
            /*let sql_query = `insert into wms_info (year, solved_dt, sedac_dt, mapbiomas_dt, ndvi_dt, ndwi_dt, ndvi_less_ndwi_dt, mmri_dt, points_dt)
            values ('${year}', '${classification.mapid}, ${classification.token}, Solved, 0', '${chandra.mapid}, ${chandra.token}, SEDAC - NASA, 0',
                '${mangroveMap.mapid}, ${mangroveMap.token}, Mapbiomas, 1', '${NDVI.mapid}, ${NDVI.token}, NDVI, 0',
                '${NDWI.mapid}, ${NDWI.token}, NDWI, 0', '${NDVI_sub_NDWI.mapid}, ${NDVI_sub_NDWI.token}, NDVI - NDWI, 0',
                '${MMRI.mapid}, ${MMRI.token}, MMRI, 0', '${pontosMangue.mapid}, ${pontosMangue.token}, Pontos, 0')`;
            */           
            let sql_query = `update wms_info set
            solved_dt = '${classification.mapid}, ${classification.token}, Diniz et Al 2019, 0',
            sedac_dt = '${chandra.mapid}, ${chandra.token}, SEDAC - NASA, 0',
            mapbiomas_dt = '${mangroveMap.mapid}, ${mangroveMap.token}, Mapbiomas, 1',
            ndvi_dt = '${NDVI.mapid}, ${NDVI.token}, NDVI, 0',
            ndwi_dt = '${NDWI.mapid}, ${NDWI.token}, NDWI, 0',
            ndvi_less_ndwi_dt = '${NDVI_sub_NDWI.mapid}, ${NDVI_sub_NDWI.token}, NDVI - NDWI, 0',
            mmri_dt = '${MMRI.mapid}, ${MMRI.token}, MMRI, 0',
            points_dt = '${pontosMangue.mapid}, ${pontosMangue.token}, Pontos, 0' where year = '${year}'`;            
            db.sql_query(sql_query).then((success) => {
                console.log(`Ano ${year} processado  com sucesso...`);
                return true;
            }).catch((error) => {
                console.error('Meu erro ', error);
                return false;
            });
        }
    } else {
        response.send({
            'Solved': ['Solved', 0],
            'SEDAC - NASA': ['SEDAC - NASA', 0],
            'MapBiomas': ['MapBiomas', 1],
            'NDVI': ['NDVI', 0],
            'NDWI': ['NDWI', 0],
            'NDVI - NDWI': ['NDVI - NDWI', 0],
            'MMRI': ['MMRI', 0],
            'points': ['Pontos', 0]
        });
    }
};
//By Gilberto Nerino
function autoStretch(ee, image, bandName, onOff, min, max) {

    if (onOff) {
        var minMax = image.reduceRegion({
            reducer: ee.Reducer.minMax(),
            maxPixels: 1e13,
            geometry: ee.Image(image).geometry().bounds(),
            scale: 60
        });

        console.log(minMax.getInfo())
        image = image.visualize({ min: minMax.get(bandName + '_min'), max: minMax.get(bandName + '_max') });
        return image;
    } else {
        image = image.visualize({ min: min, max: max });
        return image;
    }
};

let runWithRequest = function (ee, request, response, db) {
    let query = JSON.parse(JSON.stringify(request.query));
    let year = parseInt(query['year']);
    console.log('Ano atual ', year);
    proccess({ "ee": ee, "isRequest": true, "response": response, "year": year });
};
let runWithoutRequest = function (ee, db) {
    for (let year = 2000; year < 2018; year++) {
        console.log('Procesando ', year);
        proccess({ "ee": ee, "isRequest": false, "year": year, "db": db });
    }
};

module.exports = {
    run: runWithRequest,
    runWithoutRequest: runWithoutRequest
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