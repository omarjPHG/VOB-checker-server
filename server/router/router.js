const router = require('express').Router()
const { garyController, dbLoading } = require('../controller/controller')

router.route('/db-search')
    .get(garyController.get)

router.route('/db-load')
    .post(dbLoading.post)

module.exports = router