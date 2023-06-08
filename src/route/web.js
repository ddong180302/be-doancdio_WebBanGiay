import express from "express";
const router = express.Router();
import authController from "../controllers/authController";
import verifyToken from "../middlewares/verifyToken";
import userController from "../controllers/userController";
import categoryController from "../controllers/categoryController";
import productController from "../controllers/productController";
import galeryController from "../controllers/galeryController";
const multer = require('multer');

const upload = multer();

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


    //manage product
    router.get('/api/v1/product/get-all', productController.getAllProduct);
    router.get('/api/v1/product/get-all-paginate', productController.getAllProductPaginate);
    router.post('/api/v1/product/create-new-product', upload.single('image'), productController.createNewProduct);
    //router.post('/api/v1/category/bulk-create', userController.bulkCreate);
    router.put('/api/v1/product/update', productController.updateProduct);
    router.delete('/api/v1/product/delete/:id', productController.deleteProduct);
    router.get('/api/v1/detail-product/:id', productController.getDetailProductById);



    //manage galery
    router.post('/api/v1/galery/create-new-galery', upload.single('image'), galeryController.createNewGalery);
    router.get('/api/v1/galery/get-all', galeryController.getAllGalery);
    router.put('/api/v1/galery/update', galeryController.updateGalery);

    return app.use("/", router);
}


module.exports = initWebRoutes;