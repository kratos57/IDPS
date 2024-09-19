const express = require('express');
const router = express.Router();
; // Admin check middleware
const admin = require('../Controller/admin');

// Define routes with admin check middleware only
router.get('/users',  admin.getAllUsers);
router.post('/users',  admin.addUser);
router.put('/users/:id',  admin.updateUser);
router.delete('/users/:id',  admin.deleteUser);

module.exports = router;
