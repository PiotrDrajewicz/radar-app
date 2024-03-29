// import { turnOnOffFilters } from './filters.js';
// import { planeFilterOn } from "./radar.js";
export { Plane, createIconPopup, sortByAltitude };
// import { sendNotification } from './notifications.js';
let tableRowsArr = [];
let tableDiv = document.getElementById("table-div");
let tableRows = document.querySelector(".table-rows");

class Plane {
  constructor(
    icao,
    lat,
    lng,
    track,
    groundSpeed,
    baroAltitude,
    map,
    verticalRate
  ) {
    this.icao = icao;
    this.lat = lat;
    this.lng = lng;
    this.track = track;
    this.groundSpeed = groundSpeed;
    this.baroAltitude = baroAltitude;
    this.verticalRate = verticalRate;
    this.map = map;
    this.notificationSent = false;
    this.banned = false;
    this.bannedAlt = false;
  }

  createPlaneIcon(plane, planesUpdated) {
    const planeIcon = L.icon({
      iconUrl: "plane-icon.svg",
      iconSize: [20, 20],
    });

    let planeMarker = L.marker([this.lat, this.lng], {
      icon: planeIcon,
      rotationAngle: this.track,
    });
    if (!plane.hasOwnProperty("icon")) {
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

    if (!plane.hasOwnProperty("popup")) {
      //   console.log(plane.zIndex);
      //creating plane popup
      if (trackDeg > 1 && trackDeg < 180) {
        //right course
        popup = new L.popup({
          className: "custom",
          offset: [73, 77],
          closeOnClick: false,
          autoClose: false,
        });
      } else {
        //left course
        popup = new L.popup({
          className: "custom",
          id: "",
          offset: [65, 72],
          closeOnClick: false,
          autoClose: false,
        });
      }
      popup.setLatLng(new L.LatLng(planeLat, planeLng));

      const apiDetailed = `https://api.joshdouch.me/api/aircraft/${planeIcao}`;
      fetch(apiDetailed)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          const icaoTypeCode = data.ICAOTypeCode;
          const operatorFlagCode = data.OperatorFlagCode;

          if (data.status) {
            popup.setContent(
              `<ul class="popup-list"><li>N/A</li><li>${groundSpeed} kt</li><li>N/A</li><li>${baroAltitude} ft</li></ul>`
            );
          } else {
            popup.setContent(
              `<ul class="popup-list"><li>${icaoTypeCode}</li><li>${groundSpeed} kt</li><li>${operatorFlagCode}</li><li>${baroAltitude} ft</li></ul>`
            );
          }
        });

      plane.popup = popup;

      //this
      this.map.addLayer(popup);
    } else {
      //updating plane popup
      plane.popup.setLatLng(new L.LatLng(planeLat, planeLng));

      const apiDetailed = `https://api.joshdouch.me/api/aircraft/${planeIcao}`;
      fetch(apiDetailed)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          const icaoTypeCode = data.ICAOTypeCode;
          const operatorFlagCode = data.OperatorFlagCode;

          if (data.status) {
            plane.popup.setContent(
              `<ul class="popup-list"><li>N/A</li><li>${groundSpeed} kt</li><li>N/A</li><li>${baroAltitude} ft</li></ul>`
            );
          } else {
            plane.popup.setContent(
              `<ul class="popup-list"><li>${icaoTypeCode}</li><li>${groundSpeed} kt</li><li>${operatorFlagCode}</li><li>${baroAltitude} ft</li></ul>`
            );
          }
        });
    }

    // plane.popup._container.addEventListener('mouseover', () => {
    //     const airlineLogoBig = document.querySelector('.airline-logo-big');
    //     airlineLogoBig.classList.add('show');
    // })
  }

  updatePlaneInfo(plane, planesUpdated) {
    for (let n = 0; n < planesUpdated.length; n++) {
      if (plane.icao === planesUpdated[n][0]) {
        plane.lat = planesUpdated[n][6];
        plane.lng = planesUpdated[n][5];
        plane.track = planesUpdated[n][10];
        plane.groundSpeed = Math.round(planesUpdated[n][9] * 1.94);
        plane.baroAltitude = Math.round(planesUpdated[n][7] * 3.28084);
        plane.verticalRate = planesUpdated[n][11];
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

  assignIcaoTypeAndAirline(
    plane,
    planesObjects,
    bannedTypes,
    bannedAirlines,
    typeAirlineFilterState,
    altitudeFilterState
  ) {
    //this function runs for every plane already
    const apiDetailed = `https://api.joshdouch.me/api/aircraft/${plane.icao}`;
    // const apiReg = `https://api.joshdouch.me/hex-reg.php?hex=${plane.icao}`;
    fetch(apiDetailed)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
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

        putPlaneIntoTable(plane, planesObjects);
      })
      .then(() => {
        banPlane(
          plane,
          bannedTypes,
          bannedAirlines,
          typeAirlineFilterState,
          altitudeFilterState
        );
      })
      .then(() => {
        highlightPlane(plane);
      })
      .then(() => {
        addVerticalRateIndToPopup(plane);
      })
      .then(() => {
        addAirlineLogo(plane);
      })
      .then(() => {
        stackPopup(plane);
      });
  }

  //those functions should probably be defined here and called in createIconPopup function in async await section
  // putPlaneIntoTable(plane) {}

  // banPlane(plane) {}

  // highlightPlane(plane) {}

  // addVerticalRateIndToPopup(plane) {}

  // addAirlineLogo(plane) {}

  // stackPopup(plane) {}
}

