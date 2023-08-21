import express from "express";
import AppRouter from "./router/app";
import { createServer } from "http";
import ConnectDB from "./config/connectDB";
import { IoServiceChat } from "./services/appService";
import { Server } from "socket.io";

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:4000",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    },
});

const app = express();
const PORT = process.env.PORT || 8080;

// defined Router
AppRouter(app);

// connect DB
ConnectDB();

// io services
IoServiceChat(io);

httpServer.listen(PORT, () => {
    console.log("listening on *:" + " " + PORT);
});
