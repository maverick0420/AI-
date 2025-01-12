const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

router.post('/register', UserController.register);
router.post('/login', UserController.login);

router.put('/profile', auth, UserController.updateProfile);
router.put('/change-password', auth, UserController.changePassword);

module.exports = router; 