function createIconPopup(
  allPlanes,
  planesObjects,
  boundariesPoints,
  bannedTypes,
  bannedAirlines,
  typeAirlineFilterState,
  altitudeFilterState
) {
  planesObjects.forEach((plane) => {
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
      await plane.assignIcaoTypeAndAirline(
        plane,
        planesObjects,
        bannedTypes,
        bannedAirlines,
        typeAirlineFilterState,
        altitudeFilterState
      );
      //putting plane into table - not in use
      // await plane.putPlaneIntoTable(plane);
      //banning plane - not in use
      // await plane.banPlane(plane);
      //highlighting plane when being clicked - not in use
      // await plane.highlightPlane(plane);
      //adding vertical rate indicator to popup - not in use
      // await plane.addVerticalRateIndToPopup(plane);
      //adding small and big airline logo to popup - not in use
      // await plane.addAirlineLogo(plane);
      //stacking popup - not in use
      // await plane.stackPopup(plane);
    })();
  });
}

function sortByAltitude(allPlanes) {
  //sorting planes by altitude (from min to max)
  let counter = 0;
  allPlanes.sort((a, b) => {
    return a.baroAltitude - b.baroAltitude;
  });

  allPlanes.forEach((plane) => {
    counter += 1;
    plane.zIndexAlt = counter;
  });
}

function stackPopup(plane) {
  //giving plane's popup its z-index
  plane.popup._container.style.zIndex = plane.zIndexAlt;
}

function addAirlineLogo(plane) {
  if (!plane.airlineCode || plane.airlineCode === plane.planeType) {
    return;
  } else {
    const popupUl = plane.popup._container.querySelector("ul");
    // plane.popup._container.querySelector('ul').children[5].style.pointerEvents = 'none';

    //adding small and big airline logo to popup
    popupUl.innerHTML += `<img class="airline-logo-small" src="https://content.airhex.com/content/logos/airlines_${plane.airlineCode}_50_15_s.png?proportions=keep">`;
    popupUl.innerHTML += `<img class="airline-logo-big" src="https://content.airhex.com/content/logos/airlines_${plane.airlineCode}_100_20_r.png?proportions=keep">`;

    const airlineLogoBig =
      plane.popup._container.querySelector(".airline-logo-big");

    //showing/hiding big airline logo
    plane.popup._container.addEventListener("mouseover", () => {
      airlineLogoBig.classList.add("show");
    });
    plane.popup._container.addEventListener("mouseout", () => {
      airlineLogoBig.classList.remove("show");
    });
  }
}

function addVerticalRateIndToPopup(plane) {
  //adding vertical rate indicator to plane's popup
  const altitudeLi = plane.popup._container.querySelector("ul").children[3];

  if (plane.verticalRate < 0) {
    altitudeLi.innerHTML +=
      '<i class="fa-solid fa-caret-down popup-vertical-icon"></i>';
  }
  if (plane.verticalRate > 0) {
    altitudeLi.innerHTML +=
      '<i class="fa-solid fa-caret-up popup-vertical-icon"></i>';
  }
}

