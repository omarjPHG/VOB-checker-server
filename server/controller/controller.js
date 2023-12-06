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
        const question = `based on provided information, is '${insurancePrefix}' considered to be VOB good? if there are different instances, decide based on most instances. explain your reasoning step-by-step`;
        const collectionRef = collection(db, 'CurrentInsurance')
        let q = query(collectionRef, 
            where('insuranceLoc', '==', insuranceLoc), 
            where('insurancePrefix', '==', insurancePrefix))
        onSnapshot(q, snapshot => {
            const insurances = []
            snapshot.docs.forEach(doc => {
                insurances.push(doc.data())
                docId = doc.id
            })
        })
        runAssistant(question)
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
        let evaluationType
        let insuranceName = req.body.insuranceName
        let insuranceLoc = req.body.insuranceLoc
        let insurancePrefix = req.body.insurancePrefix 
        let dailyRate = req.body.dailyRate 
        let lastUpdate = req.body.lastUpdate
        runPythonScript(insurancePrefix)
            .then(response => {
                console.log(`python3 script response: ${response}`)
                response.includes("Yes")
                    ? evaluationType = 'Yes'
                    : response.includes("No")
                        ? evaluationType = 'Yes'
                        : response.includes("persistent technical issue")
                            ? runPythonScript(insurancePrefix)
                            : evaluationType = 'Unknown'
                let collectionRef = collection(db, 'CurrentInsurance')
                addDoc(collectionRef, {
                    'insuranceName': insuranceName,
                    'insuranceLoc': insuranceLoc,
                    'insurancePrefix': insurancePrefix,
                    'dailyRate': dailyRate,
                    'lastUpdate': lastUpdate,
                    'evaluation': evaluationType,
                    'callInDate': new Date()
                })
                .then(response => {
                    res.send(`Interface Added ${insuranceLoc} - ${insurancePrefix} - ${evaluationType}`).status(200)
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
            resolve(stdout);
        });
    });
};

module.exports = {garyController, dbLoading, interfaceController}