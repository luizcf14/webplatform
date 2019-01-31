function calcularArea(ee, classification, id, geometria) {
    let imagem = classification.eq(id);
    let imageArea = imagem.multiply(ee.Image.pixelArea());
    let area = imageArea.reduceRegion({
        reducer: ee.Reducer.sum(),
        geometry: geometria,
        maxPixels: 1e13
    })
    return area;
};

function calcularNumPixels(ee, classification, id, geometria) {
    let imagem = classification.eq(id);
    let numPixels = imagem.reduceRegion({
        reducer: ee.Reducer.count(),
        geometry: geometria,
        maxPixels: 1e13
    });
    return numPixels;
};

function calcularMedia(ee, classification, id, geometria) {
    let imagem = classification.eq(id);
    let media = imagem.reduceRegion({
        reducer: ee.Reducer.mean(),
        geometry: geometria,
        maxPixels: 1e13
    });
    return media;
};

function calcularMediana(ee, classification, id, geometria) {
    let imagem = classification.eq(id);
    let mediana = imagem.reduceRegion({
        reducer: ee.Reducer.median(),
        geometry: geometria,
        maxPixels: 1e13
    });
    return mediana;
};

function calcularDesvioPadrao(ee, classification, id, geometria) {
    let imagem = classification.eq(id);
    let desvioPadrao = imagem.reduceRegion({
        reducer: ee.Reducer.median(),
        geometry: geometria,
        maxPixels: 1e13
    });
    return desvioPadrao;
};

exports.run = ((ee, request, response) => {
    let classification = ee.Image('projects/samm/SAMM/Classification_3/2017');
    let geometry = ee.Geometry({ "type": "Polygon", "coordinates": [[[-47.988281, -0.703107], [-44.25293, -2.986927], [-43.505859, -2.372369], [-46.757813, -0.439449], [-46.757813, -0.439449], [-47.988281, -0.703107]]] });
    let bandName;
    let results = [];
    
    classification.bandNames().get(0).evaluate((success, failure) => {
        if (failure === undefined) {
            classification = classification.clip(geometry);
            calcularArea(ee, classification, 2, geometry).get(success).evaluate((success, failure) => {
                
            });
        }
    });
});