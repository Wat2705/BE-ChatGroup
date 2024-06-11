import mongoose from "mongoose";

const ConnectedUserSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
}, { timestamps: { createdAt: 'created_at' } });

export default mongoose.model('connectedUser', ConnectedUserSchema)