import express from "express";
import connectDB from "./config/connectDB";
//import initWebRoutes from "./routes/web";
import bodyParser from "body-parser";
import viewEngine from "./config/viewEngine";
import cors from 'cors';
import cookieParser from "cookie-parser";
import authRoute from "./routes/auth";
import categoryRoute from "./routes/category";
import productRoute from "./routes/product";


require('dotenv').config();

let app = express();

app.use(
    cors({
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
        credentials: true,
    })
);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

//middlewares
viewEngine(app);
//initWebRoutes(app);
app.use(cookieParser());
app.use(express.json());
connectDB();

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/category", categoryRoute);
app.use("/api/v1/product", productRoute);




let port = process.env.PORT || 6868;

app.use((err, req, res, next) => {
    const errorStatus = err.status || 500;
    const errorMessage = err.message || "Something went wrong!";
    return res.status(errorStatus).json({
        success: false,
        status: errorStatus,
        message: errorMessage,
        stack: err.stack,
    });
});

app.listen(port, () => {
    console.log("backend nodejs is running on the port: ", port);
})