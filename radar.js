window.addEventListener('load', () => { //run fun when page is loaded
	let long; //declaring variable here so we can move it out
	let lat;
	let map;
	const areaPoints = [];

	const workButton = document.getElementById('work-btn');

	//selectors

	if (navigator.geolocation) { //built in function
		navigator.geolocation.getCurrentPosition(position => {
			lat = position.coords.latitude;
			long = position.coords.longitude;

			//creating map
			map = L.map('map').setView([lat, long], 8);
			L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
				attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
				maxZoom: 18,
				id: 'mapbox/streets-v11',
				tileSize: 512,
				zoomOffset: -1,
				accessToken: 'pk.eyJ1Ijoic2VyZWt3aWVqc2tpIiwiYSI6ImNsMmdhMXRmNzAxdnkzaXBoc2J0aXRoeWcifQ.P5SBaZpNYNfq1Pfk1Pw9FA'
			}).addTo(map);

			//adding marker with user's position
			L.marker([lat, long]).addTo(map)
				.openPopup();

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

					// const allPlanes = [];
					// const planesObjects = [];

					function fetchData(api) {
						return new Promise(resolve => {
							console.log('fetching data');
							resolve(fetch(api)
								.then(response => {
									return response.json();
								})
								// .then(data => {
								// 	// const allPlanes = [];
								// 	data.states.forEach(plane => {
								// 		allPlanes.push(plane);
								// 	})
								// 	console.log('api done');
								// 	// console.log(allPlanes);
								// 	return allPlanes;
								// })
							)
						})
					}

					function extractData(data) {
						const allPlanes = [];
						return new Promise(resolve => {
							console.log('extracting data');

							data.states.forEach(plane => {
								allPlanes.push(plane);
							})

							resolve(allPlanes);
						})
					}

					const planesObjects = [];
					//construcor for planes
					class Plane {
						constructor(icao, lat, lng, track, groundSpeed, baroAltitude) {
							this.icao = icao;
							this.lat = lat;
							this.lng = lng;
							this.track = track;
							this.groundSpeed = groundSpeed;
							this.baroAltitude = baroAltitude;
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
								map.addLayer(popup);
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
					}

					function createObjects(allPlanes) {
						return new Promise(resolve => {
							console.log('creating objects');
							//adding new objects
							allPlanes.forEach(plane => {
								let counter = 0;
								const planeObj = new Plane(plane[0], plane[6], plane[5], plane[10], plane[9], plane[7]);

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
								}
							})

							resolve(allPlanes);
							console.log('all po usuwaniu: ', allPlanes);
							console.log('objects po usuwaniu: ', planesObjects);
						})
					}

					function createIconPopup(allPlanes) {
						planesObjects.forEach(plane => {
							//updating plane info
							plane.updatePlaneInfo(plane, allPlanes);
							//creating plane icons
							plane.createPlaneIcon(plane, allPlanes);
							//creating plane popups
							plane.createPlanePopup(plane);
						})
					}

					function work() {
						fetchData(api)
							.then(res => {
								return extractData(res);
							})
							.then(res => {
								return createObjects(res);
							})
							.then(res => {
								createIconPopup(res);
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

