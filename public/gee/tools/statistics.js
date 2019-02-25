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
    let query = JSON.parse(JSON.stringify(request.query));
    let geometries = JSON.parse(request.query.geometry);
    let results = [];

    for (let year = 2000; year < 2018; year++) {
        console.log(year);
        let area = 0;
        geometries.forEach(geom => {
            let classification = ee.Image('projects/samm/SAMM/Classification_3/' + year);//query.year);
            let geometry = ee.Geometry(geom);//JSON.parse(query.geometry));
            classification = classification.clip(geometry);
            let bandName = classification.bandNames().get(0).getInfo();
            area += calcularArea(ee, classification, 2, geometry, bandName);
        });
        results.push(area);
    }

    //results.push(calcularNumPixels(ee, classification, 2, geometry, bandName));
    //results.push(calcularMedia(ee, classification, 2, geometry, bandName));
    //results.push(calcularMediana(ee, classification, 2, geometry, bandName));
    //results.push(calcularDesvioPadrao(ee, classification, 2, geometry, bandName));    
    response.send(results);
});
/*
.get(window.location.href + 'gee/tools/statistics', 'geometry=' + JSON.stringify(pp.geometry), function (data) {
	console.log(data);
});
*/