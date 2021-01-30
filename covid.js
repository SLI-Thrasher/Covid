"use strict";

const userAction = async () => {
    const response = await fetch('https://api.corona-zahlen.org/districts/');
    const json = await response.json(); //extract JSON from the http response
    const covidData = Object.entries(json.data);
    // do something with myJson
    console.log(covidData)
    const chemnitzData = covidData.filter(element => element[1].name == 'Chemnitz');

    console.log(chemnitzData[0]);
  }

const getDistricData = async (district, type) => {
    const response = await fetch(`https://api.corona-zahlen.org/districts/${district}/history/${type}`);
    const json = await response.json(); //extract JSON from the http response
    console.log(json);
    console.log(json.data[district].history);

    return json.data[14511].history;
}

const getDataForChemnitz = async () => {
    const response = await fetch('https://api.corona-zahlen.org/districts/14511/history');
    const json = await response.json(); //extract JSON from the http response
    console.log(json.data[14511].history);

    const history = json.data[14511].history;

    const data = Array.from(history, element => element.cases);
    console.log(data);

    const labels = Array.from(history, elements => elements.date);
    console.log(labels);

    drawData(labels, data);
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
                label: `Covid Fälle Chemnitz`,
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