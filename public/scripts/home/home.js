//let platform = 'platform/';
let platform = '';
//let mymap = L.map('mapid').setView([-1.464261, -48.470320], 5);
let firstYear = 2000;
let lastYear = 2017;

let defaultMap = null;
let finalMap = null;

let marker = null;
let MapLayers = null;
let GraphLayer = null;
let setOnclick = true;
let selectYear = null;
let currentSelect = null;

let base = {};
let layersValues = [];
let proccess = true;
let currentTools = null;
let opDiv = null;

let checkboxList = [];
let rangeValues = [];
let statesGeometries = [];
let cityGeometries = [];
let checks = [{ type: 'check_1', active: false }, { type: 'check_2', active: false }];
let checkSubClick = false;

let drawType = null;
let drawJS = new DrawJS();
let currentMapType;

let isMobile = (new MobileDetect(window.navigator.userAgent)).mobile() != null;
let wmsInfo = null;
let wmsKeys = ['solved_dt', 'sedac_dt', 'mapbiomas_dt', 'ndvi_dt', 'ndwi_dt', 'ndvi_less_ndwi_dt', 'mmri_dt', 'points_dt'];

let lg = null;
let divTest = false;

function initMap(mapType) {
    currentMapType = mapType;
    let centerValues;
    let zoomValue;

    if (defaultMap == null && finalMap == null) {
        centerValues = [-1.464261, -48.470320];
        zoomValue = 5;
    } else {
        //$('#element').popover('dispose');
        checkboxList = $('.leaflet-top.leaflet-right input[type="checkbox"]').toArray();
        rangeValues = $('.rangeOption').toArray();

        centerValues = finalMap.getCenter();
        zoomValue = finalMap.getZoom();
        finalMap.remove();
        proccess = false;
    }
    defaultMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: '<a href="http://solved.eco.br">Solved Soluções em Geoinformação</a>',
        maxZoom: 20,
        id: mapType,
        accessToken: 'pk.eyJ1IjoiY2FkYXN0cm9zZGl2ZXJzb3MiLCJhIjoiY2pqOTNuNXY3MmwzaDNxcjU2YTVraGxvNyJ9.2Lv4RwCJl79HhlO-cuDcHQ'
    });
    finalMap = L.map('mapid', { center: centerValues, zoom: zoomValue, layers: [defaultMap] });
    //marker = null;
    //MapLayers = null;
    //GraphLayer = null;
    //setOnclick = true;
    //selectYear = null;
    //currentSelect = null;    
    //createCircle(-0.842, -47.914, 'red', '#ffffff', 0.5, 1);    

    if (proccess) {
        defaultMap.addTo(finalMap);
        addMapLayers(firstYear);
    } else {
        //layers();
        MapLayers.addTo(finalMap);
        activeLayers();
        tools(finalMap);
        initPopover();
        initRangeOption();
        currentRangeValues();
        initMapClick();
    }
    checks.forEach(check => {
        if (check.active && check.type === 'check_1') {
            addGeometriesToMap(cityGeometries);
        } else if (check.active && check.type === 'check_2') {
            addGeometriesToMap(statesGeometries);
        }
    });
    drawJS.init(finalMap);
}

function activeLayers() {
    let currentCheckboxList = $('.leaflet-top.leaflet-right input[type="checkbox"]').toArray();
    let size = currentCheckboxList.length;
    for (let index = 0; index < size; index++) {
        if (checkboxList[index].checked) {
            currentCheckboxList[index].click();
        }
    }
}

function currentRangeValues() {
    let currentRangeList = $('.rangeOption').toArray();
    let size = currentRangeList.length;
    for (let index = 0; index < size; index++) {
        currentRangeList[index].value = rangeValues[index].value;
    }
}

