import express from "express";
const router = express.Router();
import authController from "../controllers/authController";
import verifyToken from "../middlewares/verifyToken";
import userController from "../controllers/userController";



let initWebRoutes = (app) => {

    //auth
    router.post('/api/v1/auth/register', authController.register);
    router.post('/api/v1/auth/login', authController.login);
    router.get('/api/v1/auth/account', authController.getAccount);
    router.post('/api/v1/auth/logout', authController.logout);
    router.get('/api/v1/auth/refresh', authController.refresh);


    //admin
    //manage user
    router.get('/api/v1/user/get-all', userController.getAllUser);
    router.get('/api/v1/user/get-all-paginate', userController.getAllUserPaginate);


    return app.use("/", router);
}


module.exports = initWebRoutes;