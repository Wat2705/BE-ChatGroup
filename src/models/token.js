import mongoose from "mongoose";

const TokenSchema = new mongoose.Schema({
    value: {
        type: String,
    }
})

export default mongoose.model('blackListToken', TokenSchema)