import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const messageSchema = new mongoose.Schema({
    file: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    image: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    time: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    receiver_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: messageSchema,
    },
    message: {
        type: mongoose.Schema.Types.Text,
        required: true,
    },
    isNew: {
        type: mongoose.Schema.Types.Boolean,
        required: true,
    },
    reaction: {
        type: mongoose.Schema.Types.String,
        required: false,
    },
    idRoom: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    idAccount: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    delete: {
        type: mongoose.Schema.Types.Array,
    },
});

messageSchema.plugin(mongoosePaginate);
const Message = mongoose.model("Message", messageSchema);

export default Message;
