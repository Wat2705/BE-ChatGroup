import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    content: {
        type: String
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    imageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'image'
    }
}, { timestamps: { createdAt: 'created_at' } });

export default mongoose.model('message', messageSchema);
