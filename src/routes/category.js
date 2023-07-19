import express from "express";
import { createNewCategory, deleteCategory, getAllCategory, getAllCategoryPaginate, updateCategory } from "../controllers/categoryController";

const router = express.Router();

//auth
router.get('/get-all', getAllCategory);
router.get('/get-all-paginate', getAllCategoryPaginate);
router.post('/create-new-category', createNewCategory);
router.put('/update', updateCategory);
router.delete('/delete/:id', deleteCategory);


export default router;