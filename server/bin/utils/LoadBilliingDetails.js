const Papa = require('papaparse');
const fs = require('fs');
const { db } = require('./Firebase');
const { collection, addDoc, query, onSnapshot, getDocs, update, updateDoc, where, doc } = require('firebase/firestore');


// Replace this with the path to your CSV file
const csvFiles = ['AffinityClaims.csv',
                    'AxisClaims.csv',
                    'BeachsideClaims.csv'];

// const csvFiles = ['AffinityClaims.csv'];

let patients = {};
let allRecords = [];

const processDoc = (filePath) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the CSV file:', err);
            return;
        }
    
        Papa.parse(data, {
            header: true,
            complete: (results) => {
                results.data.forEach(row => {
                    const claimState = row['Claim State'];
                    const datesPaid = row['Date(s) Paid'];
                    const datePaid = new Date(datesPaid);

                    if (claimState === 'Closed') {
                        const patientName = row['Policy Number'];
                        if (!patients[patientName]) {
                            patients[patientName] = {
                                totalCharges: 0,
                                totalPaid: 0,
                                insuranceCompany: row['Insurance Company'],
                                policyNumber: row['Policy Number'],
                                prefix: row['Prefix'],
                                facility: row['Facility'],
                                adminStatus: row['Claim State'],
                                patientName: patientName
                            };
                        }
    
                        let currentCharge = row['Charges']
                        let currentPiad = row['Paid to Facility']
    
                        // console.log('current charnge: ', row['Charges'])
                        // console.log('current paid type: ',  row['Paid to Facility'])
        
                        patients[patientName].totalCharges += parseFloat(currentCharge.replace(/\$|,/g, '') || 0);
                        patients[patientName].totalPaid += parseFloat(currentPiad.replace(/\$|,/g, '') || 0);
    
                        if(row['Insurance Company'].includes('BC/BS') ||
                            row['Insurance Company'].includes('BCBS') ||
                            row['Insurance Company'].includes('Blue Cross') ||
                            row['Insurance Company'].includes('Blue Sheild') ||
                            row['Insurance Company'].includes('CIGNA') || 
                            row['Insurance Company'].includes('Humana') ) {
                                patients[patientName].network = 'In-Network'
                            } else {
                                patients[patientName].network = 'Out-Network'
                            }
                    }
                });

                console.log(Object.keys(patients).length)

                Object.keys(patients).forEach(patientName => {
                    const patient = patients[patientName];
                    patient.payoutRatio = (patient.totalPaid / patient.totalCharges).toFixed(2);

                    if(patient['patientName'] === ''){
                        console.log('no-name')
                    } else {
                        let docData = {
                            'totalCharges': patient['totalCharges'].toFixed(2),
                            'totalPaid': patient['totalPaid'].toFixed(2),
                            'insuranceCompany': patient['insuranceCompany'],
                            'policyNumber': patient['policyNumber'],
                            'prefix': patient['prefix'],
                            'facility': patient['facility'],
                            'patientName': patient['patientName'],
                            'network': patient['network'],
                            'payoutRatio': patient['payoutRatio'],
                            'claimStatus': patient['adminStatus'],
                            'dateAdded': new Date()
                        }
                        let collectionRef = collection(db, 'BillingDetails')
                        addDoc(collectionRef, docData)
                            .then(response => {
                                console.log(`New record added for ${patient['patientName']}`)
                            })
                            .catch(error => {
                                console.log(`Error: ${error}`)
                            })
                    }

                });
            }
        });
    });
}


const processFiles = () => {
    csvFiles.map(file => {
        console.log(file)
        processDoc(`./${file}`);
    })
}

processFiles()