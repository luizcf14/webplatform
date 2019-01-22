/** 
 * Created by: Jhonatan Rodrigues dos Santos
 * Include this file after lefleat.js
*/
let map;
let circleList = [];
let latLongList = [];
let tempLatLongList = [];
let polygonsList = [];
let line = null;
let mouseHandler = false;
let drawIsEnable = false;
let DrawType = null;

function setMouseHandler() {
    L.CursorHandler = L.Handler.extend({
        addHooks: function () {
            this._map.on('mouseover', this.getMouseLatLon, this);
            this._map.on('mousemove', this.getMouseLatLon, this);
            this._map.on('mouseout', this.getMouseLatLon, this);
            //map.style.cursor = 'crosshair';
        },
        removeHooks: function () {
            this._map.off('mouseover', this.getMouseLatLon, this);
            this._map.off('mousemove', this.getMouseLatLon, this);
            this._map.off('mouseout', this.getMouseLatLon, this);
            //map.style.cursor = 'default';            
        },
        getMouseLatLon: function (e) {
            if (circleList.length >= 1) {
                if (line != null) {
                    line.remove();
                    line = null;
                }
                createLine(e.latlng.lat, e.latlng.lng, 'red', 1);
                console.log('createLine = ', drawIsEnable);
            }
        }
    });
    L.Map.addInitHook('addHandler', 'cursor', L.CursorHandler);
}

setMouseHandler();
function editPolygon(p) {
    window.lefleatPolygonByMe = p;
    console.log(p);
}
let setMapCurrentMap = function (currentMap) {
    map = currentMap;
    map.on("dblclick", function () {
        switch (DrawType) {
            case 'Polygon':
                if (latLongList.length >= 3) {
                    console.log('Polygon...');
                    let tempPolygon = L.polygon(latLongList, { color: 'red', weight: 1 }).addTo(map);
                    tempPolygon.on('click', editPolygon);
                    polygonsList.push(tempPolygon);
                    latLongList = [];
                    circleList.forEach(circle => {
                        circle.remove();
                    });
                    circleList = [];
                }
                break;
        }
    });
}

let drawController = function (op, type) {
    switch (op) {
        case 0: /*enable*/
            if (!drawIsEnable) {
                drawIsEnable = !drawIsEnable;
                map.cursor.enable();
                DrawType = type;
            }
            break;
        case 1: /*disable*/
            if (drawIsEnable) {
                drawIsEnable = !drawIsEnable;
                map.cursor.disable();
            }
            break;
        default:
            console.log('DrawController error.');
    }
}

let createCircle = function (lat, lon, color, fillColor, fillOpacity, weight) {
    console.log('circulo');
    latLongList.push([lat, lon]);
    circleList.push(
        L.circle([lat, lon], {
            color: color,
            fillColor: fillColor,
            fillOpacity: fillOpacity,
            weight: weight,
            radius: getRadius()
        }).addTo(map));
    /*if (circleList.length == '') {
        line = L.polyline(latLongList, { color: 'red', weight: 1 }).addTo(map);
        
        if (polygonsList.length == 1) {
            polygonsList[0].remove();
            polygonsList = [];
        }
        polygonsList.push(
            L.polygon(latLongList, {
                color: 'red',
                weight: 1
            }).addTo(map));
    }*/

}

let createLine = function (lat, lng, color, weight) {
    tempLatLongList = latLongList.slice();
    tempLatLongList.push([lat, lng]);
    line = L.polyline(tempLatLongList, { color: color, weight: weight }).addTo(map);
    /*line.on('mouseover', function () {
        $('.leaflet-container').css('cursor', 'crosshair');
        $('.leaflet-interactive').css('cursor', 'crosshair');
    });*/
}

let drawGeometry = function (lat, lon, color, fillColor, fillOpacity, weight) {
    createCircle(lat, lon, color, fillColor, fillOpacity, weight);
}

let onMapZoom = function () {
    map.on('zoom', () => {
        circleList.forEach(circle => {
            circle.setRadius(getRadius());
        });
    });
}

function draw(e) {
    drawGeometry(e.latlng.lat, e.latlng.lng, 'red', '#ffffff', 0.5, 1, 'Polygon');
}

let enableDraw = function (type) {
    map.doubleClickZoom.disable();
    drawController(0, type);
    map.on('click', draw);
}

let disableDraw = function () {
    map.doubleClickZoom.enable();
    drawController(1);
    map.off('click', draw);
}

let getRadius = function () {
    switch (map.getZoom()) {
        case 0:
            return 400000;
        case 1:
            return 200000;
        case 2:
            return 100000;
        case 3:
            return 50000;
        case 4:
            return 25000;
        case 5:
            return 19000;
        case 6:
            return 9000;
        case 7:
            return 5000;
        case 8:
            return 2500;
        case 9:
            return 1200;
        case 10:
            return 600;
        case 11:
            return 300;
        case 12:
            return 100;
        case 13:
            return 50;
        case 14:
            return 25;
        case 15:
            return 15;
        case 16:
            return 6;
        case 17:
            return 5;
        case 18:
            return 3;
        case 19:
            return 2;
        case 20:
            return 1;
        default:
            return 1;
    }
}