import express from "express"
import { register,login,deleteUser } from "../controller/auth.js"

const router = express.Router()

router.post("/register",register)
router.get("/login",login)
router.delete("/deleteUser/:id",deleteUser)

export default router