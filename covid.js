"use strict";
let caseData;
let incidenceData;

const getDistricData = async (district, type, days = 0) => {
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

        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        min: 0
                    }
                }],
                xAxes: [{
                    type: 'time',
                    time: {
                        displayFormats: {
                            second: 'MMM d',
                            minute: 'MMM d',
                            hour: 'MMM d',
                        }
                    }
                }]
            },
            animation: false,
        }
        });
    return chart;
}

let chartCases,chartIncidence;

const renderSite = async (days) => {
    chartCases = drawData(
        document.getElementById('cases'),
        Array.from(caseData, elements => elements.date), 
        Array.from(caseData, element => element.cases)
        );

    chartIncidence = drawData(
        document.getElementById('incidence'), 
        Array.from(incidenceData, elements => elements.date), 
        Array.from(incidenceData, elements => elements.weekIncidence)
        );
}

const updateSite = async (days) => {
    const cases = caseData.slice(caseData.length - days, caseData.length);
    const incidences = incidenceData.slice(incidenceData.length - days, incidenceData.length);
    
    chartCases.data.labels.length = 0;
    chartCases.data.labels = Array.from(cases, elements => elements.date);
    chartCases.data.datasets[0].data.length = 0;
    chartCases.data.datasets[0].data = Array.from(cases, elements => elements.cases);

    chartCases.update();

    chartIncidence.data.labels.length = 0;
    chartIncidence.data.labels = Array.from(incidences, elements => elements.date);
    chartIncidence.data.datasets[0].data.length = 0;
    chartIncidence.data.datasets[0].data = Array.from(incidences, elements => elements.weekIncidence);

    chartIncidence.update();
}

document.addEventListener('DOMContentLoaded', async (event) => {
    caseData = await getDistricData('14511', 'cases');
    incidenceData = await getDistricData('14511', 'incidence');

    const dropdown = document.getElementById("daysSelector");
    dropdown.onchange = () => {
        switch(dropdown.value){
            case '0':
                renderSite(0);
                break;
            case '1':
                updateSite(7);
                break;
            case '2':
                updateSite(30)
                break;
            case '3':
                updateSite(92);
                break;
            case '4':
                updateSite(182);
                break;
        }
    };

    renderSite(0);
});