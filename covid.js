"use strict";

const getDistricData = async (district, type) => {
    const response = await fetch(`https://api.corona-zahlen.org/districts/${district}/history/${type}`);
    const json = await response.json(); //extract JSON from the http response
    console.log(json);
    console.log(json.data[district].history);

    return json.data[14511].history;
}

const drawData = (canvas, labels, data) => {
    var ctx = canvas.getContext('2d');
    var chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',

        // The data for our dataset
        data: {
            labels: labels,
            datasets: [{
                label: `Covid Chemnitz`,
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data: data
            }]
        },

        // Configuration options go here
        options: {}
        });
}

document.addEventListener("DOMContentLoaded", async (event) => {
    const cases = await getDistricData('14511', 'cases');
    const incidence = await getDistricData('14511', 'incidence');
    
    drawData(
        document.getElementById('cases'),
        Array.from(cases, elements => elements.date), 
        Array.from(cases, element => element.cases)
        );

    drawData(
        document.getElementById('incidence'), 
        Array.from(incidence, elements => elements.date), 
        Array.from(incidence, elements => elements.weekIncidence)
        );
});