import express from 'express';
import login from '../api/user-login.js';
import signup from '../api/user-signup.js';
import changePassword from '../api/user-change-password.js';
import getCurrentUser from '../api/user-current.js';
import auth from '../utils/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/signup', signup);
router.post('/changePassword', auth, changePassword);
router.get('/currentUser', auth, getCurrentUser);

export default router;
