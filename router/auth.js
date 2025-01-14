import express from "express"
import { register,login,deleteUser, updateUser, changePassword } from "../controller/auth.js"

const router = express.Router()

router.post("/register",register)
router.post("/login",login)
router.delete("/deleteUser/:id",deleteUser)
router.put("/updateUser/:id",updateUser)
router.put("/changePassword/:id",changePassword)

export default router