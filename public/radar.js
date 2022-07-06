import { createMap, createUserPositionMarker, createCircle, createWatchedArea, Point } from './map-functions.js';
import { fetchData, extractData } from './data-functions.js';
import { Plane, createIconPopup } from './plane-class.js';
// import { manageDropdownMenu } from './dropdown.js';
import { manageNavbar } from './navbar.js';
import { createPlaneTypeElements, createAirlineElements, updateHeightText } from './filters.js'
// import { sendNotification } from './notifications.js';

window.addEventListener('load', () => { //run function when page is loaded
	let long; //declaring variable here so we can move it out
	let lat;
	const areaPoints = [];
	const boundariesPoints = [];
	const workButton = document.getElementById('work-btn');
	// const typesDropdownMenu = document.querySelector('.dropdown-menu');
	const airplanesTypes = [];
	const airlines = [];
	const bannedTypes = [];
	const bannedAirlines = [];
	// const typeDropdown = document.querySelector('#type-dropdown');

	createPlaneTypeElements(airplanesTypes, bannedTypes);
	// console.log(airplanesTypes);

	createAirlineElements(airlines);

	manageNavbar();

	updateHeightText();


	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(position => {
			lat = position.coords.latitude;
			long = position.coords.longitude;
			let api;

			//creating map and markers
			let map = createMap(lat, long);
			createUserPositionMarker(lat, long, map);

			//adding area points
			let i = 0;
			function onMapClick(e) {
				i++;
				if (i > 4) {
					console.log('you already have 4 points');
					console.log(areaPoints);
				} else {
					const clickLat = e.latlng.lat;
					const clickLng = e.latlng.lng;
					const pointObj = new Point(i, clickLat, clickLng);
					areaPoints.push(pointObj);
					console.log(areaPoints);
					// localStorage.setItem(`p${i}`, JSON.stringify(clickCoordinates));

					//adding circle
					createCircle(clickLat, clickLng, map);
				}

				if (i == 4) {
					//adding watched area
					createWatchedArea(areaPoints, map);

					const latMin = areaPoints[2].lat;
					boundariesPoints.push(areaPoints[2].lat);
					const lngMin = areaPoints[0].lng;
					boundariesPoints.push(areaPoints[0].lng);
					const latMax = areaPoints[0].lat;
					boundariesPoints.push(areaPoints[0].lat);
					const lngMax = areaPoints[1].lng;
					boundariesPoints.push(areaPoints[1].lng);
					console.log('boundaries: ', boundariesPoints);
					api = `https://opensky-network.org/api/states/all?lamin=${latMin}&lomin=${lngMin}&lamax=${latMax}&lomax=${lngMax}`;

					const planesObjects = [];

					function createObjects(allPlanes) {
						return new Promise(resolve => {
							console.log('creating objects');
							//adding new objects
							allPlanes.forEach(plane => {
								let counter = 0;
								const planeObj = new Plane(plane[0], plane[6], plane[5], plane[10], plane[9], plane[7], map);

								//adding icao type
								// console.log('icaooo: ', planeObj.icao);
								// const icaoType = assignIcaoType(planeObj.icao);
								// console.log('typ po funkcji', icaoType);
								// planeObj.planeType = icaoType;

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

					function work() {
						fetchData(api)
							.then(res => {
								return extractData(res);
							})
							.then(res => {
								return createObjects(res, planesObjects);
							})
							.then(res => {
								createIconPopup(res, planesObjects, boundariesPoints);
							});
					}
					workButton.addEventListener('click', work);

					// setInterval(() => {
					// 	fetchData(api)
					// 		.then(res => {
					// 			return extractData(res);
					// 		})
					// 		.then(res => {
					// 			return createObjects(res);
					// 		})
					// 		.then(res => {
					// 			createIconPopup(res);
					// 		});
					// }, 3000);

				}
			}

			// sendNotification();

			map.on('click', onMapClick);
		});
	}
})

