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
                            second: 'MMM D',
                            minute: 'MMM D',
                            hour: 'MMM D',
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
let startDateElement, endDateElement;
let dropdown;

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
    const cases = caseData.slice(days == 0 ? 0 : caseData.length - days, caseData.length);
    const incidences = incidenceData.slice(days == 0 ? 0 : incidenceData.length - days, incidenceData.length);
    
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

const updateSiteWithRange = (start, end) => {
    const cases = caseData.filter(element => moment(element.date).isAfter(start) && moment(element.date).isBefore(end));
    const incidences = incidenceData.filter(element => moment(element.date).isAfter(start) && moment(element.date).isBefore(end));

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

const dateChanged = () => {
    const start = startDateElement.value;
    const end = endDateElement.value;
    dropdown.value = '0';
    console.log(`Start ${start} Ende ${end}`);

    updateSiteWithRange(start, end);
}

const dateRangeChanged = () => {
    switch(dropdown.value){
        case '0':
            break;
        case '1':
            updateSite(7);
            startDateElement.value = moment(caseData[caseData.length-1].date).subtract(6, 'days').format('YYYY-MM-DD');
            break;
        case '2':
            updateSite(30);
            startDateElement.value = moment(caseData[caseData.length-1].date).subtract(29, 'days').format('YYYY-MM-DD');
            break;
        case '3':
            updateSite(92);
            startDateElement.value = moment(caseData[caseData.length-1].date).subtract(91, 'days').format('YYYY-MM-DD');
            break;
        case '4':
            updateSite(182);
            startDateElement.value = moment(caseData[caseData.length-1].date).subtract(181, 'days').format('YYYY-MM-DD');
            break;
        case '5':
            updateSite(0);
            startDateElement.value = caseData[0].date.slice(0, 10);
            break;
    }
}

document.addEventListener('DOMContentLoaded', async (event) => {
    caseData = await getDistricData('14511', 'cases');
    incidenceData = await getDistricData('14511', 'incidence');

    startDateElement = document.getElementById('start');
    startDateElement.setAttribute('min', caseData[0].date.slice(0, 10));
    startDateElement.setAttribute('max', caseData[caseData.length-1].date.slice(0, 10));
    startDateElement.setAttribute('value', caseData[0].date.slice(0, 10));
    startDateElement.addEventListener('change', dateChanged)
    
    endDateElement = document.getElementById('end');
    endDateElement.setAttribute('min', caseData[0].date.slice(0, 10));
    endDateElement.setAttribute('max', caseData[caseData.length-1].date.slice(0, 10));
    endDateElement.setAttribute('value', caseData[caseData.length-1].date.slice(0, 10));
    endDateElement.addEventListener('change', dateChanged);


    dropdown = document.getElementById("daysSelector");
    dropdown.addEventListener('change', dateRangeChanged);
    //  = () => {
    //     switch(dropdown.value){
    //         case '0':
    //             updateSite(0);
    //             break;
    //         case '1':
    //             updateSite(7);
    //             break;
    //         case '2':
    //             updateSite(30)
    //             break;
    //         case '3':
    //             updateSite(92);
    //             break;
    //         case '4':
    //             updateSite(182);
    //             break;
    //     }
    // };

    renderSite(0);
});