function addMapLayers(currentYear) {
    if (MapLayers != null) {
        //console.log(defaultMap);
        //console.log(finalMap.getLayers());
        let centerValues = finalMap.getCenter();
        let zoomValue = finalMap.getZoom();
        /////////////////finalMap.remove();
        //finalMap.clearLayers();
        ////////////////finalMap = L.map('mapid', { center: centerValues, zoom: zoomValue, layers: [defaultMap] });
        MapLayers.remove(finalMap);
        finalMap.eachLayer((e) => {
            if (e._url == 'https://earthengine.googleapis.com/map/{mapid}/{z}/{x}/{y}?token={token}') {
                finalMap.removeLayer(e);
            }
        });
        drawJS.init(finalMap);
    } else {
        currentTools = tools(finalMap);
    }
    checks.forEach(check => {
        if (check.active && check.type === 'check_1') {
            addGeometriesToMap(cityGeometries);
        } else if (check.active && check.type === 'check_2') {
            addGeometriesToMap(statesGeometries);
        }
    });
    //document.getElementById('chart_div').innerHTML = '<div class="center-block"><span class="fa fa-cog fa-spin"></span> Carregando</div>';
    if (wmsInfo == null) {
        //$("#TVGraph").modal({ backdrop: 'static', keyboard: false });
        $.get(platform + 'postgis/sqlFunctions/wwms', function (data) {
            wmsInfo = data;
            render(wmsInfo, currentYear);
        });
    } else {
        render(wmsInfo, currentYear);
    }
    //era aqui a parada   
}

function render(wmsInfo, currentYear) {
    layersValues = null;
    layersValues = [wmsInfo.length - 1];
    base = {};
    if (lg != null) {
        lg.remove(finalMap);
        lg = null;
    }
    wmsInfo.forEach((info) => {
        if (parseInt(info.year) == currentYear) {
            for (let index = 0; index < 8; index++) {
                let wms = info[wmsKeys[index]].split(',');
                let temp = L.tileLayer('https://earthengine.googleapis.com/map/{mapid}/{z}/{x}/{y}?token={token}', {
                    attribution: '',
                    maxZoom: 18,
                    mapid: wms[0].replace(new RegExp(' ', 'g'), ''), // 0 is ID
                    token: wms[1].replace(new RegExp(' ', 'g'), '') // 1 is TOKEN
                });
                layersValues[index] = temp;
                base[htmlOutput(wms[2]/*.replace(new RegExp(' ', 'g'), '')*/,
                    parseInt(wms[3].replace(new RegExp(' ', 'g'), '')))] = temp;
            }
        }
    });
    MapLayers = L.control.layers(null, base, { collapsed: isMobile }).addTo(finalMap);
    initPopover();
    initRangeOption();
    initMapClick();
    initLegend();
}

function initPopover() {
    let topOptions = document.querySelector(".leaflet-control-layers-overlays");
    if (opDiv === null) {
        opDiv = document.createElement('div');
        let layerImg = document.createElement('img');

        opDiv.style.marginTop = '5px';
        opDiv.style.marginBottom = '5px';
        layerImg.src = window.location.href + '/imgs/layers-icon.png';
        layerImg.style.cursor = 'pointer';
        configOptions(layerImg);
        opDiv.appendChild(layerImg);
    }
    topOptions.prepend(opDiv);
    $(function () {
        $('[data-toggle="popover"]').popover({ html: true });
    });
}

function initMapClick() {
    function onMapClick(e) {
        $('.popover').popover('hide');
        //popup.setLatLng(e.latlng).setContent("Carregando!").openOn(finalMap);
        //$("#TVGraph").modal();
        //document.getElementById('chart_div').innerHTML = '<div class="center-block"><span class="fa fa-cog fa-spin"></span> Carregando</div>';
        //$("#saveGraphPNG").attr('class', 'modal-footer d-none');
        if ($('.leaflet-container').css('cursor') === 'crosshair') {
            if (drawType === 'point') {
                $("#TVGraph").modal({ backdrop: 'static', keyboard: false });
                $('.leaflet-container').css('cursor', '');
                if (marker === null) {
                    marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(finalMap);
                } else {
                    marker.remove();
                    marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(finalMap);
                }
                $.get(platform + 'gee/temporalVisualization/pixelVariation', 'lat=' + (e.latlng.lat) + '&lon=' + (e.latlng.lng), function (data) {
                    lelfeatGraphControl();
                    //dragElement(document.getElementById("chartDiv"));
                    //document.getElementById('headerDiv').addEventListener('mousedown', mouseDown, false);
                    //window.addEventListener('mouseup', mouseUp, false);
                    creatGraph(data);
                    $("#TVGraph").modal('hide');
                });
            }
        }
    }
    finalMap.on('click', onMapClick);
    $("#TVGraph").modal('hide');
}

