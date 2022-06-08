import { createMap, createUserPositionMarker } from './map-functions.js';
import { fetchData, extractData } from './data-functions.js';
import { Plane, createIconPopup } from './plane-class.js';

window.addEventListener('load', () => { //run function when page is loaded
	let long; //declaring variable here so we can move it out
	let lat;
	const areaPoints = [];
	const workButton = document.getElementById('work-btn');

	//selectors

	if (navigator.geolocation) { //built in function
		navigator.geolocation.getCurrentPosition(position => {
			lat = position.coords.latitude;
			long = position.coords.longitude;

			let map = createMap(lat, long);
			createUserPositionMarker(lat, long, map);

			class point {
				constructor(pointNumber, lat, lng) {
					this.pointNumber = pointNumber;
					this.lat = lat;
					this.lng = lng;
				}
			}
			let api;

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
					const pointObj = new point(i, clickLat, clickLng);
					areaPoints.push(pointObj);
					console.log(areaPoints);
					// localStorage.setItem(`p${i}`, JSON.stringify(clickCoordinates));

					//adding circle
					const circle = L.circle([clickLat, clickLng], {
						color: 'red',
						fillColor: '#f03',
						fillOpacity: 0.5,
						radius: 50
					}).addTo(map);
				}

				if (i == 4) {
					//adding watched area
					const polygon = L.polygon([
						[areaPoints[0].lat, areaPoints[0].lng],
						[areaPoints[1].lat, areaPoints[1].lng],
						[areaPoints[2].lat, areaPoints[2].lng],
						[areaPoints[3].lat, areaPoints[3].lng]
					]).addTo(map);

					const latMin = areaPoints[2].lat;
					const lngMin = areaPoints[0].lng;
					const latMax = areaPoints[0].lat;
					const lngMax = areaPoints[1].lng;
					api = `https://opensky-network.org/api/states/all?lamin=${latMin}&lomin=${lngMin}&lamax=${latMax}&lomax=${lngMax}`;

					const planesObjects = [];

					function createObjects(allPlanes) {
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


					function work() {
						fetchData(api)
							.then(res => {
								return extractData(res);
							})
							.then(res => {
								return createObjects(res, planesObjects);
							})
							.then(res => {
								createIconPopup(res, planesObjects);
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
			map.on('click', onMapClick);

		});
	}
})

