"use strict";

const getDistricData = async (district, type, days) => {
    let response;
    if (days === 0)
        response = await fetch(`https://api.corona-zahlen.org/districts/${district}/history/${type}`);
    else
        response = await fetch(`https://api.corona-zahlen.org/districts/${district}/history/${type}/${days}`);

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
    return chart;
}

let chartCases,chartIncidence;

const renderSite = async (days) => {
    const cases = await getDistricData('14511', 'cases', days);
    const incidence = await getDistricData('14511', 'incidence', days);
    
    chartCases = drawData(
        document.getElementById('cases'),
        Array.from(cases, elements => elements.date), 
        Array.from(cases, element => element.cases)
        );

    chartIncidence = drawData(
        document.getElementById('incidence'), 
        Array.from(incidence, elements => elements.date), 
        Array.from(incidence, elements => elements.weekIncidence)
        );
}

const updateSite = async (days, chart1, chart2) => {
    const cases = await getDistricData('14511', 'cases', days);
    const incidence = await getDistricData('14511', 'incidence', days);
    
    chart1.data.labels.length = 0;
    chart1.data.labels = Array.from(cases, elements => elements.date);
    chart1.data.datasets[0].data.length = 0;
    chart1.data.datasets[0].data = Array.from(cases, elements => elements.cases);

    chart1.update();

    chart2.data.labels.length = 0;
    chart2.data.labels = Array.from(incidence, elements => elements.date);
    chart2.data.datasets[0].data.length = 0;
    chart2.data.datasets[0].data = Array.from(incidence, elements => elements.weekIncidence);

    chart2.update();
}

document.addEventListener("DOMContentLoaded", async (event) => {
    const dropdown = document.getElementById("daysSelector");
    dropdown.onchange = () => {
        switch(dropdown.value){
            case '0':
                renderSite(0);
                break;
            case '1':
                updateSite(7, chartCases, chartIncidence);
                break;
            case '2':
                updateSite(30, chartCases, chartIncidence)
                break;
            case '3':
                updateSite(92, chartCases, chartIncidence);
                break;
            case '4':
                updateSite(182, chartCases, chartIncidence);
                break;
        }
    };

    renderSite(0);

    // const cases = await getDistricData('14511', 'cases');
    // const incidence = await getDistricData('14511', 'incidence');
    
    // drawData(
    //     document.getElementById('cases'),
    //     Array.from(cases, elements => elements.date), 
    //     Array.from(cases, element => element.cases)
    //     );

    // drawData(
    //     document.getElementById('incidence'), 
    //     Array.from(incidence, elements => elements.date), 
    //     Array.from(incidence, elements => elements.weekIncidence)
    //     );
});