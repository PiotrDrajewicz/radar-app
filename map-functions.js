export { createMap, createUserPositionMarker };

function createMap(lat, long) {
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