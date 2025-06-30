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
  const token = req.body.token;
  if (!token) {
    return res.status(400).json({ message: 'Token required' });
  }

  try {
    const decoded = jwt.verify(token, 'nodemy');
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    await ConnectedUser.findOneAndDelete({ user: user._id });

    await Token.create({ value: token });

    res.status(200).json({ message: 'Đăng xuất thành công' });
  } catch (err) {
    console.error('Logout error:', err.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const changeName = async (req, res) => {
    await User.findByIdAndUpdate(req.user.id, { name: req.body.name })
    res.status(200).json({ message: 'ok' })
}