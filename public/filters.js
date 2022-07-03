// const aircraftTypesData = require('./aircraftIcaoIata.json');
// module.exports = aircraftTypesData;

import { manageDropdownMenu } from './dropdown.js';
import { fetchData } from './data-functions.js';
export { createPlaneTypeElements };

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