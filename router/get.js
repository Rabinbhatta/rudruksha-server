import express from "express"
import { getUsers,getProducts } from "../controller/get.js"

const router = express.Router()

router.get("/users",getUsers)
router.get("/products",getProducts)

export default router