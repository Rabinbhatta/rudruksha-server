import express from "express"
import { addImages, getImages, removeImage } from "../controller/banner.js"

const router = express.Router()

router.post("/create",addImages)
router.get("/get",getImages)
router.delete("/delete",removeImage)

export default router