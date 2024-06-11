import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
    name: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    hiddenChat: [
        {
            id: { type: mongoose.Schema.Types.ObjectId },
            time: { type: Date, default: Date.now },
        },
    ],
    account: {
        type: mongoose.Schema.Types.Array,
    },
    admin: {
        type: mongoose.Schema.Types.Array,
    },
    type: {
        type: mongoose.Schema.Types.Boolean,
    },
});

const Room = mongoose.model("RoomSchema", RoomSchema);

export default Room;
