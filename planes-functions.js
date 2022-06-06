export { createPlaneIcon };

function createPlaneIcon(plane, planesUpdated) {
    const planeIcon = L.icon({
        iconUrl: 'plane-icon.svg',
        iconSize: [20, 20]
    });

    let planeMarker = L.marker([this.lat, this.lng], { icon: planeIcon, rotationAngle: this.track });
    if (!plane.hasOwnProperty('icon')) {
        //creating plane icon
        plane.icon = planeMarker;
        planeMarker.addTo(map);
    } else {
        for (let n = 0; n < planesUpdated.length; n++) {
            if (plane.icao === planesUpdated[n][0]) {
                //updating plane icon position
                const newLatLng = new L.LatLng(plane.lat, plane.lng);
                plane.icon.setLatLng(newLatLng);
                plane.icon.options.rotationAngle = plane.track;
            }
        }
    }
}