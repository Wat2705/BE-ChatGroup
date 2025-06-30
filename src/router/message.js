import express from 'express';
import jwt from 'jsonwebtoken';
import Token from '../models/token';
import { getAll, sendMessage } from '../controller/message';

const router = express.Router();

router.post('/send', async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(400).json({ message: 'Token required' });
  }

  const token = authHeader.split(' ')[1]; // Lấy phần token sau "Bearer "
  if (!token) {
    return res.status(400).json({ message: 'Invalid token format' });
  }

  try {
    const decoded = jwt.verify(token, 'nodemy');
    req.user = decoded; // Gán user decoded vào req
    const existingToken = await Token.findOne({ value: token });
    if (existingToken) {
      return res.status(400).json({ message: 'Token không hợp lệ' });
    }
    next(); // Cho phép tiếp tục nếu token hợp lệ và chưa tồn tại
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}, sendMessage);

router.get('/all', async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Token required' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(400).json({ message: 'Invalid token format' });
  }

  try {
    jwt.verify(token, 'nodemy');
    next(); // Chuyển sang getAll nếu token hợp lệ
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}, getAll);

export default router;