function lelfeatGraphControl() {
    L.Control.Graph = L.Control.extend({
        onAdd: function (map) {

            var main_div = L.DomUtil.create('div', '');
            var chart_div = L.DomUtil.create('div', '', main_div);
            var header_div = L.DomUtil.create('div', 'text-right');
            var header_maximize = L.DomUtil.create('i', 'material-icons');
            var header_close = L.DomUtil.create('i', 'material-icons');
            var sub_div = L.DomUtil.create('div', '');

            chart_div.id = 'chartDiv';
            header_div.id = 'headerDiv';
            header_maximize.id = 'headerMaximize';
            header_close.id = 'headerClose';
            sub_div.id = 'chart_div';

            header_div.appendChild(header_maximize);
            header_div.appendChild(header_close);
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
}

function initRangeOption() {
    $(".rangeOption").each(function (key, elem) {
        $(elem).attr('id', 'rangeOpId_' + key);
        $("#rangeOpId_" + key).on("input change", function () {
            layersValues[key].setOpacity(this.value);
        });
    });
}
initMap('mapbox.streets');
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

    let headerMaximize;
    headerMaximize = document.getElementById('headerMaximize');
    headerMaximize.innerHTML = 'zoom_out_map';
    headerMaximize.style.padding = '0px 5px 5px 5px';
    headerMaximize.onmouseover = () => {
        headerMaximize.style.cursor = 'pointer';
    }
    headerMaximize.onclick = () => {
        savePNG();
    };

    let headerClose = document.getElementById('headerClose');
    headerClose.innerHTML = 'close';
    headerClose.style.padding = '0px 5px 5px 5px';
    headerClose.onmouseover = () => {
        headerClose.style.cursor = 'pointer';
    }
    headerClose.onclick = () => {
        if (GraphLayer != null) {
            marker.remove();
            marker = null;
            GraphLayer.remove();
            GraphLayer = null;
        }
    };
    document.getElementById('headerDiv').classList.add('headerDivCSS');
}

function savePNG() {
    let win = window.open();
    let newWindow = win.document;
    let newHead = newWindow.querySelector('head');
    let newBody = newWindow.querySelector('body');

    newHead.innerHTML += '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">';
    newBody.innerHTML += `<div class="container"><div class="row"><div class="col-sm-0"></div><div class="col-sm-12" style="width: ${window.innerWidth * 0.8}px; height: ${window.innerHeight * 0.8}px"><div id="chart_div"></div></div><div class="col-sm-0"></div></div></div>`;
    //newWindow.document.write("<div id='chart_div' style='width: 900px;'></div>");
    let chart = new google.visualization.LineChart(newWindow.getElementById('chart_div'));
    let newOptions = currentOptions;
    newOptions.height = (window.innerHeight * 0.8);
    chart.draw(currentGraph, newOptions);
}

function changeYear() {
    $('.popover').popover('hide');
    selectYear = $("#selectYear").val();
    addMapLayers($("#selectYear").val());
}

function removeDefaultClickEvent(event) {
    event.preventDefault();
}

function htmlOutput(name, op) {
    let output = '';
    let topOptions = document.querySelector(".leaflet-control-layers-overlays");
    output += '<strong>' + name + '</strong>';

    if (name != " Pontos") {
        output += '<input class="rangeOption" type="range" min="0" max="1" step="0.01" value="1" style=""/>';
    } else {
        output += `<br><br><button type="button" class="btn btn-outline-success btn-sm btn-block" onclick="dataDownload()">Download</button>`
    }
    switch (op) {
        case -1:
            return `<strong>${name}</strong>`;
        case 0:
            return output;
        case 1:
            output += '<br>';
            //output += '<strong>Selecione o ano:</strong>';            
            output += '<div class="input-group" style="margin-top: 16px; margin-bottom: 16px;">'
            output += '<select onChange="changeYear()" class="form-control" id="selectYear">';
            for (let index = firstYear; index <= lastYear; index++) {
                if (index == selectYear) {
                    output += `<option value="${index}" selected="true">${index}</option>`;
                } else {
                    output += `<option value="${index}">${index}</option>`;
                }
            }
            output += '</select>';
            //output += '<div class="input-group-prepend">';
            //output += '<label class="input-group-text" for="selectYear" style="height: 38px;" onclick="showSelectOptions();"><i class="material-icons" style="transform: rotate(180deg);">navigation</i></label>';
            //output += '</div>';
            output += '</div>'
            return output;
        default:
            return '';
    }
}

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
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        drawType = null;
        $('.leaflet-container').css('cursor', '');
    }
});

