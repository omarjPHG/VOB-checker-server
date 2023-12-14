const Papa = require('papaparse');
const fs = require('fs');
const { db } = require('./Firebase');
const { collection, addDoc, query, onSnapshot, getDocs, update, updateDoc, where, doc } = require('firebase/firestore');


// Replace this with the path to your CSV file
const csvFiles = ['AffinityAuth.csv',
                    'AxisAuth.csv',
                    'BeachsideAuth.csv'];

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
                    const patientName = row['Patient Name'];
                    const loc = row['Loc'];
                    const policyNumber = row['Policy Number'];
                    const prefix = row['Prefix'];
                    const days = parseInt(row['No. Of Days'], 10) || 0;
    
                    if (!patients[patientName]) {
                        patients[patientName] = { Residential: 0, Detox: 0, policyNumber: policyNumber, prefix: prefix };
                    }
    
                    if (loc === 'Residential') {
                        patients[patientName].Residential += days;
                    } else if (loc === 'Detox') {
                        patients[patientName].Detox += days;
                    }
                });
    
                for (let patient in patients) {
                    updateFirebaseRecords(patients[patient]);
                }
            }
        });
    });
}


const updateFirebaseRecords = (patient) => {
    console.log(`patient: ${JSON.stringify(patient.policyNumber)}`);
    const collectionRef = collection(db, 'Historical-Info'); // Replace with your collection name
    const q = query(collectionRef, where('policyNumber', '==', patient.policyNumber))
    getDocs(q)
        .then(querySnapshot => {
            querySnapshot.forEach(doc => {
                allRecords.push({data: doc.data(), id: doc.id})
            });
            allRecords.forEach(record => {
                record.data.policyNumber === patient.policyNumber
                    ? updateRecord(record.id, patient)
                    : null
            })
        })
        .catch(error => {
            console.error("Error getting documents: ", error);
        });

};

const updateRecord = (docId, patient) => {
    const docRef = doc(db, 'Historical-Info', docId);
    updateDoc(docRef, {
        ResidentialDays: patient.Residential,
        DetoxDays: patient.Detox
    }).then(() => {
        console.log(`Record updated for policy number: ${patient.policyNumber}`);
    }).catch(error => {
        console.error(`Error updating document:`, error);
    });
}

// const checkRecord = () => {
//     const collectionRef = collection(db, 'Historical-Info'); // Replace with your collection name
//     const q = query(collectionRef, where('policyNumber', '==', "JWC397A54659"))
//     getDocs(q)
//         .then(querySnapshot => {
//             querySnapshot.forEach(doc => {
//                 console.log(doc.data())
//             });
//         })
//         .catch(error => {
//             console.error("Error getting documents: ", error);
//         });

// }

const processFiles = () => {
    csvFiles.map(file => {
        console.log(file)
        processDoc(`./${file}`);
    })
}

processFiles()