exports.run = function (request, response, db) {
    let query = JSON.parse(JSON.stringify(request.query));

    let mainQuery = (query.base == 'city') ? "select (ST_AsGeoJSON(geom)) from cities where coastal = true" : 'select (ST_AsGeoJSON(geom)) from states where coastal = true';
    db.sql_query(mainQuery).then((success) => {
        console.log('Sucesso');
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
}