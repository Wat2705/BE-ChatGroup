import 'dotenv/config'
import cors from 'cors';
import express from "express";
import fs from 'fs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { createServer } from 'node:http';
import path from 'path';
import { Server } from "socket.io";
import ConnectDB from "./config/connectDB";
import Avatar from './models/avatar';
import ConnectedUser from "./models/connectedUser";
import imageUpload from './models/imageUpload';
import user from './models/user';
import messageRouter from "./router/message";
import userRouter from "./router/user";
import { IoServiceChat } from "./services/appService";

const storage = (dir) => {
    return multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, `./uploads/${dir}`)
        },
        filename: function (req, file, cb) {
            fs.readdir(`./uploads/${dir}`, (err, files) => {
                files.forEach(fsFile => {
                    if (dir == 'avatar') {
                        if (fsFile.split('.')[0] == req.user.id) {
                            fs.unlink(`./uploads/${dir}/${fsFile}`, (err) => { })
                        }
                    }
                });
            });
            if (dir == 'avatar') {
                cb(null, `${req.user.id}.${file.originalname.split('.')[1]}`)
            } else cb(null, file.originalname)
        }
    })
}

const upload = multer({ storage: storage('image') })
const avatar = multer({ storage: storage('avatar') })

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: process.env.FE,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    },
});

const PORT = process.env.PORT || 8080;

app.use(express.json())
app.use(cors())
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))
app.use('/message', messageRouter)
app.use(userRouter)

app.post('/upload', upload.single('image'), async (req, res) => {
    let existImage = await imageUpload.findOne({
        name: req.file.originalname
    })

    if (existImage == null) {
        let data = await imageUpload.create(
            {
                name: req.file.originalname,
                path: req.file.path
            }
        )

        existImage = data
    }

    res.status(200).json(existImage)
})

app.post('/avatar', async (req, res, next) => {
    if (req.headers.authorization != undefined) {
        req.user = jwt.verify(req.headers.authorization, 'nodemy')
        next()
    } else res.status(400).json({ message: 'Token required' })
}, avatar.single('avatar'), async (req, res) => {
    if (req.file == undefined) {
        await user.findByIdAndUpdate(req.user.id, { name: req.body.name })
    } else {
        let data = await Avatar.create({
            name: req.file.filename,
            path: req.file.path
        })
        if (req.body.name != undefined) {
            await user.findByIdAndUpdate(req.user.id, { avatarId: data._id, name: req.body.name })
        } else await user.findByIdAndUpdate(req.user.id, { avatarId: data._id })
    }
    res.status(200).json({ message: 'ok' })
})

ConnectDB();
IoServiceChat(io);
httpServer.listen(PORT, async () => {
    await ConnectedUser.deleteMany({})
    console.log("listening on *:" + " " + PORT);
});