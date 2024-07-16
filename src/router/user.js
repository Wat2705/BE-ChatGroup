import express from 'express'
import { changeName, logIn, logOut, register } from '../controller/user';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/login', logIn)
router.post('/register', register);
router.post('/logout', logOut)
router.post('/updatename', async (req, res, next) => {
    if (req.headers.authorization != undefined) {
        req.user = jwt.verify(req.headers.authorization, 'nodemy');
        next();
    } else res.status(400).json({ message: 'Token required' });
}, changeName)

export default router;