import mongoose from "mongoose";

const ConnectDB = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/chat-app");

        console.log("Connected to MongoDB successfully!");
    } catch (error) {
        console.log(error);
    }
};

export default ConnectDB;
