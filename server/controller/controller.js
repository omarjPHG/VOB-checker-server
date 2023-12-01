const { db } = require('../bin/utils/Firebase')
const { addDoc, collection } = require('firebase/firestore')

const garyController = {
    get: (req, res) => {
        res.send('Gary Controller').status(200)
    }
}

const dbLoading = {
    post: (req, res) => {
        let insurance = req.body.insurance
        let prefix = req.body.prefix 
        let dailyRate = req.body.dailyRate 
        let lastUpdate = req.body.lastUpdate
        let validation = req.body.validation
        let collectionRef = collection(db, 'CurrentInsurance')
        addDoc(collectionRef, {
            'insuranceName': insurance,
            'insurancePrefix': prefix,
            'dailyRate': dailyRate,
            'lastUpdate': lastUpdate,
            'validation': validation
        })
        .then(response => {
            res.send(`Interface Added ${insurance} - ${prefix} - ${dailyRate} UPDATED: ${lastUpdate}`).status(200)
        })
        .catch(error => {
            res.send(`Error: ${error}`).status(400)
        })
    }
}

module.exports = {garyController, dbLoading}