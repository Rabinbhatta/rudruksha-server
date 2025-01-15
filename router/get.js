import express from "express"
import { getUsers,getProducts,getProduct,} from "../controller/get.js"

const router = express.Router()

router.get("/users",getUsers)
router.get("/products/",getProducts)
router.get("/product/:id",getProduct)

export default router