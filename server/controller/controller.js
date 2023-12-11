const { db } = require('../bin/utils/Firebase')
const { addDoc, collection, query, where, onSnapshot, orderBy } = require('firebase/firestore')
const axios = require('axios')
const { exec } = require('child_process');

//  ssh -i ./digitalOcean root@24.144.87.113

const garyController = {
    post: (req, res) => {
        let insurancePrefix = req.body.insurancePrefix 
        if(insurancePrefix.length > 3){
            if(insurancePrefix.includes(': ')){
                let splitInsurance = insurancePrefix.split(': ')
                insurancePrefix = splitInsurance[1].substring(0, 3)
            } else {
                insurancePrefix = insurancePrefix.substring(0, 3)
            }
        }
        console.log(insurancePrefix)
        const collectionRef = collection(db, 'CurrentInsurance')
        let q = query(collectionRef, 
            where('insurancePrefix', '==', insurancePrefix))
        let results = [];
        onSnapshot(q, snapshot => {
            snapshot.docs.forEach(doc => {
                results.push({data: doc.data(), id: doc.id});
            });

            if (results.length > 0) {
                res.status(200).send(results);
            } else {
                res.status(200).send(`Could not find matching insurance record with the prefix ${insurancePrefix}`);
            }
        });
    },
}

const interfaceController = {
    get: (req, res) => {
        let queryRef;
        if(req.query.sort){
            if(req.query.insurancePrefix){
                console.log('sort found and prefix found');
                queryRef = query(collection(db, 'CurrentInsurance'), where('insurancePrefix', '==', req.query.insurancePrefix),orderBy(req.query.sort));
            } else if (req.query.insuranceLoc) {
                console.log('sort found and loc found');
                queryRef = query(collection(db, 'CurrentInsurance'), where('insuranceLoc', '==', req.query.insuranceLoc),orderBy(req.query.sort));
            } else if (req.query.insuranceName){
                console.log('sort found and name found');
                queryRef = query(collection(db, 'CurrentInsurance'), where('insuranceName', '==', req.query.insuranceName),orderBy(req.query.sort));
            } else {
                console.log('sort found and no specific query, fetching all');
                queryRef = query(collection(db, 'CurrentInsurance'),orderBy(req.query.sort));
            }
        } else {
            if(req.query.insurancePrefix){
                console.log('prefix found');
                queryRef = query(collection(db, 'CurrentInsurance'), where('insurancePrefix', '==', req.query.insurancePrefix));
            } else if (req.query.insuranceLoc) {
                console.log('loc found');
                queryRef = query(collection(db, 'CurrentInsurance'), where('insuranceLoc', '==', req.query.insuranceLoc));
            } else if (req.query.insuranceName){
                console.log('name found');
                queryRef = query(collection(db, 'CurrentInsurance'), where('insuranceName', '==', req.query.insuranceName));
            } else {
                console.log('no specific query, fetching all');
                queryRef = query(collection(db, 'CurrentInsurance'));
            }
        }
    
        onSnapshot(queryRef, snapshot => {
            let customerList = [];
            snapshot.docs.forEach(doc => {
                customerList.push({data: doc.data(), id: doc.id});
            });
            res.send(customerList).status(200);
        });
    },
    update: (req, res) => {

    }
}

const dbLoading = {
    post: (req, res) => {
        let insuranceName = req.body.insuranceName
        let insuranceLoc = req.body.insuranceLoc
        let insurancePrefix = req.body.insurancePrefix 
        let dailyRate = req.body.dailyRate 
        let lastUpdate = req.body.lastUpdate
        runPythonScript(insurancePrefix)
            .then(response => {
                // res.send(`Interface Added${JSON.stringify(response)}`).status(200)
                let docData = {
                    'insuranceName': insuranceName,
                    'insuranceLoc': insuranceLoc,
                    'insurancePrefix': insurancePrefix,
                    'dailyRate': parseFloat(dailyRate.replace(/[^0-9.]/g, '')),
                    'lastUpdate': new Date(lastUpdate),
                    'vob': response.vob === null ? 'Unknown' : response.vob,
                    'admitted': response.admitted === null ? 'Unknown' : response.vob,
                    'callInDate': new Date()
                }
                let collectionRef = collection(db, 'CurrentInsurance')
                addDoc(collectionRef, docData)
                    .then(response => {
                        res.send(`Interface Added${insuranceName} / ${insurancePrefix}`).status(200)
                    })
                    .catch(error => {
                        res.send(`Error: ${error}`).status(400)
                    })
                
            })
            .catch(error => {
                console.error(`there was an error getting a response: `, error)
            })
    }
}

const runPythonScript = (prefix) => {
    console.log('Sending python request')
    return new Promise((resolve, reject) => {
        exec(`python ./server/controller/evaluation.py ${prefix}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                reject(error);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                reject(stderr);
                return;
            }
            resolve(extractJsonObject(stdout));
        });
    });
};

function extractJsonObject(responseString) {
    // Regular expression to find JSON object
    const jsonRegex = /```json\s+({.*?})\s+```/s;

    // Using the regular expression to extract the JSON string

    const match = responseString.match(jsonRegex);

    if (match && match[1]) {
        // Parsing the JSON string to an actual JSON object
        try {
            return JSON.parse(match[1]);
        } catch (error) {
            console.error('Failed to parse JSON:', error);
        }
    } else {
        console.log('No JSON object found in the response string.');
    }

    return null;
}

module.exports = {garyController, dbLoading, interfaceController}