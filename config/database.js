let pool = null;

module.exports = {
    init: function (path) {
        var file = require('fs');
        pool = new require('pg').Pool(JSON.parse(file.readFileSync(path, 'UTF8')));
    },
    sql_query: function (query) {
        if (pool != null) {
            try {
                return pool.query(query);
            } catch (error) {
                return "Erro ao executa a query = " + query;
            }
        } else {
            return "Pool é nulo. Database error.";
        }
    }
};