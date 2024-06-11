import mongoose from "mongoose";

const AvatarSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    path: {
        type: String
    }
})

export default mongoose.model('avatar', AvatarSchema)