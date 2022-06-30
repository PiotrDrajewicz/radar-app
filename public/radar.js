import { createMap, createUserPositionMarker, createCircle, createWatchedArea, Point } from './map-functions.js';
import { fetchData, extractData } from './data-functions.js';
import { Plane, createIconPopup } from './plane-class.js';
// import { sendNotification } from './notifications.js';

window.addEventListener('load', () => { //run function when page is loaded
	let long; //declaring variable here so we can move it out
	let lat;
	const areaPoints = [];
	const boundariesPoints = [];
	const workButton = document.getElementById('work-btn');
	const typeDropdownField = document.getElementById('type-dropdown-field');
	const typesDropdownMenu = document.querySelector('.dropdown-menu');
	const dropdownButton = document.querySelector('.dropdown-button');
	const arrowAfter = window.getComputedStyle(dropdownButton, '::after');
	const airplanesTypes = [];

	fetchData('./aircraftIcaoIata.json')
		.then(data => {
			(function asd() {
				data.forEach(planeType => {
					const typeIcaoCode = planeType.icaoCode;
					airplanesTypes.push(typeIcaoCode);
					const typeElement = document.createElement('p');
					typeElement.setAttribute('id', typeIcaoCode);
					typeElement.classList.add('type-element');
					typeElement.textContent = typeIcaoCode;
					typeElement.addEventListener('click', e => {
						console.log(e.target.id);
						//adding ban sign to the plane type
						if (!typeElement.querySelector('#ban-sign')) {
							typeElement.innerHTML += '<i id="ban-sign" class="fa-solid fa-ban ban-sign"></i>';
						} else {
							const banSign = typeElement.querySelector('#ban-sign');
							banSign.remove();
						}
						typeElement.classList.toggle('banned');
					})
					typesDropdownMenu.appendChild(typeElement);

					// const optionType = document.createElement('option');
					// optionType.classList.add('dropdown-option-type');
					// optionType.setAttribute('value', plane.icaoCode);
					// optionType.textContent = plane.icaoCode;
					// typeDropdownField.appendChild(optionType);
				})

				// typeDropdownField.addEventListener('change', (e) => {
				// 	const element = [...e.target.children].find(ele => ele.value === e.target.value);
				// 	console.log(element);
				// })

				//opening and closing dropdown menu
				document.addEventListener('click', e => {
					const isDropdownButton = e.target.matches('.dropdown-button');
					//if we're not clicking on dropdown button and we're clicking inside dropdown (closest will give us here closest parent dropdown) ignore it
					if (!isDropdownButton && e.target.closest('.dropdown') != null) return

					//opening and closing dropdown menu (we're giving dropdown element class 'active' and due to that, our dropdown menu in css is being activated (.dropdown.active>.dropdown-button+.dropdown-menu) and it's getting opacity: 1)
					let currentDropdown;
					if (isDropdownButton) {
						currentDropdown = e.target.closest('.dropdown');
						currentDropdown.classList.toggle('active');
						// arrowAfter.classList.toggle('ppp');
						// console.log(arrowAfter);
						// arrowAfter.content = '\f077';
						// arrowAfter.setProperty('content', '\f077');
					}

					//closing all other active dropdowns
					document.querySelectorAll('.dropdown.active').forEach(dropdown => {
						if (dropdown === currentDropdown) return
						dropdown.classList.remove('active');
					})
				})

			})();

		});

	//navlinks
	const tableLink = document.querySelector('.table-link');
	const filtersLink = document.querySelector('.filters-link');

	filtersLink.addEventListener('click', () => {
		//show filters window
		if (!filtersLink.classList.contains('nav-link-active')) {
			filtersLink.classList.add('nav-link-active');
			tableLink.classList.remove('nav-link-active');
		}
	});
	tableLink.addEventListener('click', () => {
		//show table window
		if (!tableLink.classList.contains('nav-link-active')) {
			tableLink.classList.add('nav-link-active');
			filtersLink.classList.remove('nav-link-active');
		}
	});

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

