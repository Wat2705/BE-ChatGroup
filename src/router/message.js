import express from 'express'
import jwt from 'jsonwebtoken'
import Token from '../models/token';
import { getAll, sendMessage } from '../controller/message';

const router = express.Router();

router.post('/send', async (req, res, next) => {
    if (req.headers.authorization != undefined) {
        req.user = jwt.verify(req.headers.authorization, 'nodemy')
        if (await Token.findOne({ value: req.headers.authorization }) == null) {
            next()
        } else res.status(400).json({ message: 'Token không hợp lệ' })
    } else res.status(400).json({ message: 'Token required' })
}, sendMessage)

router.get('/all', getAll)

export default router;