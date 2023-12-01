const router = require('express').Router()
const { garyController, dbLoading } = require('../controller/controller')

router.route('/gary-search')
    .post(garyController.post)

router.route('/db-load')
    .post(dbLoading.post)

module.exports = router