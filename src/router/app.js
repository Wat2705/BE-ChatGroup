import express from "express";
const Router = express.Router();

const AppRouter = (app) => {
    app.use("/api/v1", Router);
};

export default AppRouter;
