const router = require('express').Router();
const ctrl = require('../controllers');

router.get('/test', ctrl.user.test)

router.post('/register', ctrl.user.register)

module.exports = router