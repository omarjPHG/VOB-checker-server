const { db } = require('../bin/utils/Firebase')
const { addDoc, collection, query, where, onSnapshot } = require('firebase/firestore')

const addCustomer = (customerName, insurances, res) => {
    const collectionCustomerRef = collection(db, 'Customers')
    addDoc(collectionCustomerRef, {
        'customerName':customerName,
        'insurance': insurances
    })
    .then(response => {
        res.send('User Information Was Inputted Into Database').status(200)
    })
    .catch(error => {
        console.error(error)
        res.send(`Error: ${error}`).status(400)
    })
}

const garyController = {
    post: (req, res) => {
        const customerName = req.body.customerName
        const insurnaceName = req.body.insuranceName 
        const insurancePrefix = req.body.insurancePrefix 
        const collectionRef = collection(db, 'CurrentInsurance')
        let q = query(collectionRef, 
            where('insuranceName', '==', insurnaceName), 
            where('insurancePrefix', '==', insurancePrefix))
        onSnapshot(q, snapshot => {
            const insurances = []
            snapshot.docs.forEach(doc => {
                console.log(doc.data())
                insurances.push(doc.data())
            })
            insurances.length === 1
                ? addCustomer(customerName, insurances, res)
                : null
        })
    }
}

const interfaceController = {

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