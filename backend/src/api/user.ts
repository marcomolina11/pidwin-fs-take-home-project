import express from 'express';
import login from './user-login.js';
import signup from './user-signup.js';
import changePassword from './user-change-password.js';
import getCurrentUser from './user-current.js';
import auth from '../utils/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/signup', signup);
router.post('/changePassword', auth, changePassword);
router.get('/currentUser', auth, getCurrentUser);

export default router;
