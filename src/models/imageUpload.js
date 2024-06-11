import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    path: {
        type: String
    }
})

export default mongoose.model('image', ImageSchema)