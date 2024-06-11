import message from "../models/message"

export const sendMessage = async (req, res) => {
    if (req.body.content != undefined) {
        await message.create(
            {
                content: req.body.content,
                senderId: req.body.senderId
            }
        )
    } else {
        await message.create(
            {
                imageId: req.body.imageId,
                senderId: req.body.senderId
            }
        )
    }

    res.status(200).json({ message: 'ok' })
}

export const getAll = async (req, res) => {
    let data = await message.find().populate('senderId').populate('imageId')
    res.status(200).json(data)
}