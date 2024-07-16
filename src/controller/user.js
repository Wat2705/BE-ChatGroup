import jwt from "jsonwebtoken";
import User from "../models/user";
import ConnectedUser from "../models/connectedUser";
import Token from '../models/token';

export const register = async (req, res) => {
    const existUser = await User.findOne({ email: req.body.email });
    if (existUser == null) {
        await User.create(req.body);
        res.status(200).json({ message: 'Đăng ký thành công!' })
    } else res.status(400).json({ message: 'Email đã tồn tại!' })
}

export const logIn = async (req, res) => {
    const existUser = await User.findOne({ email: req.body.email, password: req.body.password });
    const connectedUser = await ConnectedUser.findOne({ email: req.body.email });
    if (existUser != null) {
        if (connectedUser == null) {
            const token = jwt.sign({ id: existUser._id, email: existUser.email, name: existUser.name }, 'nodemy');
            await ConnectedUser.create({ user: existUser._id })
            res.status(200).json({
                id: existUser._id,
                user: existUser.name,
                token
            })
        } else res.status(400).json({ message: 'Tài khoản của bạn đã được đăng nhập ở 1 nơi khác!' })
    } else res.status(400).json({ message: 'Sai email hoặc mật khẩu!' })
}

export const logOut = async (req, res) => {
    if (await Token.findOne({ value: req.body.token }) == null) {
        await Token.create({ value: req.body.token })
    }
    res.status(200).json({ message: 'ok' })
}

export const changeName = async (req, res) => {
    await User.findByIdAndUpdate(req.user.id, { name: req.body.name })
    res.status(200).json({ message: 'ok' })
}