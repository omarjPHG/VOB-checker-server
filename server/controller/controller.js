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
        const insuranceLoc = req.body.insuranceLoc 
        const insurancePrefix = req.body.insurancePrefix 
        const collectionRef = collection(db, 'CurrentInsurance')
        let q = query(collectionRef, 
            where('insuranceLoc', '==', insuranceLoc), 
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
    get: (req, res) => {
        const collectionRef = collection(db, 'Customers')
        const q = query(collectionRef)
        onSnapshot(q, snapshot => {
            let customerList = []
            snapshot.docs.forEach(doc => {
                customerList.push(doc.data())
            })
            console.log(customerList)
            res.send(customerList).status(200)
        })
    }
}

const dbLoading = {
    post: (req, res) => {
        let insuranceLoc = req.body.insuranceLoc
        let prefix = req.body.prefix 
        let dailyRate = req.body.dailyRate 
        let lastUpdate = req.body.lastUpdate
        let evaluation = req.body.evaluation
        let collectionRef = collection(db, 'CurrentInsurance')
        addDoc(collectionRef, {
            'insuranceLoc': insuranceLoc,
            'insurancePrefix': prefix,
            'dailyRate': dailyRate,
            'lastUpdate': lastUpdate,
            'evaluation': evaluation,
            'callInDate': new Date()
        })
        .then(response => {
            res.send(`Interface Added ${loc} - ${prefix} - ${dailyRate} UPDATED: ${lastUpdate}`).status(200)
        })
        .catch(error => {
            res.send(`Error: ${error}`).status(400)
        })
    }
}

module.exports = {garyController, dbLoading, interfaceController}