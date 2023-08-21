class AppController {
    async DamData(req, res) {
        try {
        } catch (error) {
            console.log(error);
            res.status(500).json({
                errCode: -1,
                msg: "error from server",
                dataErr: `${error}`,
            });
        }
    }
}

export default new AppController();
