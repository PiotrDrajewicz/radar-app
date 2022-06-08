export { createIconPopup, createObjects };
import { Plane } from './plane-class.js';

// function createPlaneIcon(plane, planesUpdated) {
//     const planeIcon = L.icon({
//         iconUrl: 'plane-icon.svg',
//         iconSize: [20, 20]
//     });

//     let planeMarker = L.marker([this.lat, this.lng], { icon: planeIcon, rotationAngle: this.track });
//     if (!plane.hasOwnProperty('icon')) {
//         //creating plane icon
//         plane.icon = planeMarker;
//         planeMarker.addTo(map);
//     } else {
//         for (let n = 0; n < planesUpdated.length; n++) {
//             if (plane.icao === planesUpdated[n][0]) {
//                 //updating plane icon position
//                 const newLatLng = new L.LatLng(plane.lat, plane.lng);
//                 plane.icon.setLatLng(newLatLng);
//                 plane.icon.options.rotationAngle = plane.track;
//             }
//         }
//     }
// }

function createObjects(allPlanes, planesObjects) {
    return new Promise(resolve => {
        console.log('creating objects');
        //adding new objects
        allPlanes.forEach(plane => {
            let counter = 0;
            const planeObj = new Plane(plane[0], plane[6], plane[5], plane[10], plane[9], plane[7], map);

            if (planesObjects.length === 0) {
                planesObjects.push(planeObj);
            } else {
                for (let i = 0; i < planesObjects.length; i++) {
                    if (planesObjects[i].icao === planeObj.icao) {
                        counter++;
                    }
                }
                if (counter === 0) {
                    planesObjects.push(planeObj);
                }
            }

        })

        //deleting missing objects
        planesObjects.forEach(plane => {
            let isFound = false;
            for (let j = 0; j < allPlanes.length; j++) {
                if (plane.icao === allPlanes[j][0]) {
                    isFound = true;
                }
            }
            if (isFound === false) {
                map.removeLayer(plane.icon);
                planesObjects.splice(planesObjects.indexOf(plane), 1);
                map.removeLayer(plane.popup);
            }
        })

        resolve(allPlanes);
        console.log('all po usuwaniu: ', allPlanes);
        console.log('objects po usuwaniu: ', planesObjects);
    })
}

function createIconPopup(allPlanes, planesObjects) {
    planesObjects.forEach(plane => {
        //updating plane info
        plane.updatePlaneInfo(plane, allPlanes);
        //creating plane icons
        plane.createPlaneIcon(plane, allPlanes);
        //creating plane popups
        plane.createPlanePopup(plane);
    })
}