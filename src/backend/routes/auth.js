const express = require('express');
const router = express.Router();
const { register, login,activateAccount,forgotPassword,changePassword } = require('../Controller/auth');


router.get('/verify/:token', activateAccount);

router.post('/register', register);
router.post('/login', login);


router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:id/:token', changePassword);

module.exports = router;
