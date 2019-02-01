function calcularArea(ee, classification, id, geometry, bandName) {
    let imagem = classification.eq(id);
    let imageArea = imagem.multiply(ee.Image.pixelArea());
    let area = imageArea.reduceRegion({
        reducer: ee.Reducer.sum(),
        geometry: geometry,
        maxPixels: 1e13
    });
    return area.get(bandName).getInfo();
};

function calcularNumPixels(ee, classification, id, geometry, bandName) {
    let imagem = classification.eq(id);
    let numPixels = imagem.reduceRegion({
        reducer: ee.Reducer.count(),
        geometry: geometry,
        maxPixels: 1e13
    });
    return numPixels.get(bandName).getInfo();
};

function calcularMedia(ee, classification, id, geometry, bandName) {
    let imagem = classification.eq(id);
    let media = imagem.reduceRegion({
        reducer: ee.Reducer.mean(),
        geometry: geometry,
        maxPixels: 1e13
    });
    return media.get(bandName).getInfo();;
};

function calcularMediana(ee, classification, id, geometry, bandName) {
    let imagem = classification.eq(id);
    let mediana = imagem.reduceRegion({
        reducer: ee.Reducer.median(),
        geometry: geometry,
        maxPixels: 1e13
    });
    return mediana.get(bandName).getInfo();;
};

function calcularDesvioPadrao(ee, classification, id, geometry, bandName) {
    let imagem = classification.eq(id);
    let desvioPadrao = imagem.reduceRegion({
        reducer: ee.Reducer.median(),
        geometry: geometry,
        maxPixels: 1e13
    });
    return desvioPadrao.get(bandName).getInfo();;
};

exports.run = ((ee, request, response) => {
    var query = JSON.parse(JSON.stringify(request.query));
    let classification = ee.Image('projects/samm/SAMM/Classification_3/2017');
    let geometry = ee.Geometry(JSON.parse(query.geometry));
    classification = classification.clip(geometry);

    let results = [];
    let bandName = classification.bandNames().get(0).getInfo();
    results.push(calcularArea(ee, classification, 2, geometry, bandName));
    results.push(calcularNumPixels(ee, classification, 2, geometry, bandName));
    results.push(calcularMedia(ee, classification, 2, geometry, bandName));
    results.push(calcularMediana(ee, classification, 2, geometry, bandName));
    results.push(calcularDesvioPadrao(ee, classification, 2, geometry, bandName));
    response.send({ result: results });
});
/*
.get(window.location.href + 'gee/tools/statistics', 'geometry=' + JSON.stringify(pp.geometry), function (data) {
	console.log(data);
});
*/