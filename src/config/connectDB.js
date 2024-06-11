import mongoose from "mongoose";

const ConnectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB);

        console.log("Connected to MongoDB successfully!");
    } catch (error) {
        console.log(error);
    }
};

export default ConnectDB;
