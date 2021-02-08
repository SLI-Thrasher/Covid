"use strict";
let caseData;
let incidenceData;

const getDistrictData = async (district, type, days = 0) => {
    let response;
    if (days === 0)
        response = await fetch(`https://api.corona-zahlen.org/districts/${district}/history/${type}`, {cache: "force-cache"});
    else
        response = await fetch(`https://api.corona-zahlen.org/districts/${district}/history/${type}/${days}, {cache: "force-cache"}`);

    const json = await response.json(); //extract JSON from the http response
    // console.log(json);
    // console.log(json.data[district].history);

    return json.data[district].history;
}

const getAllData = async () => {
    const caseResponse = await (await fetch(`https://api.corona-zahlen.org/districts/history/cases/7`, {cache: "force-cache"})).json();
    const incidenceResponse = await (await fetch(`https://api.corona-zahlen.org/districts/history/incidence/7`, {cache: "force-cache"})).json();
    // Promise.all()
    let districts = new Map();
    for(var district in caseResponse.data){
        let name = caseResponse.data[district].name;
        if( name.startsWith('LK') || name.startsWith('SK'))
             name = name.slice(3);
        districts.set(district, {
                        name: name, 
                        cases: caseResponse.data[district].history,
                        incidences: incidenceResponse.data[district].history,
                        });
    }
    
    return districts;
}

const drawData = (canvas, districtName, labels, data) => {
    var ctx = canvas.getContext('2d');
    var chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',

        // The data for our dataset
        data: {
            labels: labels,
            datasets: [{
                label: `${districtName}`,
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

let dataForAllDistricts;
let chartCases,chartIncidence;
let startDateElement, endDateElement;
let dropdown;
let regionSelector;

const renderSite = async (days) => {
    chartCases = drawData(
        document.getElementById('cases'),
        'Chemnitz',
        Array.from(caseData, elements => elements.date), 
        Array.from(caseData, element => element.cases)
        );

    chartIncidence = drawData(
        document.getElementById('incidence'),
        'Chemnitz', 
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

const updateSiteWithRange = (start, end, district) => {
    const districtData = dataForAllDistricts.get(district);
    const caseData = districtData.cases;
    const incidenceData = districtData.incidences;
    const cases = caseData.filter(element => moment(element.date).isAfter(start) && moment(element.date).isBefore(end));
    const incidences = incidenceData.filter(element => moment(element.date).isAfter(start) && moment(element.date).isBefore(end));

    chartCases.data.labels.length = 0;
    chartCases.data.labels = Array.from(cases, elements => elements.date);
    chartCases.data.datasets[0].data.length = 0;
    chartCases.data.datasets[0].data = Array.from(cases, elements => elements.cases);
    chartCases.data.datasets[0].label = districtData.name;

    chartCases.update();

    chartIncidence.data.labels.length = 0;
    chartIncidence.data.labels = Array.from(incidences, elements => elements.date);
    chartIncidence.data.datasets[0].data.length = 0;
    chartIncidence.data.datasets[0].data = Array.from(incidences, elements => elements.weekIncidence);
    chartIncidence.data.datasets[0].label = districtData.name;

    chartIncidence.update();
}

const dateChanged = () => {
    let start = startDateElement.value;
    let end = endDateElement.value;
    if ( end < start){
        startDateElement.value = end;
        endDateElement.value = start;
        start = startDateElement.value;
        end = endDateElement.value;
    }
    dropdown.value = '0';
    console.log(`Start ${start} Ende ${end}`);

    updateSiteWithRange(start, end, regionSelector.value);
}

const dateRangeChanged = () => {
    let startDate;
    switch(dropdown.value){
        case '0':
            break;
        case '1':
            startDate = moment().subtract(7, 'days');
            break;
        case '2':
            startDate = moment().subtract(1, 'months');
            break;
        case '3':
            startDate = moment().subtract(3, 'months');
            break;
        case '4':
            startDate = moment().subtract(6, 'months');
            break;
        case '5':
            startDate = moment('2020-01-01');
            break;
    }

    startDateElement.value = startDate.format('YYYY-MM-DD');
    updateSiteWithRange(startDateElement.value, endDateElement.value, regionSelector.value);
}

const regionChanged = () => {
    console.log(regionSelector.value);

    updateSiteWithRange(startDateElement.value, endDateElement.value, regionSelector.value);
}

document.addEventListener('DOMContentLoaded', async (event) => {
    caseData = await getDistrictData('14511', 'cases');
    incidenceData = await getDistrictData('14511', 'incidence');

    startDateElement = document.getElementById('start');
    startDateElement.setAttribute('min', moment(caseData[0].date).format('YYYY-MM-DD'));
    startDateElement.setAttribute('max', moment(caseData[caseData.length-1].date).format('YYYY-MM-DD'));
    startDateElement.setAttribute('value', moment(caseData[0].date).format('YYYY-MM-DD'));
    startDateElement.addEventListener('change', dateChanged)
    
    endDateElement = document.getElementById('end');
    endDateElement.setAttribute('min', moment(caseData[0].date).format('YYYY-MM-DD'));;
    endDateElement.setAttribute('max', moment(caseData[caseData.length-1].date).format('YYYY-MM-DD'));
    endDateElement.setAttribute('value', moment(caseData[caseData.length-1].date).format('YYYY-MM-DD'));
    endDateElement.addEventListener('change', dateChanged);

    regionSelector = document.getElementById('regionSelect');
    regionSelector.addEventListener('change', regionChanged);

    dropdown = document.getElementById("daysSelector");
    dropdown.addEventListener('change', dateRangeChanged);

    renderSite(0);

    getAllData()
        .then(map => {
            dataForAllDistricts = map;
            const data = Array
                .from(map, element => { return {district: element[0], name: element[1].name}})
                .sort((a, b) => a.name.localeCompare(b.name));
            data.forEach((value) => { 
                const option = document.createElement('option');
                option.value = value.district;
                option.text = value.name;
                regionSelector.add(option);
            })
            regionSelector.value = '14511';
            dataForAllDistricts.forEach((_data, district) => {
                updateDistrictMap(district);
            })
        })
        .catch(reason => console.log(reason));
});

const updateDistrictMap = (district) =>
{
    let caseData, incidenceData;
    Promise.all([getDistrictData(district, 'cases'), getDistrictData(district, 'incidence')])
        .then(values => {
            caseData = values[0];
            incidenceData = values[1];

            const name = dataForAllDistricts.get(district).name;
            dataForAllDistricts.set(district, {
                name: name, 
                cases: caseData,
                incidences: incidenceData,
                });
        })
        .catch(error => {
            console.log(error);
        })
}