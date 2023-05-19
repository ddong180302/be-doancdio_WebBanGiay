import express from "express";
import connectDB from "./config/connectDB";
import initWebRoutes from "./route/web";
import bodyParser from "body-parser";
import viewEngine from "./config/viewEngine";
import cors from 'cors';

require('dotenv').config();

let app = express();

app.use(cors({ origin: true }))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

viewEngine(app);
initWebRoutes(app);

connectDB();

let port = process.env.PORT || 6868;

app.listen(port, () => {
    console.log("backend nodejs is running on the port: ", port);
})