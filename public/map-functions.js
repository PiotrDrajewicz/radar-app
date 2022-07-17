export { createMap, createUserPositionMarker, createCircle, createWatchedArea, Point };

class Point {
    constructor(pointNumber, lat, lng) {
        this.pointNumber = pointNumber;
        this.lat = lat;
        this.lng = lng;
    }
}

function createMap(lat, long) {
    //zoom 8 for testing
    //zoom 9 for final
    let map = L.map('map').setView([lat, long], 8);
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1Ijoic2VyZWt3aWVqc2tpIiwiYSI6ImNsMmdhMXRmNzAxdnkzaXBoc2J0aXRoeWcifQ.P5SBaZpNYNfq1Pfk1Pw9FA'
    }).addTo(map);

    return map;
}

function createUserPositionMarker(lat, long, map) {
    L.marker([lat, long]).addTo(map).openPopup();
}

function createCircle(clickLat, clickLng, map) {
    L.circle([clickLat, clickLng], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 50
    }).addTo(map);
}

function createWatchedArea(areaPoints, map) {
    L.polygon([
        [areaPoints[0].lat, areaPoints[0].lng],
        [areaPoints[1].lat, areaPoints[1].lng],
        [areaPoints[2].lat, areaPoints[2].lng],
        [areaPoints[3].lat, areaPoints[3].lng]
    ]).addTo(map);
}