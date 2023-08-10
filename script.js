$(document).ready(function () {
    let data = []; // To store loaded CSV data

    $('#fileInput').on('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const content = e.target.result;
                data = parseCSV(content);
                console.log(data);
            };
            reader.readAsText(file);
        }
    });

    $('#calculateButton').on('click', function () {
        if (data.length > 0) {
            calculateCommonPeriods(data);
        }
    });

    function parseCSV(content) {
        const lines = content.split('\n');
        const parsedData = [];
        for (const line of lines) {
            const [empID, projectID, dateFrom, dateTo] = line.split(', ');
            parsedData.push({
                empID: parseInt(empID),
                projectID: parseInt(projectID),
                dateFrom: new Date(dateFrom),
                dateTo: dateTo === 'NULL' ? new Date() : new Date(dateTo),
            });
        }
        return parsedData;
    }

    function calculateDaysWorked(fromDate, toDate) {
        const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
        return Math.round(Math.abs((toDate - fromDate) / oneDay));
    }

    function calculateCommonPeriods(data) {
        const commonPeriods = {}; // To store common periods between pairs

        for (const entry of data) {
            const empID = entry.empID;
            const projectID = entry.projectID;
            const from = entry.dateFrom;
            const to = entry.dateTo;

            if (!commonPeriods[projectID]) {
                commonPeriods[projectID] = [];
            }

            commonPeriods[projectID].push({ empID, from, to });
        }

        displayCommonPeriods(commonPeriods);
    }

    function displayCommonPeriods(commonPeriods) {
        const tableBody = $('#resultsTable tbody');
        tableBody.empty();
    
        const results = [];
    
        for (const projectID in commonPeriods) {
            const pairs = commonPeriods[projectID];
            if (pairs.length >= 2) {
                for (let i = 0; i < pairs.length - 1; i++) {
                    for (let j = i + 1; j < pairs.length; j++) {
                        const empID1 = pairs[i].empID;
                        const empID2 = pairs[j].empID;
    
                        const overlappingFrom = pairs[i].from < pairs[j].from ? pairs[j].from : pairs[i].from;
                        const overlappingTo = pairs[i].to < pairs[j].to ? pairs[i].to : pairs[j].to;
    
                        if (overlappingFrom <= overlappingTo) {
                            const daysWorked = calculateDaysWorked(overlappingFrom, overlappingTo);
    
                            results.push({
                                empID1,
                                empID2,
                                projectID,
                                daysWorked
                            });
                        }
                    }
                }
            }
        }
    
        // Sort the results in decreasing order by days worked
        results.sort((a, b) => b.daysWorked - a.daysWorked);
    
        // Append sorted results to the table
        for (const result of results) {
            const row = `<tr>
                            <td>${result.empID1}</td>
                            <td>${result.empID2}</td>
                            <td>${result.projectID}</td>
                            <td>${result.daysWorked}</td>
                         </tr>`;
            tableBody.append(row);
        }
    }    
});