function tools(currentMap) {
    L.Control.Pointer = L.Control.extend({
        onAdd: function (map) {
            var main_div = L.DomUtil.create('div');
            var sub_div = L.DomUtil.create('div', 'leaflet-bar', main_div);
            sub_div.style.backgroundColor = 'white';
            var grab = L.DomUtil.create('i', 'material-icons tool_child', sub_div);
            var pointer = L.DomUtil.create('i', 'material-icons tool_child', sub_div);
            var show_chart = L.DomUtil.create('i', 'material-icons tool_child', sub_div);
            var insert_chart = L.DomUtil.create('i', 'material-icons tool_last_child', sub_div);

            grab.style.cursor = 'pointer';
            grab.setAttribute('title', 'Padrão');
            grab.innerHTML = 'pan_tool';
            grab.onclick = () => {
                $('.leaflet-container').css('cursor', '');
                drawJS.disableDraw();
            };

            pointer.style.cursor = 'pointer';
            pointer.setAttribute('title', 'Adicionar pontos');
            pointer.innerHTML = 'location_on';
            pointer.onclick = () => {
                drawType = 'point';
                $('.leaflet-container').css('cursor', 'crosshair');
                drawJS.disableDraw();
            };

            show_chart.id = "show";
            show_chart.style.cursor = 'pointer';
            show_chart.setAttribute('title', 'Desenhar forma');
            show_chart.innerHTML = 'show_chart';
            show_chart.onclick = () => {
                if (drawType == null) {
                    drawType = 'polygon';
                    $('.leaflet-container').css('cursor', 'crosshair');
                    drawJS.enableDraw('Polygon');
                } else {
                    drawType = null;
                    $('.leaflet-container').css('cursor', '');
                    drawJS.disableDraw();
                }
            };

            insert_chart.onclick = () => {
                //let temp = drawJS.getPolygons();//[0].toGeoJSON().geometry;                
                let polygons = [];
                drawJS.getPolygons().forEach((p) => {
                    polygons.push(p.toGeoJSON().geometry);
                });
                if (polygons.length > 0) {
                    $("#TVGraph").modal({ backdrop: 'static', keyboard: false });
                    $.get(platform + 'gee/tools/statistics', 'geometry=' + JSON.stringify(polygons) + '&year=' + (selectYear != null ? selectYear : 2000), function (data) {
                        areaChart(data);
                        $("#TVGraph").modal('hide');
                    });
                } else {
                    console.log('sem poligonos');
                }
            };
            insert_chart.style.cursor = 'pointer';
            insert_chart.setAttribute('title', 'Gerar gráfico');
            insert_chart.innerHTML = 'insert_chart';
            L.DomEvent.disableClickPropagation(sub_div);
            return sub_div;
        },
        onRemove: function (map) { }
    });
    L.control.Pointer = function (opts) {
        return new L.Control.Pointer(opts);
    };
    return L.control.Pointer({ position: 'topleft' }).addTo(currentMap);
}

function configOptions(layerImg) {
    layerImg.setAttribute('data-toggle', 'popover');
    layerImg.title = 'Configurações de exibição';
    layerImg.setAttribute('data-content',
        '<strong>Tipos de Mapa</strong>' +
        '<form>' +
        '<div class="form-group">' +
        '<div class="form-check">' +
        '<input class="form-check-input" type="radio" name="mapType" id="op_1" value="mapbox.streets" checked onclick="initMap(this.value)">' +
        '<label class="form-check-label" style="margin-left: 5px;">Mapbox - Ruas</label>' +
        '</div>' +
        '<div class="form-check">' +
        '<input class="form-check-input" type="radio" name="mapType" id="op_2" value="mapbox.satellite" onclick="initMap(this.value)">' +
        '<label class="form-check-label" style="margin-left: 5px;">Mapbox - Satélite</label>' +
        '</div>' +
        '</div>' +
        '</form>' +
        '<strong>Camadas de Sobreposição</strong>' +
        '<form>' +
        '<div class="form-group">' +
        '<div class="form-check">' +
        '<input id="check_1" class="form-check-input" type="checkbox" style="-webkit-appearance: checkbox !important;" onchange="getDatabaseInfos(this, 0)">' +
        '<label class="form-check-label" style="margin-left: 5px;">Municípios Costeiros</label>' +
        '</div>' +
        '<div class="form-check">' +
        '<input id="check_2" class="form-check-input" type="checkbox" style="-webkit-appearance: checkbox !important;" onchange="getDatabaseInfos(this, 1)">' +
        '<label class="form-check-label" style="margin-left: 5px;">Estados Costeiros</label>' +
        '</div>' +
        '</div>' +
        '</form>' +
        '<script>selectedOptions()</script>'
    );
    layerImg.style.width = '22px';
}

