import express  from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import fileUpload from "express-fileupload"
import {v2 as cloudinary} from "cloudinary"
import {createServer} from "http"
import authRoute from "./router/auth.js"
import getRoute from "./router/get.js"
import productRoute from "./router/product.js"

const app = express()
const https = createServer(app)

dotenv.config();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({policy : "cross-origin"}));
app.use(morgan("common"));
app.use(bodyParser.json({limit:"30mb", extended:true}));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true}));
app.use(cors({
    origin: 'http://localhost:3000', // Your React app domain
}));
app.use(fileUpload({
    useTempFiles:true
}))

app.use("/auth",authRoute)
app.use("/get",getRoute)
app.use("/product",productRoute)

cloudinary.config({
    cloud_name: process.env.cloudinary_cloud_name, 
    api_key: process.env.cloudinary_api_key, 
    api_secret: process.env.cloudinary_api_secret
})


mongoose.set('strictQuery', true)

mongoose.connect(process.env.MONGODB, 
    ).then(()=> https.listen(process.env.PORT,()=>console.log(`Server is listening at ${process.env.PORT}`))
    ).catch((error)=>console.log(error.message))