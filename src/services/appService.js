import ConnectedUser from "../models/connectedUser";
import User from "../models/user";
import jwt from 'jsonwebtoken';

export const IoServiceChat = (io) => {
  io.use(async (socket, next) => {
    if (socket.handshake.query && socket.handshake.query.token) {
      try {
        const decoded = jwt.verify(socket.handshake.query.token, 'nodemy');
        console.log('Decoded token:', decoded);
        socket.user = decoded;
        if (!socket.user.email) throw new Error('Invalid token: missing email');
        next();
      } catch (err) {
        console.error('JWT verification error:', err.message);
        next(new Error('Authentication error'));
      }
    } else {
      console.error('No token provided in handshake:', socket.handshake.query);
      next(new Error('Authentication error'));
    }
  });

  io.on("connection", async (socket) => {
    try {
      if (!socket.user || !socket.user.email) {
        console.error('Socket user is invalid:', socket.user);
        socket.emit('error', { message: 'Invalid user data' });
        socket.disconnect();
        return;
      }

      let existUser = await User.findOne({ email: socket.user.email });
      console.log('Found user:', existUser);
      if (!existUser) {
        console.error('User not found for email:', socket.user.email);
        socket.emit('error', { message: 'User not found. Please register or login again.' });
        socket.disconnect();
        return;
      }

      let connectedUser = await ConnectedUser.findOne({ user: existUser._id });
      if (!connectedUser) {
        await ConnectedUser.create({ user: existUser._id });
      }

      socket.join('public');
      console.log('User connected and joined public room:', socket.id);

      let userList = await ConnectedUser.find().populate({
        path: 'user',
        populate: {
          path: 'avatarId',
        },
      });

      socket.emit('getUserList', { userList, length: userList.length });
      socket.broadcast.to('public').emit('getUserList', { userList, length: userList.length });

      socket.on('sendMessagePublic', (data) => {
        console.log('Broadcasting message:', data);
        if (!socket.user) return;
        if (data.content) {
          socket.broadcast.to('public').emit('receiveMessagePublic', {
            id: data.id,
            content: data.content,
            name: socket.user.name,
          });
        } else if (data.path) {
          socket.broadcast.to('public').emit('receiveMessagePublic', {
            id: data.id,
            imageId: { path: data.path },
            name: socket.user.name,
          });
        }
      });

      socket.on('refreshUser', async (data) => {
        let userList = await ConnectedUser.find().populate({
          path: 'user',
          populate: {
            path: 'avatarId',
          },
        });

        if (data.path) {
          userList = userList.map((e) => {
            if (e.user.id === data.id && e.user.avatarId) {
              e.user.avatarId.path = data.path;
            }
            return e;
          });
        }

        socket.emit('receiveUser', userList);
        socket.broadcast.to('public').emit('receiveUser', userList);
      });

      socket.on("disconnect", async () => {
        console.log('User disconnected:', socket.id);
        const onlUser = await User.findOne({ email: socket.user.email });
        if (onlUser) {
          await ConnectedUser.findOneAndDelete({ user: onlUser._id });
          const userList = await ConnectedUser.find().populate({
            path: 'user',
            populate: {
              path: 'avatarId',
            },
          });
          io.to('public').emit('getUserList', { userList, length: userList.length });
        }
      });
    } catch (err) {
      console.error('Socket connection error:', err);
      socket.emit('error', { message: 'Internal server error' });
      socket.disconnect();
    }
  });
};