function addGeometriesToMap(geometries) {
    geometries.forEach(geom => {
        geom.addTo(finalMap);
    });
}

function selectedOptions() {
    checks.forEach(check => {
        let current = document.getElementById(check.type);
        if (check.active) {
            current.click();
        }
    });
    if (currentMapType === 'mapbox.streets') {
        document.getElementById('op_1').checked = true;
        document.getElementById('op_2').checked = false;
    } else {
        document.getElementById('op_1').checked = false;
        document.getElementById('op_2').checked = true;
    }
}

function getGeometries(index, geoJSON, base, geoStyle) {
    checks[index].active = true;
    $("#TVGraph").modal({ backdrop: 'static', keyboard: false });
    $.get(platform + 'postgis/sqlFunctions', 'base=' + base, function (data) {
        switch (data.code) {
            case 0:
                data.result.forEach(result => {
                    let info = JSON.parse(result.st_asgeojson);
                    geoJSON.geometry.type = info.type;
                    geoJSON.geometry.coordinates = info.coordinates;
                    if (base === 'city') {
                        cityGeometries.push(L.geoJSON(geoJSON, { style: geoStyle }).addTo(finalMap));
                    } else {
                        statesGeometries.push(L.geoJSON(geoJSON, { style: geoStyle }).addTo(finalMap));
                    }
                });
                $("#TVGraph").modal('hide');
                break;
            case 1:
                break;
            default:
                console.log('Erro desconhecido.');
        }
    });
}

function getDatabaseInfos(checkbox, type) {

    let geoJSON = { "type": "Feature", "geometry": { "type": null, "coordinates": null } };
    let base = (type == 0) ? 'city' : 'states';
    let geoStyle = { "color": (base == 'city') ? "#ff7800" : "#368aff", "weight": 1, "opacity": 0.65 };

    if (checkbox.checked) {
        if (cityGeometries.length === 0 && base === 'city') {
            getGeometries(0, geoJSON, base, geoStyle);
        } else if (statesGeometries.length === 0 && base === 'states') {
            getGeometries(1, geoJSON, base, geoStyle);
        } else if (cityGeometries.length != 0 && base === 'city') {
            addGeometriesToMap(cityGeometries);
        } else if (statesGeometries.length != 0 && base === 'states') {
            addGeometriesToMap(statesGeometries);
        }
    } else {
        if (type === 0) {
            checks[0].active = false;
            cityGeometries.forEach(geometry => {
                geometry.remove();
            });
        } else {
            checks[1].active = false;
            statesGeometries.forEach(geometry => {
                geometry.remove();
            });
        }
    }
}

function dataDownload() {
    $('#modalDownload').modal('show');
}

function selectAllLayers() {
    let main = document.querySelector('.main-box-layers');
    document.querySelectorAll('.layers-box').forEach((layer) => {
        layer.checked = main.checked ? true : false;
    });
}

function selectAllStates() {
    let main = document.querySelector('.main-box-states');
    document.querySelectorAll('.states-box').forEach((state) => {
        state.checked = main.checked ? true : false;
    });
}

function download() {
    let error_msg = document.getElementById('error-msg');
    let l = 0, s = 0;
    document.querySelectorAll('.layers-box').forEach((layer) => {
        if (layer.checked) {
            l++;
        }
    });
    document.querySelectorAll('.states-box').forEach((state) => {
        if (state.checked) {
            s++;
        }
    });
    if (l != 0 && s != 0) {
        error_msg.classList.add('d-none');
    } else {
        error_msg.classList.remove('d-none');
    }
}

