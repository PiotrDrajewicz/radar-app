// const aircraftTypesData = require('./aircraftIcaoIata.json');
// module.exports = aircraftTypesData;

import { manageDropdownMenu } from './dropdown.js';
import { fetchData } from './data-functions.js';
export { createPlaneTypeElements, createAirlineElements };

function createPlaneTypeElements(airplanesTypes) {
    const typesDropdownMenu = document.querySelector('.dropdown-menu');
    fetchData('./aircraftIcaoIata.json')
        .then(data => {
            data.forEach(planeType => {
                //creating plane type element in dropdown menu
                const typeIcaoCode = planeType.icaoCode;
                airplanesTypes.push(typeIcaoCode);
                const typeElement = document.createElement('p');
                typeElement.setAttribute('id', typeIcaoCode);
                typeElement.classList.add('type-element');
                typeElement.textContent = typeIcaoCode;
                typeElement.addEventListener('click', e => {
                    console.log(e.target.id);
                    //adding and removing ban sign and color to the plane type if chosen
                    if (!typeElement.querySelector('#ban-sign')) {
                        typeElement.innerHTML += '<i id="ban-sign" class="fa-solid fa-ban ban-sign"></i>';
                    } else {
                        const banSign = typeElement.querySelector('#ban-sign');
                        banSign.remove();
                    }
                    typeElement.classList.toggle('banned');
                })
                typesDropdownMenu.appendChild(typeElement);

            })

            manageDropdownMenu();

        });
}

function createAirlineElements(airlines) {
    const airlinesDropdownMenu = document.getElementById('airline-dropdown-menu');
    fetchData('./airlineIcao.json')
        .then(data => {
            data.forEach(airline => {
                //creating airline element in dropdown menu
                const airlineIcaoCode = airline.icaoCode;
                airlines.push(airlineIcaoCode);
                const airlineElement = document.createElement('p');
                airlineElement.setAttribute('id', airlineIcaoCode);
                airlineElement.classList.add('airline-element');
                airlineElement.textContent = airlineIcaoCode;
                airlineElement.addEventListener('click', e => {
                    console.log(e.target.id);
                    //adding and removing ban sign and color to the airline if chosen
                    if (!airlineElement.querySelector('#ban-sign')) {
                        airlineElement.innerHTML += '<i id="ban-sign" class="fa-solid fa-ban ban-sign"></i>';
                    } else {
                        const banSign = airlineElement.querySelector('#ban-sign');
                        banSign.remove();
                    }
                    airlineElement.classList.toggle('banned');
                })
                airlinesDropdownMenu.appendChild(airlineElement);
            })
        })
}