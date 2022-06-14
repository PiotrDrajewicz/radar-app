export { Plane, createIconPopup };
// import { sendNotification } from './notifications.js';

class Plane {
    constructor(icao, lat, lng, track, groundSpeed, baroAltitude, map) {
        this.icao = icao;
        this.lat = lat;
        this.lng = lng;
        this.track = track;
        this.groundSpeed = groundSpeed;
        this.baroAltitude = baroAltitude;
        this.map = map;
        this.notificationSent = false;
    }

    createPlaneIcon(plane, planesUpdated) {
        const planeIcon = L.icon({
            iconUrl: 'plane-icon.svg',
            iconSize: [20, 20]
        });

        let planeMarker = L.marker([this.lat, this.lng], { icon: planeIcon, rotationAngle: this.track });
        if (!plane.hasOwnProperty('icon')) {
            //creating plane icon
            plane.icon = planeMarker;
            //this
            planeMarker.addTo(this.map);
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

    createPlanePopup(plane) {
        let popup;
        const trackDeg = plane.track;
        const planeLat = plane.lat;
        const planeLng = plane.lng;
        const planeIcao = plane.icao;
        const groundSpeed = plane.groundSpeed;
        const baroAltitude = plane.baroAltitude;

        if (!plane.hasOwnProperty('popup')) {
            //creating plane popup
            if (trackDeg > 1 && trackDeg < 180) {
                //right course
                popup = new L.popup({ className: 'custom', offset: [73, 77], closeOnClick: false, autoClose: false });
            } else {
                //left course
                popup = new L.popup({ className: 'custom', offset: [65, 72], closeOnClick: false, autoClose: false });
            }
            popup.setLatLng(new L.LatLng(planeLat, planeLng));

            const apiDetailed = `https://api.joshdouch.me/api/aircraft/${planeIcao}`;
            fetch(apiDetailed)
                .then(response => {
                    return response.json();
                })
                .then(data => {
                    const icaoTypeCode = data.ICAOTypeCode;
                    const operatorFlagCode = data.OperatorFlagCode;

                    if (data.status) {
                        popup.setContent(`<ul><li>N/A</li><li>${groundSpeed} kt</li><li>N/A</li><li>${baroAltitude} ft</li></ul>`);
                    } else {
                        popup.setContent(`<ul><li>${icaoTypeCode}</li><li>${groundSpeed} kt</li><li>${operatorFlagCode}</li><li>${baroAltitude} ft</li></ul>`);
                    }
                })

            plane.popup = popup;
            //this
            this.map.addLayer(popup);
        } else {
            //updating plane popup
            plane.popup.setLatLng(new L.LatLng(planeLat, planeLng));

            const apiDetailed = `https://api.joshdouch.me/api/aircraft/${planeIcao}`;
            fetch(apiDetailed)
                .then(response => {
                    return response.json();
                })
                .then(data => {
                    const icaoTypeCode = data.ICAOTypeCode;
                    const operatorFlagCode = data.OperatorFlagCode;

                    if (data.status) {
                        plane.popup.setContent(`<ul><li>N/A</li><li>${groundSpeed} kt</li><li>N/A</li><li>${baroAltitude} ft</li></ul>`);
                    } else {
                        plane.popup.setContent(`<ul><li>${icaoTypeCode}</li><li>${groundSpeed} kt</li><li>${operatorFlagCode}</li><li>${baroAltitude} ft</li></ul>`);
                    }
                })

        }

    }

    updatePlaneInfo(plane, planesUpdated) {
        for (let n = 0; n < planesUpdated.length; n++) {
            if (plane.icao === planesUpdated[n][0]) {
                plane.lat = planesUpdated[n][6];
                plane.lng = planesUpdated[n][5];
                plane.track = planesUpdated[n][10];
                plane.groundSpeed = Math.round(planesUpdated[n][9] * 1.94);
                plane.baroAltitude = Math.round(planesUpdated[n][7] * 3.28084);
            }
        }
    }

    trackPlane(plane, boundariesPoints) {
        // console.log(`plane: ${plane.icao}, speed: ${plane.groundSpeed}`);
        // if (plane.lat >= latMin && plane.lat <= latMax && plane.lng >= lngMin && plane.lng <= lngMax) 
        if (plane.icao) {
            plane.notificationSent = true;
            const latMin = boundariesPoints[0];
            const lngMin = boundariesPoints[1];
            const latMax = boundariesPoints[2];
            const lngMax = boundariesPoints[3];
            // console.log(latMin, lngMin, latMax, lngMax);

            // sendNotification();

        }
    }
}

function createIconPopup(allPlanes, planesObjects, boundariesPoints) {
    planesObjects.forEach(plane => {
        //updating plane info
        plane.updatePlaneInfo(plane, allPlanes);
        //creating plane icons
        plane.createPlaneIcon(plane, allPlanes);
        //creating plane popups
        plane.createPlanePopup(plane);
        //tracking plane for notification
        plane.trackPlane(plane, boundariesPoints);
    })
}