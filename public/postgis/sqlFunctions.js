let run = function (request, response, db) {
    let query = JSON.parse(JSON.stringify(request.query));

    let mainQuery = (query.base == 'city') ? "select (ST_AsGeoJSON(geom)) from cities where coastal = true limit 1" : 'select (ST_AsGeoJSON(geom)) from states where coastal = true limit 1';
    db.sql_query(mainQuery).then((success) => {
        response.send({
            'code': 0,/*Its works code.*/
            'result': success.rows
        });
    }).catch((error) => {
        console.log('Erro');
        response.send({
            'code': 1,/*Not works code.*/
            'result': 'Erro durante a busca por municípios, tente novamente.'
        });
    });
};

let getWmsInfo = function (request, response, db) {
    db.sql_query('select year, solved_dt, sedac_dt, mapbiomas_dt, ndvi_dt, ndwi_dt, ndvi_less_ndwi_dt, mmri_dt, points_dt from wms_info').then((success) => {
        response.send(success.rows);
    }).catch((error) => {
        response.send('WMS ERRO.')
    });
};

module.exports = {
    run: run,
    getWmsInfo: getWmsInfo
};