function highlightPlane(plane) {
  //highlighting - clicking on a table row
  const planeRow = document.getElementById(plane.icao);
  planeRow.addEventListener("click", (e) => {
    const planeRowsArr = [...document.querySelectorAll(".table-row")];
    const planePopupsArr = [
      ...document.querySelectorAll(".leaflet-popup-content-wrapper"),
    ];
    const selectedRow = e.target.parentElement;
    const connectedPopup = plane.popup._wrapper;

    //selecting/deselecting specific row and popup
    selectedRow.classList.toggle("row-selected");
    connectedPopup.classList.toggle("popup-selected");

    //separating clicked row and popup
    const clickedRowIndex = planeRowsArr.indexOf(selectedRow);
    planeRowsArr.splice(clickedRowIndex, 1);
    const connectedPopupIndex = planePopupsArr.indexOf(connectedPopup);
    planePopupsArr.splice(connectedPopupIndex, 1);

    //clearing all other rows and popups
    planeRowsArr.map((row) => {
      row.classList.remove("row-selected");
    });
    planePopupsArr.map((popup) => {
      popup.classList.remove("popup-selected");
    });
  });

  //highlighting - clicking on a map popup
  const planePopup = plane.popup._wrapper;
  planePopup.addEventListener("click", (e) => {
    const planeRowsArr = [...document.querySelectorAll(".table-row")];
    const planePopupsArr = [
      ...document.querySelectorAll(".leaflet-popup-content-wrapper"),
    ];
    const selectedPopup = e.target.closest(".leaflet-popup-content-wrapper");
    const connectedRow = document.getElementById(plane.icao);

    //selecting/deselecting specific row and popup
    selectedPopup.classList.toggle("popup-selected");
    connectedRow.classList.toggle("row-selected");

    //separating clicked row and popup
    const clickedPopupIndex = planePopupsArr.indexOf(selectedPopup);
    planePopupsArr.splice(clickedPopupIndex, 1);
    const connectedRowIndex = planeRowsArr.indexOf(connectedRow);
    planeRowsArr.splice(connectedRowIndex, 1);

    //clearing all other rows and popups
    planeRowsArr.map((row) => {
      row.classList.remove("row-selected");
    });
    planePopupsArr.map((popup) => {
      popup.classList.remove("popup-selected");
    });
  });
}

function banPlane(
  plane,
  bannedTypes,
  bannedAirlines,
  typeAirlineFilterState,
  altitudeFilterState
) {
  //type-airline filter
  if (typeAirlineFilterState) {
    //filter is active
    // console.log('plane filter is active');
    // bannedTypes.push('A320');
    // bannedTypes.push('A321');
    // bannedTypes.push('B738');

    let tableRow = document.getElementById(plane.icao);

    //checking if plane (type) is banned
    const typesMatch = bannedTypes.map((type) => {
      if (type == plane.planeType) {
        return true;
      }
    });

    //checking if plane (airline) is banned
    const airlinesMatch = bannedAirlines.map((airline) => {
      if (airline == plane.airlineCode) {
        return true;
      }
    });

    if (typesMatch.includes(true) || airlinesMatch.includes(true)) {
      //plane is banned
      // console.log('zbanowany', plane.planeType);
      plane.banned = true;
      tableRow.classList.add("banned-plane");
      plane.popup._wrapper.classList.add("banned-popup");
      // plane.icon._icon.style.border = '1px solid rgb(255, 176, 176)';
    } else {
      //plane is not banned
      // console.log('nie zbanowany', plane.planeType);
      plane.banned = false;
      tableRow.classList.remove("banned-plane");
      plane.popup._wrapper.classList.remove("banned-popup");
    }
  } else {
    //filter is not active
    // console.log('type-airline filter is not active');

    plane.banned = false;
    let tableRow = document.getElementById(plane.icao);
    tableRow.classList.remove("banned-plane");
    plane.popup._wrapper.classList.remove("banned-popup");
  }

  //altitude filter
  if (altitudeFilterState) {
    //filter is active
    // console.log('altitude filter is active');
    let planeAlt = plane.baroAltitude;
    let tableRow = document.getElementById(plane.icao);
    let minAlt = document.getElementById("min-height").value;
    let maxAlt = document.getElementById("max-height").value;

    // console.log(minAlt, typeof minAlt, maxAlt, typeof maxAlt);

    //min and max are provided
    if (minAlt !== "" && maxAlt !== "") {
      if (
        planeAlt >= parseInt(minAlt, 10) &&
        planeAlt <= parseInt(maxAlt, 10)
      ) {
        //plane is inside range
        plane.bannedAlt = false;
        tableRow.classList.remove("banned-plane-altitude");
        plane.popup._wrapper.classList.remove("banned-popup-altitude");
      } else {
        //plane is outside range
        plane.bannedAlt = true;
        tableRow.classList.add("banned-plane-altitude");
        plane.popup._wrapper.classList.add("banned-popup-altitude");
      }
    }

    //nothing is provided
    if (minAlt === "" && maxAlt === "") {
      plane.bannedAlt = false;
      tableRow.classList.remove("banned-plane-altitude");
      plane.popup._wrapper.classList.remove("banned-popup-altitude");
    }

    //only min is provided
    if (minAlt !== "" && maxAlt === "") {
      if (planeAlt >= parseInt(minAlt, 10)) {
        //plane is inside range
        plane.bannedAlt = false;
        tableRow.classList.remove("banned-plane-altitude");
        plane.popup._wrapper.classList.remove("banned-popup-altitude");
      } else {
        //plane is outside range
        plane.bannedAlt = true;
        tableRow.classList.add("banned-plane-altitude");
        plane.popup._wrapper.classList.add("banned-popup-altitude");
      }
    }

    //only max is provided
    if (minAlt === "" && maxAlt !== "") {
      if (planeAlt <= parseInt(maxAlt, 10)) {
        //plane is inside range
        plane.bannedAlt = false;
        tableRow.classList.remove("banned-plane-altitude");
        plane.popup._wrapper.classList.remove("banned-popup-altitude");
      } else {
        //plane is outside range
        plane.bannedAlt = true;
        tableRow.classList.add("banned-plane-altitude");
        plane.popup._wrapper.classList.add("banned-popup-altitude");
      }
    }
  } else {
    //filter is not active
    // console.log('altitude filter is not active');

    let tableRow = document.getElementById(plane.icao);
    tableRow.classList.remove("banned-plane-altitude");
    plane.popup._wrapper.classList.remove("banned-popup-altitude");
  }

  //hiding or showing banned planes
  const showHideButton = document.getElementById("hide-show-button");
  let tableRow = document.getElementById(plane.icao);
  if (showHideButton.classList.contains("hide")) {
    //banned planes are shown
    tableRow.classList.remove("hide-banned-row");
    plane.popup._wrapper.style.opacity = 1;
    plane.icon._icon.style.opacity = 1;
  }
  if (showHideButton.classList.contains("show")) {
    //banned planes are hidden
    if (plane.banned || plane.bannedAlt) {
      //plane is banned
      tableRow.classList.add("hide-banned-row");
      plane.popup._wrapper.style.opacity = 0;
      plane.icon._icon.style.opacity = 0;
    } else {
      //plane is not banned
      tableRow.classList.remove("hide-banned-row");
      plane.popup._wrapper.style.opacity = 1;
      plane.icon._icon.style.opacity = 1;
    }
  }
}

