import jwt from "jsonwebtoken";
import User from "../models/user"
import ConnectedUser from "../models/connectedUser"

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