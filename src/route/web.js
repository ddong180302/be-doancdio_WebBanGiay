import express from "express";
const router = express.Router();
import authController from "../controllers/authController";
import verifyToken from "../middlewares/verifyToken";
import userController from "../controllers/userController";
import categoryController from "../controllers/categoryController";
import productController from "../controllers/productController";
import galleryController from "../controllers/galleryController";
import orderController from "../controllers/orderController";
const multer = require('multer');

const upload = multer();
const uploadMuti = multer();

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
    router.put('/api/v1/user/update', upload.single('avatar'), userController.updateUser);
    router.delete('/api/v1/user/delete/:id', userController.deleteUser);


    //manage category
    router.get('/api/v1/category/get-all', categoryController.getAllCategory);
    router.get('/api/v1/category/get-all-paginate', categoryController.getAllCategoryPaginate);
    router.post('/api/v1/category/create-new-category', categoryController.createNewCategory);
    //router.post('/api/v1/category/bulk-create', userController.bulkCreate);
    router.put('/api/v1/category/update', categoryController.updateCategory);
    router.delete('/api/v1/category/delete/:id', categoryController.deleteCategory);

    // upload.single('thumbnail'),
    //manage product
    router.get('/api/v1/product/get-all', productController.getAllProduct);
    router.get('/api/v1/product/get-all-paginate', productController.getAllProductPaginate);
    router.post('/api/v1/product/create-new-product', upload.single('thumbnail'), productController.createNewProduct);
    //router.post('/api/v1/category/bulk-create', userController.bulkCreate);
    router.put('/api/v1/product/update', uploadMuti.array('slider[]', 10), productController.updateProduct);
    router.delete('/api/v1/product/delete/:id', productController.deleteProduct);
    router.get('/api/v1/detail-product/:id', productController.getDetailProductById);



    //manage gallery
    router.post('/api/v1/gallery/create-new-gallery', upload.single('image'), galleryController.createNewGallery);
    router.get('/api/v1/gallery/get-all', galleryController.getAllGallery);
    router.put('/api/v1/gallery/update', galleryController.updateGallery);


    //order
    router.post('/api/v1/order', orderController.createAnOrder);


    return app.use("/", router);
}


module.exports = initWebRoutes;