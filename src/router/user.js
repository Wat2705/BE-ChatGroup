import express from 'express'
import { logIn, register } from '../controller/user';

const router = express.Router();

router.post('/login', logIn)
router.post('/register', register);

export default router;