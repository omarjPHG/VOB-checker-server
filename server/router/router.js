const router = require('express').Router()
const { garyController, dbLoading, interfaceController } = require('../controller/controller')

router.route('/gary-search')
    .post(garyController.post)

router.route('/db-load')
    .post(dbLoading.post)

router.route('/interface')
    .get(interfaceController.get)

module.exports = router