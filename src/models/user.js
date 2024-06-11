import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
    },
    avatarId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'avatar'
    }
})

export default mongoose.model('user', UserSchema)