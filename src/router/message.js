import express from 'express'
import jwt from 'jsonwebtoken'
import { getAll, sendMessage } from '../controller/message';

const router = express.Router();

router.post('/send', async (req, res, next) => {
    if (req.headers.authorization != undefined) {
        req.user = jwt.verify(req.headers.authorization, 'nodemy')
        next()
    } else res.status(400).json({ message: 'Token required' })
}, sendMessage)

router.get('/all', getAll)

export default router;