function areaChart(dt) {
    //google.charts.load('current', { 'packages': ['corechart'] });
    ///google.charts.setOnLoadCallback(drawChart);
    drawChart();
    function drawChart() {
        var data = google.visualization.arrayToDataTable([
            ['Ano', 'Área'],
            ['2000', dt[0]],
            ['2001', dt[1]],
            ['2002', dt[2]],
            ['2003', dt[3]],
            ['2004', dt[4]],
            ['2005', dt[5]],
            ['2006', dt[6]],
            ['2007', dt[7]],
            ['2008', dt[8]],
            ['2009', dt[9]],
            ['2010', dt[10]],
            ['2011', dt[11]],
            ['2012', dt[12]],
            ['2013', dt[13]],
            ['2014', dt[14]],
            ['2015', dt[15]],
            ['2016', dt[16]],
            ['2017', dt[17]]
        ]);
        var options = {
            title: 'Variação anual de Área',
            hAxis: { title: 'Ano', titleTextStyle: { color: '#333' } },
            vAxis: { minValue: 0 }
        };
        lelfeatGraphControl();
        if (/*window.innerWidth > 930 && */window.innerWidth < 1100) {
            document.getElementById('chartDiv').style.width = (window.innerWidth - 230) + 'px';
        } else {
            document.getElementById('chartDiv').style.width = '863px';
        }
        var chart = new google.visualization.AreaChart(document.getElementById('chart_div'));
        chart.draw(data, options);

        currentChart = chart;
        currentGraph = data;
        currentOptions = options;

        $(window).resize(function () {
            if (window.innerWidth < 1100) {
                document.getElementById('chartDiv').style.width = (window.innerWidth - 230) + 'px';
                currentChart.draw(currentGraph, currentOptions);
            } else {
                document.getElementById('chartDiv').style.width = '863px';
                currentChart.draw(currentGraph, currentOptions);
            }
        });

        /*let headerMaximize;
        headerMaximize = document.getElementById('headerMaximize');
        headerMaximize.innerHTML = 'zoom_out_map';
        headerMaximize.style.padding = '0px 5px 5px 5px';
        headerMaximize.onmouseover = () => {
            headerMaximize.style.cursor = 'pointer';
        }
        headerMaximize.onclick = () => {
            savePNG();
        };
        */
        let headerClose = document.getElementById('headerClose');
        headerClose.innerHTML = 'close';
        headerClose.style.padding = '0px 5px 5px 5px';
        headerClose.onmouseover = () => {
            headerClose.style.cursor = 'pointer';
        }
        headerClose.onclick = () => {
            if (GraphLayer != null) {
                GraphLayer.remove();
                GraphLayer = null;
            }
        };
        document.getElementById('headerDiv').classList.add('headerDivCSS');
    }
}

function initLegend() {
    let captionsList = [
        { caption: '<i style="background:#800026"></i> - Legenda 0<br>', active: false },
        { caption: '<i style="background:#800026"></i> - Legenda 1<br>', active: false },
        { caption: '<i style="background:#800026"></i> - Legenda 2<br>', active: false },
        { caption: '<i style="background:#800026"></i> - Legenda 3<br>', active: false },
        { caption: '<i style="background:#800026"></i> - Legenda 4<br>', active: false },
        { caption: '<i style="background:#800026"></i> - Legenda 5<br>', active: false },
        { caption: '<i style="background:#800026"></i> - Legenda 6<br>', active: false },
        { caption: '<i style="background:#800026"></i> - Legenda 7<br>', active: false }
    ];

    let legend = L.control({ position: 'bottomright' });
    let div = L.DomUtil.create('div', 'info legend');

    let nl = document.querySelectorAll('.leaflet-control-layers-selector');
    let sl = nl.length;
    for (let index = 0; index < sl; index++) {
        nl[index].onclick = () => {
            legend.onAdd = function (map) {
                div.innerHTML = '';
                captionsList[index].active = !captionsList[index].active;
                captionsList.forEach((cp) => {
                    if (cp.active) {
                        div.innerHTML += cp.caption;
                    }
                });
                return div;
            };

            legend.onRemove = function (map) {
                divTest = div.innerHTML == '';
            };

            if (lg === null) {
                lg = legend.addTo(finalMap);
            } else {
                lg.remove(finalMap);
                lg = legend.addTo(finalMap);
                if (div.innerHTML == '') {
                    lg.remove(finalMap);
                    lg = null;
                }
            }
        };
    }

}