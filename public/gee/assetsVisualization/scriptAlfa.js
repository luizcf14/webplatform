//var module = { exports: {} };
//let exports = module.exports   = {};
//var exports = module.exports = {};

exports.run = function (ee) {
    let year = 2000; // adiconar call que muda o valor do ano
    let chandra = ee.ImageCollection('LANDSAT/MANGROVE_FORESTS').mosaic();
    let asset = 'projects/mapbiomas-workspace/COLECAO3/integracao-ft-dev';
    let assetCartas = 'projects/mapbiomas-workspace/AUXILIAR/cartas';
    let assetRegions = "projects/mapbiomas-workspace/AUXILIAR/regioes_1_1000000";

    let regions = ee.FeatureCollection(assetRegions);

    let collection = ee.ImageCollection(asset).filterMetadata('version', 'equals', '2');

    let cartas = ee.FeatureCollection(assetCartas);
    let integrated = collection.min();
    let exp = '100*(b(0)+b(1)+b(2)+b(3)+b(4)+b(5)+b(6)+b(7)+b(8)+b(9)+b(10)+b(11)+b(12)+b(13)+b(14)+b(15)+b(16)+b(17)+b(18)+b(19)+b(20)+b(21)+b(22)+b(23)+b(24)+b(25)+b(26)+b(27)+b(28)+b(29)+b(30)+b(31)+b(32))/33';
    let years = [
        1985, 1986, 1987, 1988, 1989, 1990,
        1991, 1992, 1993, 1994, 1995, 1996,
        1997, 1998, 1999, 2000, 2001, 2002,
        2003, 2004, 2005, 2006, 2007, 2008,
        2009, 2010, 2011, 2012, 2013, 2014,
        2015, 2016, 2017
    ];
    let mangroveFreq = integrated.eq(5).expression(exp);
    var annvFreq = integrated.eq(13).expression(exp);
    var florFreq = integrated.eq(3).expression(exp);
    var pastFreq = integrated.eq(15).or(integrated.eq(21)).expression(exp);
    var aguaFreq = integrated.eq(33).expression(exp);
    var savaFreq = integrated.eq(4).expression(exp);
    var PeDuFreq = integrated.eq(23).or(integrated.eq(25)).expression(exp);
    var riosFreq = integrated.eq(33).expression(exp);
    mangroveFreq = mangroveFreq.where(mangroveFreq.lte(10),0);
    mangroveFreq = mangroveFreq.where(florFreq.gte(50),0);
    mangroveFreq = mangroveFreq.where(mangroveFreq.lte(35).and(florFreq.gte(30)),0);
    mangroveFreq = mangroveFreq.where(mangroveFreq.lte(35).and(savaFreq.gte(30)),0);
    mangroveFreq = mangroveFreq.where(mangroveFreq.lte(35).and(pastFreq.gte(30)),0);
    mangroveFreq = mangroveFreq.where(mangroveFreq.lte(35).and(annvFreq.gte(30)),0);
    mangroveFreq = mangroveFreq.where(mangroveFreq.lte(35).and(PeDuFreq.gte(30)),0);
    mangroveFreq = mangroveFreq.where(mangroveFreq.lte(35).and(florFreq.gte(30).and(riosFreq.gte(30))),0);
    var newIntegration = ee.Image(0);
   
    var mangrove = integrated.select('classification_'+year);
    mangrove = mangrove.mask(mangrove.eq(5));
    mangrove = mangrove.updateMask(mangroveFreq.neq(0));
    newIntegration = newIntegration.addBands(mangrove.rename('classification_'+year));
    
    let newMangroveClassificationMap = newIntegration.select('classification_'+year).getMap({'palette':'#006400'});

    let mangroveMap = (mangroveFreq.mask(mangroveFreq.neq(0))).getMap({ 'palette': '00ff00,ffff00,ff0000','min': 1,'max': 100});
    let chandraMap = chandra.getMap({'palette':'#aa0000'})
    let maba = ee.Image('users/luizcf14/AmericaSul/BR_1991_class_MABA');
    let brasil = ee.Image('projects/mapbiomas-workspace/TRANSVERSAIS/ZONACOSTEIRA/Mosaic_ZC_2000_colecao_3').getMap({
        bands: ["swir1", "nir", "red"], gamma: 1, min: 101, max: 141, opacity: 1
    });;
    //console.log('Função alfa executada corretamente!');
    return {
        'key_1': [mangroveMap.mapid, mangroveMap.token, 'Mangrove Frequence'],
        'key_2': [chandraMap.mapid, chandraMap.token, 'Mangrove (Giri Chandra et al, 2013)'],
        'key_3': [brasil.mapid, brasil.token, 'Landsat Mosaic'],
        'key_4': [newMangroveClassificationMap.mapid, newMangroveClassificationMap.token, 'Mangrove Brasil - (Cesar Diniz et al, 2018)']
    }
};

//module.exports = {
//    run: run
//};



