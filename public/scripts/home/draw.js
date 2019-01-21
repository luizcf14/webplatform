/** 
 * Include this file after lefleat.js
*/
let map;
let circleList = [];

let setMapCurrentMap = function (currentMap) {
    map = currentMap;
}

let createCircle = function (lat, lon, color, fillColor, fillOpacity, weight) {
    circleList.push(
        L.circle([lat, lon], {
            color: color,
            fillColor: fillColor,
            fillOpacity: fillOpacity,
            weight: weight,
            radius: getRadius()
        }).addTo(map)
    );
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