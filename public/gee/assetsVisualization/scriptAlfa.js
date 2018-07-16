let run = function (ee) {
    let maba = ee.Image('users/luizcf14/AmericaSul/BR_1991_class_MABA');
    let brasil_87 = ee.Image('users/gilbertonerinojr/assetsApicum/BRAZIL_North_1987');
    let brasil_88 = ee.Image('users/gilbertonerinojr/assetsApicum/BRAZIL_North_1988');
    let coisaNova = ee.Image('users/gilbertonerinojr/exampleExport');

    let mabaMapa = maba.randomVisualizer().getMap({});
    let brasil_87Mapa = brasil_87.randomVisualizer().getMap({});
    let brasil_88Mapa = brasil_88.randomVisualizer().getMap({});
    let coisaMapa = coisaNova.randomVisualizer().getMap({
        bands: ["red", "nir", "swir1"], gamma: 1, min: 101, max: 141, opacity: 1
    });
    console.log('Função alfa executada corretamente!');
    return {
        'tokenMaba': mabaMapa.token, 'idMaba': mabaMapa.mapid,
        'token87': brasil_87Mapa.token, 'id87': brasil_87Mapa.mapid,
        'token88': brasil_88Mapa.token, 'id88': brasil_88Mapa.mapid,
        'tokencoisa': coisaMapa.token, 'idcoisa': coisaMapa.mapid
    }
};

module.exports = {
    run: run
};