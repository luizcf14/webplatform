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
        this._editPolygon = null;
        this._DrawType = null;

        //Init Mouse Handler
        this.initMouseHandler();
    }

    init(map) {
        let reload = this._currentMap != null;
        this._currentMap = map;
        //Init on Map Zoom
        this.onMapZoom();
        //Init Map Click
        this.initMapClick();
        if (reload) {
            this.reload();
        }
    }

    initMapClick() {
        this._currentMap.on("dblclick", () => {
            switch (this._DrawType) {
                case 'Polygon':
                    if (this._latLongList.length >= 3) {
                        this.createPolygon();
                    }
                    break;
            }
        });
        /*Remove Draws*/
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Delete' && this._editPolygon != null) {
                this.removeCircles();
                this._editPolygon.remove();
                /*Remove Polygons from List*/
                this._polygonsList = this._polygonsList.filter((element) => { return element != this._editPolygon });
                this._editPolygon = null;
            } else if (event.key === 'Escape') {
                this.disableDraw();
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
                    this.removeLine();
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
    }

    enableDraw(type) {
        this._currentMap.doubleClickZoom.disable();
        this._currentMap.cursor.enable();
        this._DrawType = type;
        //Enable Draw
        this._currentMap.on('click', this.draw, this);
    }

    disableDraw() {
        this._currentMap.doubleClickZoom.enable();
        this._currentMap.cursor.disable();
        this._editPolygon = null;

        if (this._latLongList.length >= 3) {
            this.createPolygon();
        } else if (this._latLongList.length < 3) {
            this.removeCircles();
            this.removeLine();
            this._latLongList = [];
        }
        //Disable Draw
        this._currentMap.off('click', this.draw, this);
    }

    draw(event, color = 'red', fillColor = '#ffffff', fillOpacity = 0.5, weight = 1) {
        let lat = event.latlng.lat, lng = event.latlng.lng;
        this._latLongList.push([lat, lng]);
        this.createCircle(lat, lng, color, fillColor, fillOpacity, weight);
    }

    createLine(lat, lng, color, weight) {
        this._tempLatLongList = this._latLongList.slice();
        this._tempLatLongList.push([lat, lng]);
        this._line = L.polyline(this._tempLatLongList, { color: color, weight: weight }).addTo(this._currentMap);
    }

    removeLine() {
        if (this._line != null) {
            this._line.remove();
            this._line = null;
        }
    }

    createCircle(lat, lng, color, fillColor, fillOpacity, weight) {
        this._circleList.push(
            L.circle([lat, lng], {
                color: color,
                fillColor: fillColor,
                fillOpacity: fillOpacity,
                weight: weight,
                radius: this.getRadius()
            }).addTo(this._currentMap));
    }

    removeCircles() {
        this._circleList.forEach(circle => {
            circle.remove();
        });
        this._circleList = [];
    }

    createPolygon() {
        this.removeLine();
        let Polygon = L.polygon(this._latLongList, { color: 'red', weight: 1 }).addTo(this._currentMap);
        //Add a click function to edit each Polygon.
        Polygon.on('click', (polygon) => {
            if (!this._currentMap.cursor._enabled) {
                if (this._editPolygon != null) {
                    this.removeCircles();
                }
                this._editPolygon = Polygon;
                polygon.target._latlngs[0].forEach(point => {
                    this.createCircle(point.lat, point.lng, 'red', '#ffffff', 0.5, 1);
                });
            }
        });
        this._polygonsList.push(Polygon);
        this._latLongList = [];
        this.removeCircles();
    }

    reload() {
        //Reloads all Polygons and display them on the Map.
        this._polygonsList.forEach(polygon => {
            polygon.addTo(this._currentMap);
        });
    }

    getRadius() {
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
                return 200;
            case 13:
                return 100;
            case 14:
                return 50;
            case 15:
                return 20;
            case 16:
                return 10;
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