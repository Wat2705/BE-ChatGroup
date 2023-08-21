import Room from "../models/room";
import Message from "../models/message";

class ChatBoxService {
    async GetAllGroup(idAccount) {
        return new Promise(async (resolve, reject) => {
            try {
                const data = await Room.find(idAccount);

                resolve({
                    errCode: 0,
                    msg: "ok",
                    data,
                });
            } catch (error) {
                console.log(error);
                resolve({
                    errCode: -1,
                    msg: "error from server",
                    dataErr: `${error}`,
                });
            }
        });
    }

    async getAllMessageGroup(idRoom, userId, pageNumber = 1, perPage = 10) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!idRoom) {
                    return resolve({
                        errCode: 1,
                        msg: "ID Group Is Required",
                    });
                }

                const pipeline = [
                    {
                        $match: {
                            "hiddenChat.id": userId,
                            "Room._id": idRoom, // đoạn này sẽ lấy phòng Room trùng với ID room ta truyền lên!
                        },
                    },
                    {
                        $lookup: {
                            from: "messages",
                            localField: "_id",
                            foreignField: "idRoom",
                            as: "messages",
                        },
                    },
                    {
                        $unwind: "$messages",
                    },
                    {
                        $match: {
                            "messages.time": { $gt: "$hiddenChat.time" },
                        },
                    },
                    {
                        $sort: { "messages.time": -1 },
                    },
                    {
                        $skip: (currentPage - 1) * perPage, // Bỏ qua các bản ghi trước trang cần lấy
                    },
                    {
                        $limit: perPage, // Giới hạn số bản ghi trên mỗi trang
                    },
                    {
                        $project: {
                            _id: 0,
                            messages: {
                                _id: "$messages._id",
                                idRoom: "$messages.idRoom",
                                content: "$messages.content",
                                time: "$messages.time",
                                userId: "$messages.userId",
                            },
                        },
                    },
                ];

                const [result, totalCount] = await Promise.all([
                    Room.aggregate(pipeline),
                    Room.countDocuments(),
                ]);

                const totalPages = Math.ceil(totalCount / perPage);

                const paginationInfo = {
                    currentPage,
                    perPage,
                    totalItems: totalCount,
                    totalPages,
                };

                resolve({
                    errCode: 0,
                    msg: "ok",
                    data: result,
                    meta: {
                        paginationInfo,
                    },
                });
            } catch (error) {
                console.log(error);
                resolve({
                    errCode: -1,
                    msg: "error from server",
                    dataErr: `${error}`,
                });
            }
        });
    }

    async SendMessage(data) {
        return new Promise(async (resolve, reject) => {
            try {
                await Message.create(data);

                resolve({
                    errCode: 0,
                    msg: "ok",
                });
            } catch (error) {
                console.log(error);
                reject({
                    errCode: -1,
                    msg: "error from server",
                });
            }
        });
    }

    async DeleteMessage() {
        Message.deleteMany();
    }
}

export default new ChatBoxService();
