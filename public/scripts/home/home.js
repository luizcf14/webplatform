//let mymap = L.map('mapid').setView([-1.464261, -48.470320], 5);
let defaultMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiY2FkYXN0cm9zZGl2ZXJzb3MiLCJhIjoiY2pqOTNuNXY3MmwzaDNxcjU2YTVraGxvNyJ9.2Lv4RwCJl79HhlO-cuDcHQ'
});//.addTo(mymap);

let finalMap = L.map('mapid', {
    center: [-1.464261, -48.470320],
    zoom: 5,
    layers: [defaultMap]
});

defaultMap.addTo(finalMap);
$.get('/gee/assetsVisualization/scriptAlfa', null, function (data) {
    
    let maba = L.tileLayer('https://earthengine.googleapis.com/map/{mapid}/{z}/{x}/{y}?token={token}', {
        attribution: '',
        maxZoom: 18,
        mapid: data.idMaba,
        token: data.tokenMaba
    });//.addTo(mymap);

    let a87 = L.tileLayer('https://earthengine.googleapis.com/map/{mapid}/{z}/{x}/{y}?token={token}', {
        attribution: '',
        maxZoom: 18,
        mapid: data.id87,
        token: data.token87
    });//.addTo(mymap);

    let a88 = L.tileLayer('https://earthengine.googleapis.com/map/{mapid}/{z}/{x}/{y}?token={token}', {
        attribution: '',
        maxZoom: 18,
        mapid: data.id88,
        token: data.token88
    });//.addTo(mymap);

    let coisa = L.tileLayer('https://earthengine.googleapis.com/map/{mapid}/{z}/{x}/{y}?token={token}', {
        attribution: '',
        maxZoom: 18,
        mapid: data.idcoisa,
        token: data.tokencoisa
    });//.addTo(mymap);


    let baseMaps = {
        "MABA": maba,
        "APICUM 88": a88,
        "APICUM 87": a87,
        "COISA": coisa
    };
    L.control.layers(null, baseMaps).addTo(finalMap);
    // "<input type='range' min='0' max='100' step='1'>" 
    $("label div").wrap("<div class='jrs' style='float:left;'>");
    $(".jrs div").append("<div id='hue' style='clear:both;'></span>");
    $(".jrs div div").append("<input class='rangeOpId' type='range' min='0' max='1' step='0.01' value='1'>");

    //$( "label div" ).after("</div>");
    $(".rangeOpId").on("input change", function () {
        coisa.setOpacity(this.value);
    });
});