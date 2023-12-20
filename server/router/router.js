const router = require('express').Router()
const { garyController, dbLoading, interfaceController, interfaceControllerHistorical, HistoricalBillingAddRecords } = require('../controller/controller')

router.route('/gary-search')
    .post(garyController.post)

router.route('/db-load')
    .post(dbLoading.post)

router.route('/interface')
    .get(interfaceController.get)

router.route('/interface-historical')
    .get(interfaceControllerHistorical.get)

router.route('/billing-details')
    .post(HistoricalBillingAddRecords.post)

module.exports = router