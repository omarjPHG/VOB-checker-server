const { db } = require('../bin/utils/Firebase')
const { addDoc, collection, query, where, onSnapshot } = require('firebase/firestore')
const axios = require('axios')
const { exec } = require('child_process');

//  ssh -i ./digitalOcean root@24.144.87.113

const garyController = {
    post: (req, res) => {
        let docId
        const insuranceLoc = req.body.insuranceLoc 
        const insurancePrefix = req.body.insurancePrefix 
        const collectionRef = collection(db, 'CurrentInsurance')
        let q = query(collectionRef, 
            where('insuranceLoc', '==', insuranceLoc), 
            where('insurancePrefix', '==', insurancePrefix))
        onSnapshot(q, snapshot => {
            snapshot.docs.forEach(doc => {
                res.send({data: doc.data(), id: doc.id}).status(200)
            })
            res.send("Could not find matching insurance record").status(200)
        })
        res.send("completed").status(200)
    },
}

const interfaceController = {
    get: (req, res) => {
        const collectionRef = collection(db, 'CurrentInsurance')
        const q = query(collectionRef)
        onSnapshot(q, snapshot => {
            let customerList = []
            snapshot.docs.forEach(doc => {
                customerList.push({data: doc.data(), id: doc.id})
            })
            res.send(customerList).status(200)
        })
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
                    'dailyRate': dailyRate,
                    'lastUpdate': lastUpdate,
                    'evaluation': response.vob === null ? 'Unknown' : response.vob,
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
        exec(`python3 ./server/controller/evaluation.py ${prefix}`, (error, stdout, stderr) => {
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