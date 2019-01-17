exports.run = function (request, response, db) {
    let mainQuery = "select (ST_AsGeoJSON(geom)) from mangroveinfo" //where (city = 'Belém' and state = 'Pará')"// or (city = 'Altamira' and state = 'Pará')";
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