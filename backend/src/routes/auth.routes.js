import express from 'express';
const authRouter = express.Router();
import { register, login, getMe, logout, updateDetails, updatePassword, forgotPassword, resetPassword } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.get('/me', protect, getMe);
authRouter.get('/logout', logout);
authRouter.put('/updatedetails', protect, updateDetails);
authRouter.put('/updatepassword', protect, updatePassword);
authRouter.post('/forgotpassword', forgotPassword);
authRouter.put('/resetpassword/:resettoken', resetPassword);

export default authRouter;
