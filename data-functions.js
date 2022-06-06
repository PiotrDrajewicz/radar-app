export { fetchData, extractData };

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