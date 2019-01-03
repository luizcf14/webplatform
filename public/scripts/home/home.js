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
let GraphLayer = null;
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
    
    $("#TVGraph").modal({backdrop: 'static', keyboard: false});
    //document.getElementById('chart_div').innerHTML = '<div class="center-block"><span class="fa fa-cog fa-spin"></span> Carregando</div>';
    $.get(platform + 'gee/assetsVisualization/scriptAlfa', 'year=' + (currentYear), function (data) {
        $("#TVGraph").modal('hide')
        //console.log(data);        
        let keys = Object.keys(data);
        let max = keys.length;
        let layersValues = [max];
        let base = {};
        //console.log('Keys', keys);
        for (let index = 0; index < max; index++) {
            if (keys[index] != "points_postgis") {
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

        $(".rangeOption").each(function (key, elem) {
            $(elem).attr('id', 'rangeOpId_' + key);
            $("#rangeOpId_" + key).on("input change", function () {
                layersValues[key].setOpacity(this.value);
            });
        });

        function onMapClick(e) {
            //popup.setLatLng(e.latlng).setContent("Carregando!").openOn(finalMap);
            //$("#TVGraph").modal();
            //document.getElementById('chart_div').innerHTML = '<div class="center-block"><span class="fa fa-cog fa-spin"></span> Carregando</div>';
            //$("#saveGraphPNG").attr('class', 'modal-footer d-none');
            $("#TVGraph").modal({backdrop: 'static', keyboard: false});
            $.get(platform + 'gee/temporalVisualization/pixelVariation', 'lat=' + (e.latlng.lat) + '&lon=' + (e.latlng.lng), function (data) {
                L.Control.Graph = L.Control.extend({
                    onAdd: function (map) {

                        var main_div = L.DomUtil.create('div', '');
                        var chart_div = L.DomUtil.create('div', '', main_div);
                        var header_div = L.DomUtil.create('div', '');
                        var header_text = L.DomUtil.create('p', '');
                        var sub_div = L.DomUtil.create('div', '');

                        chart_div.id = 'chartDiv';
                        header_div.id = 'headerDiv';
                        header_text.id = 'headerTextId';
                        sub_div.id = 'chart_div';

                        header_div.appendChild(header_text);
                        chart_div.appendChild(header_div);
                        chart_div.appendChild(sub_div);

                        L.DomEvent.disableClickPropagation(main_div);
                        L.DomEvent.disableClickPropagation(chart_div);
                        L.DomEvent.disableClickPropagation(header_div);
                        L.DomEvent.disableClickPropagation(sub_div);
                        return chart_div;
                    },
                    onRemove: function (map) {
                    }
                });
                L.control.graph = function (opts) {
                    return new L.Control.Graph(opts);
                }
                if (GraphLayer === null) {
                    GraphLayer = L.control.graph({ position: 'bottomleft' }).addTo(finalMap);
                } else {
                    GraphLayer.remove();
                    GraphLayer = L.control.graph({ position: 'bottomleft' }).addTo(finalMap);
                }
                //dragElement(document.getElementById("chartDiv"));
                document.getElementById('headerDiv').addEventListener('mousedown', mouseDown, false);
                window.addEventListener('mouseup', mouseUp, false);
                creatGraph(data);
                $("#TVGraph").modal('hide');
            });            
        }
        finalMap.on('click', onMapClick);
    });
}

let currentChart = null;
let currentGraph = null;
let currentOptions = null;

function creatGraph(data) {
    let graph = getGoogleVizualization("DataTable");
    data = JSON.parse(data);
    //let keys = Object.keys(data);
    let rows = [];

    for (let index = 0; index < data.length; index++) {
        let year_string = `${2000 + index}`;
        let data_string = data[index];
        rows.push([year_string, data_string]);
    }
    /*
    keys.forEach(key => {
        rows.push([key, data[key]]);
    });
    */

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
    document.getElementById('headerTextId').innerHTML = 'Click aqui para mover';
    document.getElementById('headerDiv').classList.add('headerDivCSS');
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


function mouseUp() {
    window.removeEventListener('mousemove', divMove, true);
}

function mouseDown(e) {
    window.addEventListener('mousemove', divMove, true);
}

function divMove(e) {
    var div = document.getElementById('chartDiv');
    //div.style.position = 'absolute';
    console.log(`DIV X = ${div.style.left} Y = ${div.style.top}`);
    console.log(`MOU X = ${e.clientX} Y = ${e.clientY}`);
    div.style.top = e.clientY + 'px';
    div.style.left = e.clientX + 'px';
}


/*
// Make the DIV element draggable:
function dragElement(elmnt) {
    var currentX = 0, currentY = 0, startX = 0, startY = 0;    
    if (elmnt.querySelector('#headerDiv')) {
        // if present, the header is where you move the DIV from:
        elmnt.querySelector('#headerDiv').onmousedown = dragMouseDown;
    } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        startX = e.clientX;
        startY = e.clientY;
        console.log(`Start X = ${startX} Y = ${startY}`);
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        currentX = e.clientX - startX;
        currentY = e.clientY - startY ;
        startX = e.clientX;
        startY = e.clientY;
        // set the element's new position:
        console.log(currentX,currentY)
        console.log(`Offsets Top = ${elmnt.offsetTop} Left = ${elmnt.offsetLeft}`);
        elmnt.style.top = (e.clientY) + "px";
        elmnt.style.left = (e.clientX) + "px";        
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}
*/