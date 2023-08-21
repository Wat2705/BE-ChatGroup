import ChatBoxService from "./ChatBoxService";

const IoServiceChat = (io) => {
    const rooms = {}; // Lưu trữ thông tin về các phòng và các client trong phòng

    io.on("connection", (socket) => {
        socket.on("joinRoom", (phoneNumber) => {
            socket.join(phoneNumber); // Tham gia vào phòng (room) tương ứng với số điện thoại

            // Tạo phòng nếu chưa tồn tại
            if (!rooms[phoneNumber]) {
                rooms[phoneNumber] = new Set();
            }

            // Thêm client vào phòng
            rooms[phoneNumber].add(socket);
        });

        const sendNewChat = async () => {
            const dataRoom = await ChatBoxService.GetAllRoomChat();
            if (dataRoom.errCode === 0) {
                const dataFilter = dataRoom.data.filter(
                    (item) => item.isNew === true
                );
                if (dataFilter.length > 0) {
                    socket.emit("new room", dataFilter);
                }
            }
        };

        socket.on("chat bot", async (data) => {
            try {
                const dataChat = await ChatBoxService.GetAllGroup(
                    data.idAccount
                );

                sendNewChat();

                const phoneNumber = data.phoneNumber;

                // Gửi tin nhắn đến tất cả client trong phòng (room) tương ứng với số điện thoại
                if (rooms[phoneNumber]) {
                    rooms[phoneNumber].forEach((client) => {
                        client.emit("chat bot", dataChat);
                    });
                }
            } catch (error) {
                console.log(error);
                socket.emit("chat bot", error);
            }
        });

        socket.on("disconnect", () => {
            // Xóa client khỏi các phòng (rooms) mà nó tham gia
            Object.keys(rooms).forEach((phoneNumber) => {
                if (rooms[phoneNumber].has(socket)) {
                    rooms[phoneNumber].delete(socket);
                }

                // Xóa phòng nếu không còn client nào trong phòng
                if (rooms[phoneNumber].size === 0) {
                    delete rooms[phoneNumber];
                }
            });
        });
    });
};

export default { IoServiceChat };
