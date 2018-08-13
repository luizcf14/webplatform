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
$.get('platform/gee/assetsVisualization/scriptAlfa', null, function (data) {
    //console.log(data);
    let mapLayers = [];
    let keys = Object.keys(data);
    let max = keys.length;
    let layersValues = [max];
    let base = {};
    //console.log('Keys', keys);
    for (let index = 0; index < max; index++) {
        let values = data[keys[index]];
        let temp = L.tileLayer('https://earthengine.googleapis.com/map/{mapid}/{z}/{x}/{y}?token={token}', {
            attribution: '',
            maxZoom: 18,
            mapid: values[0], // 0 is ID
            token: values[1] // 1 is TOKEN
        });
        layersValues[index] = temp;
        base[values[2]] = temp;
    }
    
    L.control.layers(null, base).addTo(finalMap);
    // "<input type='range' min='0' max='100' step='1'>" 
    $("label div").wrap("<div class='boxClass' style='float:left;'>");
    $(".boxClass div").append("<div style='clear:both;'></span>");
    $(".boxClass div div").append("<input class='rangeOption' type='range' min='0' max='1' step='0.01' value='1'>");

    $(".rangeOption").each(function (key, elem) {
        $(elem).attr('id', 'rangeOpId_' + key);
        $("#rangeOpId_" + key).on("input change", function () {
            layersValues[key].setOpacity(this.value);
        });
    });
    var popup = L.popup();

	function onMapClick(e) {
        //popup.setLatLng(e.latlng).setContent("Carregando!").openOn(finalMap);
        $("#TVGraph").modal();
        document.getElementById('chart_div').innerHTML = '<div class="center-block"><span class="fa fa-cog fa-spin"></span> Carregando</div>';
        //$("#saveGraphPNG").attr('class', 'modal-footer d-none');        
        $.get('platform/gee/temporalVisualization/pixelVariation', 'lat=' + (e.latlng.lat) + '&lon=' +(e.latlng.lng), function (data) {
            creatGraph(data);
        });        
	}
	finalMap.on('click', onMapClick);
});

let currentChart   = null;
let currentGraph   = null;
let currentOptions = null;

function creatGraph(data)
{
    let graph = getGoogleVizualization("DataTable");
    data = JSON.parse(data);
    let keys  = Object.keys(data);
    let rows = [];
    
    keys.forEach(key => {
        rows.push([key, data[key]]);    
    });

    // Declare columns
    graph.addColumn('string', 'X');
    graph.addColumn('number', 'Variação do Pixel');
    
    // Add data.
    graph.addRows(rows);

    let options = {
        title: "Variação Temporal",
        position: "center",
        height: 300,
        legend: "none",
        vAxis: {
            viewWindowMode: 'explicit',
            viewWindow: {
                min: 0                
            }                       
        },
        hAxis:{
            title: "Ano"
        }        
    };    

    let chart =  getGoogleVizualization("LineChart");    
    chart.draw(graph, options);
    //$("#saveGraphPNG").attr('class', 'modal-footer');

    currentChart   = chart;
    currentGraph   = graph;
    currentOptions = options;

    $( window ).resize(function() {
        currentChart.draw(currentGraph, currentOptions);
    });
}

function savePNG()
{
    window.open(currentChart.getImageURI(),'_blank');
}
