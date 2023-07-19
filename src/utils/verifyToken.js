import jwt from "jsonwebtoken";
import { createError } from "../utils/error.js";
import db from '../models';
const message = "Bạn Cần Access Token để truy cập APIs - Unauthorized (Token hết hạn, hoặc không hợp lệ, hoặc không truyền access token)";

export const authMiddleware = async (req, res, next) => {
    const token = req.cookies.refresh_token;
    try {
        if (!token) {
            res.status(401).json({
                statusCode: 401,
                message: message,
                error: "Unauthorized",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

        if (!decoded) {
            res.status(401).json({
                statusCode: 401,
                message: message,
                error: "Unauthorized",
            });
        }

        const user = await db.User.findOne({
            where: {
                email: decoded.email,
            },
            raw: true,
        });

        if (!user) {
            res.status(401).json({
                statusCode: 401,
                message: message,
                error: "Unauthorized",
            });
        }

        req.user = user;
        next();
    } catch (e) {
        next(e);
    }
};

export const verifyToken = (req, res, next) => {
    const token = req.cookies.refresh_token;
    if (!token) {
        return next(createError(401, "You are not authenticated!"));
    }
    jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if (err) return next(createError(403, "Token is not valid!"));
        req.user = user;
        next();
    });
};

export const verifyUser = (req, res, next) => {
    verifyToken(req, res, next, () => {
        if (req.user.id === req.params.id || req.user.isAdmin) {
            next();
        } else {
            return next(createError(403, "You are not authorized!"));
        }
    });
};

export const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, next, () => {
        if (req.user.isAdmin) {
            next();
        } else {
            return next(createError(403, "You are not authorized!"));
        }
    });
};
