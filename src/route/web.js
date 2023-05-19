import express from "express";
const router = express.Router();



let initWebRoutes = (app) => {

    return app.use("/", router);
}


module.exports = initWebRoutes;