// import { turnOnOffFilters } from './filters.js';
// import { planeFilterOn } from "./radar.js";
export { Plane, createIconPopup };
// import { sendNotification } from './notifications.js';
let tableRowsArr = [];
let tableDiv = document.getElementById('table-div');
let tableRows = document.querySelector('.table-rows')

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
        this.banned = false;
        this.bannedAlt = false;
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
                popup = new L.popup({ className: 'custom', id: '', offset: [65, 72], closeOnClick: false, autoClose: false });
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

    assignIcaoTypeAndAirline(plane, planesObjects, bannedTypes, bannedAirlines, typeAirlineFilterState, altitudeFilterState) { //this function runs for every plane already
        const apiDetailed = `https://api.joshdouch.me/api/aircraft/${plane.icao}`;
        // const apiReg = `https://api.joshdouch.me/hex-reg.php?hex=${plane.icao}`;
        fetch(apiDetailed)
            .then(response => {
                return response.json();
            })
            .then(data => {
                const icaoTypeCode = data.ICAOTypeCode;
                const operatorFlagCode = data.OperatorFlagCode;
                plane.planeType = icaoTypeCode;
                plane.airlineCode = operatorFlagCode;
            })
            .then(() => {
                //place to fetch data from plane reg api
                // fetch(apiReg)
                //     .then(response => {
                //         return response.json();
                //     })
                //     .then(data => {
                //         console.log('data', data);
                //     })

                //would be better if this was in separete function but its here for now 
                //     console.log(plane.planeType, plane.airlineCode, plane.baroAltitude, plane.groundSpeed)
                let tableCellAltitude;
                let tableCellSpeed;
                let tableRow;
                // let tableDiv;
                // let tableRows;

                if (!plane.inTable) {
                    //creating table position for plane
                    // tableDiv = document.getElementById('table-div');
                    // tableRows = document.querySelector('.table-rows');
                    tableRow = document.createElement('div');
                    tableRow.classList.add('table-row');
                    tableRow.classList.add('table-grid');
                    tableRow.setAttribute('id', plane.icao);

                    const tableCellType = document.createElement('p');
                    tableCellType.textContent = plane.planeType;
                    tableCellType.classList.add('table-cell');

                    const tableCellAirline = document.createElement('p');
                    tableCellAirline.textContent = plane.airlineCode;
                    tableCellAirline.classList.add('table-cell');

                    const tableCellRegistration = document.createElement('p');
                    // tableCellRegistration.textContent = plane.airlineCode;
                    tableCellRegistration.textContent = plane.icao; //placeholder
                    tableCellRegistration.classList.add('table-cell');

                    tableCellAltitude = document.createElement('p');
                    tableCellAltitude.textContent = plane.baroAltitude;
                    tableCellAltitude.classList.add('table-cell');

                    tableCellSpeed = document.createElement('p');
                    tableCellSpeed.textContent = plane.groundSpeed;
                    tableCellSpeed.classList.add('table-cell');
                    tableCellSpeed.classList.add('speed-cell');

                    tableRow.appendChild(tableCellType);
                    tableRow.appendChild(tableCellAirline);
                    tableRow.appendChild(tableCellRegistration);
                    tableRow.appendChild(tableCellAltitude);
                    tableRow.appendChild(tableCellSpeed);
                    tableRows.appendChild(tableRow);
                    tableDiv.appendChild(tableRows);

                    tableRowsArr.push(tableRow);
                    // console.log(tableRowsArr);
                    plane.inTable = true;
                } else {
                    //updating plane's alt and spd in table
                    // console.log('w tabeli'); dochodzi tutaj
                    const planeToUpdate = tableRowsArr.find(row => row.getAttribute('id') === plane.icao);
                    planeToUpdate.children[3].textContent = plane.baroAltitude;
                    planeToUpdate.children[4].textContent = plane.groundSpeed;
                    // console.log('to update', planeToUpdate.children[3]);

                    //updating plane's alt and spd in table
                    // tableCellAltitude.textContent = plane.baroAltitude;
                    // tableCellSpeed.textContent = plane.groundSpeed;
                }

                tableRowsArr.map(row => {
                    const icaoFromTable = row.getAttribute('id');
                    const planeFound = planesObjects.find(plane => plane.icao === icaoFromTable);

                    //removing row from table if plane is gone
                    if (!planeFound) {
                        row.remove();
                    }
                })


            }
            )
            .then(() => {
                //would be better if this was in separete function but its here for now

                //type-airline filter
                if (typeAirlineFilterState) {
                    //filter is active
                    console.log('plane filter is active');
                    // bannedTypes.push('A320');
                    // bannedTypes.push('A321');
                    // bannedTypes.push('B738');

                    let tableRow = document.getElementById(plane.icao);

                    //checking if plane (type) is banned
                    const typesMatch = bannedTypes.map(type => {
                        if (type == plane.planeType) {
                            return true;
                        }
                    })

                    //checking if plane (airline) is banned
                    const airlinesMatch = bannedAirlines.map(airline => {
                        if (airline == plane.airlineCode) {
                            return true;
                        }
                    })

                    if (typesMatch.includes(true) || airlinesMatch.includes(true)) {
                        //plane is banned
                        console.log('zbanowany', plane.planeType);
                        plane.banned = true;
                        tableRow.classList.add('banned-plane');
                        plane.popup._wrapper.classList.add('banned-popup');
                        // plane.icon._icon.style.border = '1px solid rgb(255, 176, 176)';
                    } else {
                        //plane is not banned
                        console.log('nie zbanowany', plane.planeType);
                        plane.banned = false;
                        tableRow.classList.remove('banned-plane');
                        plane.popup._wrapper.classList.remove('banned-popup');
                    }

                } else {
                    //filter is not active
                    console.log('type-airline filter is not active');

                    plane.banned = false;
                    let tableRow = document.getElementById(plane.icao);
                    tableRow.classList.remove('banned-plane');
                    plane.popup._wrapper.classList.remove('banned-popup');
                }

                //altitude filter
                if (altitudeFilterState) {
                    //filter is active
                    console.log('altitude filter is active');
                    let planeAlt = plane.baroAltitude;
                    let tableRow = document.getElementById(plane.icao);
                    let minAlt = document.getElementById('min-height').value;
                    let maxAlt = document.getElementById('max-height').value;

                    //min and max are provided
                    if (minAlt !== '' && maxAlt !== '') {
                        if (planeAlt >= parseInt(minAlt, 10) && planeAlt <= parseInt(maxAlt, 10)) {
                            //plane is inside range
                            plane.bannedAlt = false;
                            tableRow.classList.remove('banned-plane-altitude');
                            plane.popup._wrapper.classList.remove('banned-popup-altitude');
                        } else {
                            //plane is outside range
                            plane.bannedAlt = true;
                            tableRow.classList.add('banned-plane-altitude');
                            plane.popup._wrapper.classList.add('banned-popup-altitude');
                        }
                    }

                    //nothing is provided
                    if (minAlt === '' && maxAlt === '') {
                        plane.bannedAlt = false;
                        tableRow.classList.remove('banned-plane-altitude');
                        plane.popup._wrapper.classList.remove('banned-popup-altitude');
                    }

                    //only min is provided
                    if (minAlt !== '' && maxAlt === '') {
                        if (planeAlt >= parseInt(minAlt, 10)) {
                            //plane is inside range
                            plane.bannedAlt = false;
                            tableRow.classList.remove('banned-plane-altitude');
                            plane.popup._wrapper.classList.remove('banned-popup-altitude');
                        } else {
                            //plane is outside range
                            plane.bannedAlt = true;
                            tableRow.classList.add('banned-plane-altitude');
                            plane.popup._wrapper.classList.add('banned-popup-altitude');
                        }
                    }

                    //only max is provided
                    if (minAlt === '' && maxAlt !== '') {
                        if (planeAlt <= parseInt(maxAlt, 10)) {
                            //plane is inside range
                            plane.bannedAlt = false;
                            tableRow.classList.remove('banned-plane-altitude');
                            plane.popup._wrapper.classList.remove('banned-popup-altitude');
                        } else {
                            //plane is outside range
                            plane.bannedAlt = true;
                            tableRow.classList.add('banned-plane-altitude');
                            plane.popup._wrapper.classList.add('banned-popup-altitude');
                        }
                    }


                } else {
                    //filter is not active
                    console.log('altitude filter is not active');

                    let tableRow = document.getElementById(plane.icao);
                    tableRow.classList.remove('banned-plane-altitude');
                }

                //hiding or showing banned planes
                const showHideButton = document.getElementById('hide-show-button');
                let tableRow = document.getElementById(plane.icao);
                if (showHideButton.classList.contains('hide')) {
                    //banned planes are shown
                    tableRow.classList.remove('hide-banned-row');
                    plane.popup._wrapper.style.opacity = 1;
                    plane.icon._icon.style.opacity = 1;
                }
                if (showHideButton.classList.contains('show')) {
                    //banned planes are hidden
                    if (plane.banned || plane.bannedAlt) {
                        //plane is banned
                        tableRow.classList.add('hide-banned-row');
                        plane.popup._wrapper.style.opacity = 0;
                        plane.icon._icon.style.opacity = 0;
                    } else {
                        //plane is not banned
                        tableRow.classList.remove('hide-banned-row');
                        plane.popup._wrapper.style.opacity = 1;
                        plane.icon._icon.style.opacity = 1;
                    }
                }


            })
            .then(() => {
                //would be better if this was in separete function but its here for now

                const planeRow = document.getElementById(plane.icao);
                let currentRow;
                planeRow.addEventListener('click', (e) => {
                    // //clearing all rows and popups before selecting specific one
                    // planesObjects.forEach(object => {
                    //     object.popup._wrapper.style.backgroundColor = 'white';
                    // })
                    // console.log('target', e.target.parentElement.id);
                    const planeRows = document.querySelectorAll('.table-row');
                    planeRows.forEach(row => {
                        row.classList.remove('row-selected');
                    })

                    console.log('current', currentRow);
                    console.log('clicked', e.target.parentElement);


                    if (e.target.parentElement == currentRow) {
                        planeRow.classList.remove('row-selected');
                    } else {
                        planeRow.classList.toggle('row-selected');
                    }
                    currentRow = e.target.parentElement;
                    // plane.popup._wrapper.classList.toggle('popup-selected');

                    //highlighting chosen specific plane
                    // if (!planeRow.classList.contains('row-selected')) {
                    //     plane.popup._wrapper.style.backgroundColor = 'green';
                    // } else {
                    //     plane.popup._wrapper.style.backgroundColor = 'white';
                    //     // plane.popup._wrapper.removeAttribute('style');
                    // }
                    // // plane.popup._wrapper.style.backgroundColor = 'green';
                })
            })
    }

    putPlaneIntoTable(plane) {
        // console.log('nowa', plane.planeType, plane.airlineCode, plane.baroAltitude, plane.groundSpeed);
    }

    banPlane(plane) {
        // console.log();
    }

    highlightPlane(plane) {
        // const planeRow = document.getElementById(plane.icao);
        // console.log(planeRow);
        // planeRow.addEventListener('click', () => {
        //     plane.popup._wrapper.style.backgroundColor = 'green';
        // })
    }
}

function createIconPopup(allPlanes, planesObjects, boundariesPoints, bannedTypes, bannedAirlines, typeAirlineFilterState, altitudeFilterState) {
    planesObjects.forEach(plane => {
        (async function () {
            //updating plane info
            await plane.updatePlaneInfo(plane, allPlanes);
            //creating plane icons
            await plane.createPlaneIcon(plane, allPlanes);
            //creating plane popups
            await plane.createPlanePopup(plane);
            //tracking plane for notification
            await plane.trackPlane(plane, boundariesPoints);
            //assigning plane type and airline
            await plane.assignIcaoTypeAndAirline(plane, planesObjects, bannedTypes, bannedAirlines, typeAirlineFilterState, altitudeFilterState);
            //putting plane into table - not in use
            await plane.putPlaneIntoTable(plane);
            //banning plane - not in use
            await plane.banPlane(plane);
            //highlighting plane when being clicked - not in use
            await plane.highlightPlane(plane);

        })();
    })
}