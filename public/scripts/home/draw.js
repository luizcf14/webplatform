/** 
 * Created by: Jhonatan Rodrigues dos Santos
 * Include this file after lefleat.js
*/
class DrawJS {
    constructor() {
        this._currentMap = null;
        this._circleList = [];
        this._latLongList = [];
        this._tempLatLongList = [];
        this._polygonsList = [];
        this._line = null;
        this._mouseHandler = false;
        this._drawIsEnable = false;
        this._DrawType = null;

        //Init Mouse Handler
        this.initMouseHandler();
        console.log(this._latLongList);
    }

    init(map) {
        this._currentMap = map;
        //Init on Map Zoom
        this.onMapZoom();
        console.log(this._latLongList);
    }

    initMapClick() {
        this._currentMap.on("dblclick", () => {
            switch (DrawType) {
                case 'Polygon':
                    if (this._latLongList.length >= 3) {
                        let Polygon = L.polygon(this._latLongList, { color: 'red', weight: 1 }).addTo(this._currentMap);
                        Polygon.on('click', this.editPolygon);
                        this._polygonsList.push(Polygon);
                        this._latLongList = [];
                        this._circleList.forEach(circle => {
                            circle.remove();
                        });
                        this._circleList = [];
                    }
                    break;
            }
        });
    }

    initMouseHandler() {
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
            getMouseLatLon: (e) => {
                if (this._circleList.length >= 1) {
                    if (this._line != null) {
                        this._line.remove();
                        this._line = null;
                    }
                    this.createLine(e.latlng.lat, e.latlng.lng, 'red', 1);
                }
            }
        });
        L.Map.addInitHook('addHandler', 'cursor', L.CursorHandler);
    }

    onMapZoom() {
        this._currentMap.on('zoom', () => {
            this._circleList.forEach(circle => {
                circle.setRadius(this.getRadius());
            });
        });
        console.log(this._latLongList);
    }

    drawController(op, type) {
        console.log('Draw controller');
        switch (op) {
            case 0: /*enable*/
                if (!this._drawIsEnable) {
                    this._drawIsEnable = !this._drawIsEnable;
                    this._currentMap.cursor.enable();
                    this._DrawType = type;
                }
                break;
            case 1: /*disable*/
                if (this._drawIsEnable) {
                    this._drawIsEnable = !this._drawIsEnable;
                    this._currentMap.cursor.disable();
                }
                break;
            default:
                console.error('Draw Controller Error.');
        }
    }

    enableDraw(type) {
        console.log('Enable Draw');
        this._currentMap.doubleClickZoom.disable();
        this.drawController(0, type);
        this._currentMap.on('click', this.draw);
    }

    disableDraw() {
        this._currentMap.doubleClickZoom.enable();
        this.drawController(1);
        this._currentMap.off('click', this.draw);
    }

    draw(event, color = 'red', fillColor = '#ffffff', weight = 0.5) {
        let lat = event.latlng.lat, lng = event.latlng.lng;
        this._latLongList.push([lat, lng]);
        this._circleList.push(
            L.circle([lat, lng], {
                color: color,
                fillColor: fillColor,
                fillOpacity: fillOpacity,
                weight: weight,
                radius: getRadius()
            }).addTo(this._currentMap));
    }

    createLine(lat, lng, color, weight) {
        this._tempLatLongList = this._latLongList.slice();
        this._tempLatLongList.push([lat, lng]);
        this._line = L.polyline(this._tempLatLongList, { color: color, weight: weight }).addTo(this._currentMap);
    }

    getRadius() {
        console.log(this._latLongList);
        switch (this._currentMap.getZoom()) {
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
}//END