//let platform = 'platform/';
let platform = '';
//let mymap = L.map('mapid').setView([-1.464261, -48.470320], 5);
let firstYear = 2000;
let lastYear = 2017;

let defaultMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiY2FkYXN0cm9zZGl2ZXJzb3MiLCJhIjoiY2pqOTNuNXY3MmwzaDNxcjU2YTVraGxvNyJ9.2Lv4RwCJl79HhlO-cuDcHQ'
});//.addTo(mymap);

let finalMap = L.map('mapid', { center: [-1.464261, -48.470320], zoom: 5, layers: [defaultMap] });

let MapLayers = null;
let setOnclick = true;
let selectYear = 2000;

defaultMap.addTo(finalMap);
addMapLayers(firstYear);
function addMapLayers(currentYear) {
    if (MapLayers != null) {
        //console.log(defaultMap);
        //console.log(finalMap.getLayers());
        let centerValues = finalMap.getCenter();
        let zoomValue = finalMap.getZoom();
        finalMap.remove();
        //finalMap.clearLayers();
        finalMap = L.map('mapid', { center: centerValues, zoom: zoomValue, layers: [defaultMap] });
        MapLayers.remove();
    }

    $.get(platform + 'gee/assetsVisualization/scriptAlfa', 'year=' + (currentYear), function (data) {
        //console.log(data);        
        let keys = Object.keys(data);
        let max = keys.length;
        let layersValues = [max];
        let base = {};
        //console.log('Keys', keys);
        for (let index = 0; index < max; index++) {
            if (keys[index] != "points") {
                let values = data[keys[index]];
                let temp = L.tileLayer('https://earthengine.googleapis.com/map/{mapid}/{z}/{x}/{y}?token={token}', {
                    attribution: '',
                    maxZoom: 18,
                    mapid: values[0], // 0 is ID
                    token: values[1] // 1 is TOKEN
                });
                layersValues[index] = temp;
                base[htmlOutput(values[2], values[3])] = temp;
            } else {
                let points = data[keys[index]];
                let pointsList = [];
                points.forEach(point => {
                    pointsList.push(
                        L.circle([point['st_y'], point['st_x']], {
                            color: 'blue',
                            fillColor: 'blue',
                            fillOpacity: 0.5,
                            radius: 1
                        })//.addTo(finalMap);
                    )
                });
                base[htmlOutput('Pontos de amostra', -1)] = L.layerGroup(pointsList);
            }
        }

        MapLayers = L.control.layers(null, base, { collapsed: false }).addTo(finalMap);
        $( "<p>Test</p>" ).insertAfter( ".leaflet-control-layers.leaflet-control-layers-expanded.leaflet-control" );
        $(".rangeOption").each(function (key, elem) {
            $(elem).attr('id', 'rangeOpId_' + key);
            $("#rangeOpId_" + key).on("input change", function () {
                layersValues[key].setOpacity(this.value);
            });
        });

        function onMapClick(e) {
            //popup.setLatLng(e.latlng).setContent("Carregando!").openOn(finalMap);
            $("#TVGraph").modal();
            document.getElementById('chart_div').innerHTML = '<div class="center-block"><span class="fa fa-cog fa-spin"></span> Carregando</div>';
            //$("#saveGraphPNG").attr('class', 'modal-footer d-none');
            $.get(platform + 'gee/temporalVisualization/pixelVariation', 'lat=' + (e.latlng.lat) + '&lon=' + (e.latlng.lng), function (data) {
                creatGraph(data);
            });
        }
        //finalMap.on('click', onMapClick);
    });
}

let currentChart = null;
let currentGraph = null;
let currentOptions = null;

function creatGraph(data) {
    let graph = getGoogleVizualization("DataTable");
    data = JSON.parse(data);
    let keys = Object.keys(data);
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
        hAxis: {
            title: "Ano"
        }
    };

    let chart = getGoogleVizualization("LineChart");
    chart.draw(graph, options);
    //$("#saveGraphPNG").attr('class', 'modal-footer');

    currentChart = chart;
    currentGraph = graph;
    currentOptions = options;

    $(window).resize(function () {
        currentChart.draw(currentGraph, currentOptions);
    });
}

function savePNG() {
    window.open(currentChart.getImageURI(), '_blank');
}

function changeYear() {
    selectYear = $("#selectYear").val();
    addMapLayers($("#selectYear").val());
}

function htmlOutput(name, op) {
    let output = '';    
    output += '<strong>' + name + '</strong>';
    //output += '<br>'
    output += '<input class="rangeOption" type="range" min="0" max="1" step="0.01" value="1" style="width: 100%;"/>'
    switch (op) {
        case -1:
            return `<strong>${name}</strong>`;
        case 0:
            return output;
        case 1:
            output += '<br>'
            output += '<strong>Selecione o ano:</strong>'
            output += '<select onChange="changeYear()" class="form-control" id="selectYear">'
            for (let index = firstYear; index <= lastYear; index++) {
                if (index == selectYear) {
                    output += `<option value="${index}" selected="true">${index}</option>`;
                } else {
                    output += `<option value="${index}">${index}</option>`;
                }
            }
            output += '</select>';
            return output;
        default:
            return '';
    }
};

// Make the DIV element draggable:
dragElement(document.getElementById("mydiv"));

function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {
        // if present, the header is where you move the DIV from:
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
        // otherwise, move the DIV from anywhere inside the DIV: 
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}