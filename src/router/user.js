import express from 'express';
import { changeName, logIn, logOut, register } from '../controller/user';
import jwt from 'jsonwebtoken';
import User from '../models/user';

const router = express.Router();

router.post('/login', logIn);
router.post('/register', register);
router.post('/logout', logOut);
router.post('/updatename', async (req, res, next) => {
  if (req.headers.authorization != undefined) {
    try {
      req.user = jwt.verify(req.headers.authorization, 'nodemy');
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  } else {
    return res.status(400).json({ message: 'Token required' });
  }
}, changeName);

router.get('/verify-token', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, 'nodemy');
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'Token valid', user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    console.error('Token verification error:', err.message);
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;