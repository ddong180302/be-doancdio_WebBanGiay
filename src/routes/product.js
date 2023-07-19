import express from "express";
import { createNewProduct, deleteProduct, getAllProduct, getAllProductPaginate, getDetailProductById, updateProduct } from "../controllers/productController";

const router = express.Router();

//auth
router.get('/get-all', getAllProduct);
router.get('/get-all-paginate', getAllProductPaginate);
router.post('/create-new-product', createNewProduct);
router.put('/update', updateProduct);
router.delete('/delete/:id', deleteProduct);
router.delete('/detail-product/:id', getDetailProductById);


export default router;