import express from "express"
import { getUsers, getProducts, getProductBySlug, } from "../controller/get.js"
import { verifyAdmin } from "../middleware/admin.js"

const router = express.Router()

router.get("/users", verifyAdmin, getUsers)
router.get("/products/", getProducts)
router.get("/product/:slug", getProductBySlug)

export default router