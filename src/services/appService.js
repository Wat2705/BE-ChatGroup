import ConnectedUser from "../models/connectedUser"
import User from "../models/user"
import jwt from 'jsonwebtoken'

export const IoServiceChat = (io) => {
    io.use(function (socket, next) {
        if (socket.handshake.query && socket.handshake.query.token) {
            jwt.verify(socket.handshake.query.token, 'nodemy', function (err, decoded) {
                if (err) return next(new Error('Authentication error'));
                socket.user = decoded;
                next();
            });
        }
        else {
            next(new Error('Authentication error'));
        }
    })
    io.on("connection", async (socket) => {
        let existUser = await User.findOne({ email: socket.user.email })
        let connectedUser = await ConnectedUser.findOne({ user: existUser._id });
        if (connectedUser == null) {
            await ConnectedUser.create({ user: existUser._id })
        }

        let userList = await ConnectedUser.find().populate({
            path: 'user',
            populate: {
                path: 'avatarId'
            }
        });

        socket.join('public');
        socket.emit('getUserList', userList)
        socket.broadcast.to('public').emit('getUserList', userList)

        socket.on('sendMessagePublic', (data) => {
            if (data.content != undefined) {
                socket.broadcast.to('public').emit('receiveMessagePublic', {
                    id: data.id,
                    content: data.content,
                    name: socket.user.name
                });
            } else socket.broadcast.to('public').emit('receiveMessagePublic', {
                id: data.id,
                imageId: {
                    path: data.path
                },
                name: socket.user.name
            });
        });

        socket.on('refreshUser', async (data) => {
            userList = await ConnectedUser.find().populate({
                path: 'user',
                populate: {
                    path: 'avatarId'
                }
            });
            userList = userList.filter(e => {
                if (e.user.id == data.id) {
                    e.user.avatarId.path = data.path
                }
                return true
            })
            socket.emit('receiveUser', userList);
            socket.broadcast.to('public').emit('receiveUser', userList);
        })

        socket.on("disconnect", async () => {
            let onlUser = await User.findOne({ email: socket.user.email })
            await ConnectedUser.findOneAndDelete({ user: onlUser._id })
            userList = await ConnectedUser.find().populate({
                path: 'user',
                populate: {
                    path: 'avatarId'
                }
            });
            await socket.broadcast.to('public').emit('getUserList', userList)
        });
    });
};