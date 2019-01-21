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

function setMouseHandler() {
    L.CursorHandler = L.Handler.extend({
        addHooks: function () {
            this._map.on('mouseover', this.getMouseLatLon, this);
            this._map.on('mousemove', this.getMouseLatLon, this);
            this._map.on('mouseout', this.getMouseLatLon, this);
        },
        removeHooks: function () {
            this._map.off('mouseover', this.getMouseLatLon, this);
            this._map.off('mousemove', this.getMouseLatLon, this);
            this._map.off('mouseout', this.getMouseLatLon, this);
        },
        getMouseLatLon: function (e) {
            console.log('Lista Original = ', latLongList.length);
            //console.log(`Lat ${e.latlng.toString()} Lng ${e.latlng.toString()}`);
            if (circleList.length >= 1) {
                if (line != null) {
                    line.remove();
                    line = null;
                }
                tempLatLongList = latLongList.slice();
                tempLatLongList.push([e.latlng.lat, e.latlng.lng]);
                line = L.polyline(tempLatLongList, { color: 'red', weight: 1 }).addTo(map);
                $('.leaflet-container').css('cursor', 'crosshair');            
            }
        }
    });
    L.Map.addInitHook('addHandler', 'cursor', L.CursorHandler);
}
setMouseHandler();
let setMapCurrentMap = function (currentMap) {
    map = currentMap;
}

let createCircle = function (lat, lon, color, fillColor, fillOpacity, weight) {
    if (!mouseHandler) {
        map.cursor.enable();
        mouseHandler = !mouseHandler;
    }
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

let onMapZoom = function () {
    map.on('zoom', () => {
        circleList.forEach(circle => {
            circle.setRadius(getRadius());
        });
    });
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