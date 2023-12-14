const Papa = require('papaparse');
const fs = require('fs');
const { collection, addDoc, query, onSnapshot, getDocs } = require('firebase/firestore');
const { db } = require('./Firebase');

const csvFiles = [
    'AffinityClaim.csv',
    'BeachSideClaim2.csv',
    'AxisClaim2.csv'
]

const readCSV = (filePath) => {
    fs.readFile(filePath, 'utf8', function (err, data) {
        if (err) {
            console.error('Error reading the CSV file', err);
            return;
        }
    
        Papa.parse(data, {
            header: true,
            complete: function (results) {
                const patients = {};
    
                results.data.forEach(row => {
                    const patientName = row['Patient Name'];
                    if (!patients[patientName]) {
                        patients[patientName] = {
                            totalCharges: 0,
                            totalPaid: 0,
                            insuranceCompany: row['Insurance Company'],
                            policyNumber: row['Policy Number'],
                            prefix: row['Prefix'],
                            facility: row['Facility'],
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

                });

                
                Object.keys(patients).forEach(patientName => {
                    const patient = patients[patientName];
                    patient.payoutRatio = (patient.totalPaid / patient.totalCharges).toFixed(2);
                });

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
                            'dateAdded': new Date()
                        }
                        let collectionRef = collection(db, 'Historical-Info')
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
};

const checkRecordCount = () => {
    let collectionRef = collection(db, 'Historical-Info')

    getDocs(collectionRef)
    .then((querySnapshot) => {
        console.log(`Number of records retrieved: ${querySnapshot.size}`);
    }).catch((error) => {
        console.error("Error getting documents: ", error);
    });
}


const processFiles = () => {
    csvFiles.map(file => {
        console.log(file)
        readCSV(`./${file}`);
    })
}

// processFiles()
checkRecordCount()