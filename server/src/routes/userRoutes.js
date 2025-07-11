import express from 'express';
import { allUsers, deleteUser, getUserProfile, login, registerUser, updateUser } from '../controllers/userController.js';
import verifyToken from '../middleware/verifyToken.js';

const userRouter = express.Router();

userRouter.post('/register',registerUser)
userRouter.post('/login',login)
userRouter.get('/userprofile',verifyToken, getUserProfile)
userRouter.delete('/deleteuser',deleteUser)
userRouter.get('/users',allUsers)
userRouter.patch('/udpateuser', verifyToken,updateUser)

export default userRouter;

