import cors from 'cors';
import 'dotenv/config';
import express from 'express';
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
            cb(null, `./uploads/${dir}`);
},
    filename: async function (req, file, cb) {
        if ((await fs.promises.readdir('.')).find(e => e === 'uploads') === undefined) {
            await fs.promises.mkdir('./uploads/avatar', { recursive: true });
            await fs.promises.mkdir('./uploads/image', { recursive: true });
        }

        if (dir === 'avatar') {
            let files = await fs.promises.readdir(`./uploads/${dir}`);
            for (const fsFile of files) {
                if (fsFile.split('.')[0] === req.user.id) {
                    fs.rmSync(`./uploads/${dir}/${fsFile}`, { force: true });
                }
            }

            cb(null, `${req.user.id}.${file.originalname.split('.')[1]}`);
        } else {
            cb(null, file.originalname);
        }
    },
});
};

const upload = multer({ storage: storage('image') });
const avatar = multer({ storage: storage('avatar') });

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: (origin, callback) => {
            const allowedOrigins = ['http://localhost:5173', 'http://localhost:5173/'];
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials: true,
        allowedHeaders: ['Authorization', 'Content-Type'],
    },
});

const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/message', messageRouter);
app.use(userRouter);

app.post('/upload', upload.single('image'), async (req, res) => {
    let existImage = await imageUpload.findOne({
        name: req.file.originalname,
    });

    if (!existImage) {
        let data = await imageUpload.create({
            name: req.file.originalname,
            path: req.file.path,
        });
        existImage = data;
    }
    res.status(200).json(existImage);
});

app.post('/avatar', async (req, res, next) => {
    if (req.headers.authorization != undefined) {
        try {
            req.user = jwt.verify(req.headers.authorization, 'nodemy');
            next();
        } catch (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
    } else {
        return res.status(400).json({ message: 'Token required' });
    }
}, avatar.single('avatar'), async (req, res) => {
    if (req.file != undefined) {
        let data = await Avatar.findOne({ name: req.file.filename.split('.')[0] });
        if (!data) {
            data = await Avatar.create({
                name: req.file.filename.split('.')[0],
                path: req.file.path,
            });
        } else {
            await Avatar.findByIdAndDelete(data._id);
            data = await Avatar.create({
                name: req.file.filename.split('.')[0],
                path: req.file.path,
            });
        }
        await user.findByIdAndUpdate(req.user.id, { avatarId: data._id });
        res.status(200).json({ path: req.file.path });
    } else {
        await user.findByIdAndUpdate(req.user.id, { avatarId: null });
        res.status(200).json({ message: 'ok' });
    }
});

ConnectDB();
IoServiceChat(io);
httpServer.listen(PORT, async () => {
    await ConnectedUser.deleteMany({});
    console.log("listening on *:" + " " + PORT);
});