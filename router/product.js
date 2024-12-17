import express from "express"
import {createProduct} from "../controller/product.js"

const router = express.Router()

router.post("/create",createProduct)

export default router