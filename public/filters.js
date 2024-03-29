// const aircraftTypesData = require('./aircraftIcaoIata.json');
// module.exports = aircraftTypesData;

import { manageDropdownMenu } from './dropdown.js';
import { fetchData } from './data-functions.js';
export { createPlaneTypeElements, createAirlineElements, updateHeightText, switchCheckboxes, checkCheckboxState, switchShowHideButton };

function createPlaneTypeElements(airplanesTypes, bannedTypes) {
    const typesDropdownMenu = document.querySelector('.dropdown-menu');
    fetchData('./aircraftIcaoIata.json')
        .then(data => {
            data.forEach(planeType => {
                //creating plane type element in dropdown menu
                const bannedTypesDisplay = document.getElementById('banned-types-display');
                const bannedTypesPlaceholder = document.getElementById('banned-types-placeholder');
                const typeIcaoCode = planeType.icaoCode;
                airplanesTypes.push(typeIcaoCode);
                const typeElement = document.createElement('p');
                typeElement.setAttribute('id', typeIcaoCode);
                typeElement.classList.add('type-element');
                typeElement.textContent = typeIcaoCode;
                typeElement.addEventListener('click', e => {
                    // console.log(e.target.id); //logging clicked element 
                    //adding and removing ban sign and color to the plane type if chosen
                    if (!typeElement.querySelector('#ban-sign')) {
                        typeElement.innerHTML += '<i id="ban-sign" class="fa-solid fa-ban ban-sign"></i>';
                    } else {
                        const banSign = typeElement.querySelector('#ban-sign');
                        banSign.remove();
                    }
                    typeElement.classList.toggle('banned');

                    displayBannedWindow(typeElement, bannedTypes, bannedTypesDisplay, bannedTypesPlaceholder);

                })
                typesDropdownMenu.appendChild(typeElement);

            })

            manageDropdownMenu();

            //reset button functionality
            const resetTypeButton = document.getElementById('reset-type-button');
            const typeElements = document.querySelectorAll('.type-element');
            manageResetButton(resetTypeButton, typeElements, bannedTypes);

        });
}

function createAirlineElements(airlines, bannedAirlines, planesObjects) {
    console.log('objs in filters', planesObjects);
    const airlinesDropdownMenu = document.getElementById('airline-dropdown-menu');
    fetchData('./airlineIcao.json')
        .then(data => {
            // console.log(data);
            data.forEach(airline => {
                //creating airline element in dropdown menu
                const bannedAirlinesDisplay = document.getElementById('banned-airlines-display');
                const bannedAirlinesPlaceholder = document.getElementById('banned-airlines-placeholder');
                const airlineIcaoCode = airline.icaoCode;
                // console.log(airline.icaoCode);
                airlines.push(airlineIcaoCode);
                const airlineElement = document.createElement('p');
                airlineElement.setAttribute('id', airlineIcaoCode);
                airlineElement.classList.add('airline-element');
                airlineElement.textContent = airlineIcaoCode;
                airlineElement.addEventListener('click', e => {
                    //adding and removing ban sign and color to the airline if chosen
                    if (!airlineElement.querySelector('#ban-sign')) {
                        airlineElement.innerHTML += '<i id="ban-sign" class="fa-solid fa-ban ban-sign"></i>';
                    } else {
                        const banSign = airlineElement.querySelector('#ban-sign');
                        banSign.remove();
                    }
                    airlineElement.classList.toggle('banned');

                    displayBannedWindow(airlineElement, bannedAirlines, bannedAirlinesDisplay, bannedAirlinesPlaceholder);

                })
                airlinesDropdownMenu.appendChild(airlineElement);
            })

            //reset button functionality
            const resetAirlineButton = document.getElementById('reset-airline-button');
            const airlineElements = document.querySelectorAll('.airline-element');
            manageResetButton(resetAirlineButton, airlineElements, bannedAirlines);

        })
}

function updateHeightText() {
    const applyHeightButton = document.getElementById('apply-height-button');
    const minHeightInput = document.getElementById('min-height');
    const maxHeightInput = document.getElementById('max-height');
    const minHeightText = document.getElementById('min-height-value');
    const maxHeightText = document.getElementById('max-height-value');
    applyHeightButton.addEventListener('click', () => {
        const convertedMax = Number(maxHeightInput.value);
        const convertedMin = Number(minHeightInput.value);

        //displaying text for min alt
        if (isNaN(convertedMin)) {
            minHeightText.classList.add('not-a-number');
            minHeightText.textContent = '[not a number]';
        } else {
            minHeightText.classList.remove('not-a-number');
            if (convertedMin === 0) {
                minHeightText.textContent = 'ထ';
            } else {
                minHeightText.textContent = minHeightInput.value;
            }
        }

        //displaying text for max alt
        if (isNaN(convertedMax)) {
            maxHeightText.classList.add('not-a-number');
            maxHeightText.textContent = '[not a number]';
        } else {
            maxHeightText.classList.remove('not-a-number');
            if (convertedMax === 0) {
                maxHeightText.textContent = 'ထ';
            } else {
                maxHeightText.textContent = maxHeightInput.value;
            }
        }

    })
}

function displayBannedWindow(bannedElement, bannedArr, bannedDisplay, bannedPlaceholder) {
    //adding element to banned window
    if (bannedElement.classList.contains('banned')) {
        bannedArr.push(bannedElement.id);

        //displaying banned element
        const spanElement = document.createElement('span');
        spanElement.setAttribute('id', bannedElement.id + '-span');
        spanElement.classList.add('banned-span');
        spanElement.textContent = bannedElement.id;
        bannedDisplay.appendChild(spanElement);
    }
    if (!bannedElement.classList.contains('banned')) {
        bannedArr.splice(bannedArr.indexOf(bannedElement.id), 1);

        //removing element from banned display window
        const spanToDelete = document.getElementById(bannedElement.id + '-span');
        spanToDelete.remove();
    }

    if (bannedArr.length !== 0) {
        bannedPlaceholder.classList.add('hide');
    } else {
        bannedPlaceholder.classList.remove('hide');
    }
}

function switchCheckboxes() {
    const filterSwitches = document.querySelectorAll('.filter-switch');
    filterSwitches.forEach(filterSwitch => {
        filterSwitch.addEventListener('click', () => {
            filterSwitch.classList.toggle('active');
        })
    })
}

function checkCheckboxState(checkbox) {
    if (checkbox.classList.contains('active')) {
        console.log(checkbox.id, 'is active');
        return true;
    } else {
        console.log(checkbox.id, 'is not active');
        return false;
    }
}

function switchShowHideButton() {
    const showHideButton = document.getElementById('hide-show-button');
    showHideButton.addEventListener('click', () => {
        if (showHideButton.classList.contains('hide')) {
            showHideButton.textContent = 'Show banned';
            showHideButton.classList.remove('hide');
            showHideButton.classList.add('show');
        } else if (showHideButton.classList.contains('show')) {
            showHideButton.textContent = 'Hide banned';
            showHideButton.classList.remove('show');
            showHideButton.classList.add('hide');
        }
    })
}

function manageResetButton(resetButton, elementsArr, bannedArr) {
    resetButton.addEventListener('click', () => {
        //emptying arr with banned types 
        bannedArr = [];

        elementsArr.forEach(element => {
            //deleting displayed banned types
            const spanToDelete = document.getElementById(element.id + '-span');
            if (spanToDelete) {
                spanToDelete.remove();
            }

            //removing color and sign
            element.classList.remove('banned');
            const banSign = element.querySelector('#ban-sign');
            if (banSign) {
                banSign.remove();
            }
        })
    })
}