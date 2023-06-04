import express from "express";
const router = express.Router();
import authController from "../controllers/authController";
import verifyToken from "../middlewares/verifyToken";
import userController from "../controllers/userController";
import categoryController from "../controllers/categoryController";



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
    router.post('/api/v1/user/create-new-user', userController.createNewUser);
    router.post('/api/v1/user/bulk-create', userController.bulkCreate);
    router.put('/api/v1/user/update', userController.updateUser);
    router.delete('/api/v1/user/delete/:id', userController.deleteUser);


    //manage category
    router.get('/api/v1/category/get-all', categoryController.getAllCategory);
    router.get('/api/v1/category/get-all-paginate', categoryController.getAllCategoryPaginate);
    router.post('/api/v1/category/create-new-category', categoryController.createNewCategory);
    //router.post('/api/v1/category/bulk-create', userController.bulkCreate);
    router.put('/api/v1/category/update', categoryController.updateCategory);
    router.delete('/api/v1/category/delete/:id', categoryController.deleteCategory);


    return app.use("/", router);
}


module.exports = initWebRoutes;