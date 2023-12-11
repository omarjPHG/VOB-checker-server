const axios = require('axios');
const Papa = require('papaparse');
const fs = require('fs');

const readCSV = (filePath) => {
  const file = fs.readFileSync(filePath, 'utf8');
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        resolve(results.data);
      }
    });
  });
};

// Function to make an Axios POST request for each row
const makeRequests = (data) => {
  data.forEach(row => {

    // Prepare data for Axios request
    const requestData = {
      insuranceName: row['Insurance Company'],
      insuranceLoc: row['LOC'],
      insurancePrefix: row['BCBS Prefix'],
      dailyRate: row['Avg Daily Rate'],
      lastUpdate: row['Last Paid']
    };

    console.log(requestData)

    // Make Axios POST request
    axios.post('http://localhost:3010/api/v1/db-load', requestData)
      .then(response => console.log('Data sent successfully:', response.data))
      .catch(error => console.error('Error sending data:', error));
  });
};

// Main function to process the CSV file
const processCSV = async (filePath) => {
  const data = await readCSV(filePath);
  makeRequests(data);
};

processCSV('./Zoho.csv');