function putPlaneIntoTable(plane, planesObjects) {
  let tableCellAltitude;
  let tableCellSpeed;
  let tableRow;

  if (!plane.inTable) {
    //creating table position for plane
    // tableDiv = document.getElementById('table-div');
    // tableRows = document.querySelector('.table-rows');
    tableRow = document.createElement("div");
    tableRow.classList.add("table-row");
    tableRow.classList.add("table-grid");
    tableRow.setAttribute("id", plane.icao);

    const tableCellType = document.createElement("p");
    tableCellType.textContent = plane.planeType;
    tableCellType.classList.add("table-cell");

    const tableCellAirline = document.createElement("p");
    tableCellAirline.textContent = plane.airlineCode;
    tableCellAirline.classList.add("table-cell");

    const tableCellRegistration = document.createElement("p");
    // tableCellRegistration.textContent = plane.airlineCode;
    tableCellRegistration.textContent = plane.icao; //placeholder
    tableCellRegistration.classList.add("table-cell");

    tableCellAltitude = document.createElement("p");
    tableCellAltitude.textContent = plane.baroAltitude;
    tableCellAltitude.classList.add("table-cell");
    tableCellAltitude.classList.add("altitude-cell");

    tableCellSpeed = document.createElement("p");
    tableCellSpeed.textContent = plane.groundSpeed;
    tableCellSpeed.classList.add("table-cell");
    tableCellSpeed.classList.add("speed-cell");

    tableRow.appendChild(tableCellType);
    tableRow.appendChild(tableCellAirline);
    tableRow.appendChild(tableCellRegistration);
    tableRow.appendChild(tableCellAltitude);
    tableRow.appendChild(tableCellSpeed);
    tableRows.appendChild(tableRow);
    tableDiv.appendChild(tableRows);

    //adding vertical rate indicator if needed
    if (plane.verticalRate < 0) {
      tableCellAltitude.innerHTML +=
        '<i class="fa-solid fa-caret-down vertical-icon"></i>';
    }
    if (plane.verticalRate > 0) {
      tableCellAltitude.innerHTML +=
        '<i class="fa-solid fa-caret-up vertical-icon"></i>';
    }

    tableRowsArr.push(tableRow);
    plane.inTable = true;
  } else {
    //updating plane's alt and spd in table
    const planeToUpdate = tableRowsArr.find(
      (row) => row.getAttribute("id") === plane.icao
    );
    planeToUpdate.children[3].textContent = plane.baroAltitude;
    planeToUpdate.children[4].textContent = plane.groundSpeed;

    //updating vertical rate indicator
    if (plane.verticalRate < 0) {
      planeToUpdate.children[3].innerHTML +=
        '<i class="fa-solid fa-caret-down vertical-icon"></i>';
    }
    if (plane.verticalRate > 0) {
      planeToUpdate.children[3].innerHTML +=
        '<i class="fa-solid fa-caret-up vertical-icon"></i>';
    }
  }

  tableRowsArr.map((row) => {
    const icaoFromTable = row.getAttribute("id");
    const planeFound = planesObjects.find(
      (plane) => plane.icao === icaoFromTable
    );

    //removing row from table if plane is gone
    if (!planeFound) {
      row.remove();
    }
  });
}
