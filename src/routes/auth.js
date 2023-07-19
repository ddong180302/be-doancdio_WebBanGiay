import express from "express";
import { login, register, getAccount, logout, refresh } from "../controllers/authController";
import { authMiddleware, verifyToken } from "../utils/verifyToken";

const router = express.Router();

//auth
router.post('/register', register);
router.post('/login', login);
router.get('/account', authMiddleware, getAccount);
router.post('/logout', authMiddleware, logout);
router.get('/refresh', authMiddleware, refresh);


export default router;