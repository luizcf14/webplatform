exports.run = function (request, response, db) {
    let query = JSON.parse(JSON.stringify(request.query));

    let mainQuery = (query.base == 'city') ? "select (ST_AsGeoJSON(geom)) from coastinfo" : 'select (ST_AsGeoJSON(geom)) from states';
    db.sql_query(mainQuery).then((success) => {
        response.send({
            'code': 0,/*Its works code.*/
            'result': success.rows
        });
    }).catch((error) => {
        response.send({
            'code': 1,/*Not works code.*/
            'result': 'Erro durante a busca por municípios, tente novamente.'
        });
    });
}