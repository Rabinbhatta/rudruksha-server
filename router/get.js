import express from "express"
import { getUsers,getProducts, getProductBySlug,} from "../controller/get.js"

const router = express.Router()

router.get("/users",getUsers)
router.get("/products/",getProducts)
router.get("/product/:slug",getProductBySlug)

export default router