import express from "express";
import * as eventController from "../controller/events.js";
import { verifyAdmin } from "../middleware/admin.js";

const router = express.Router();

router.get("/get", eventController.getEvents);
router.get("/events/:id", eventController.getEventById);
router.post("/create", verifyAdmin, eventController.createEvent);
router.put("/events/:id", verifyAdmin, eventController.updateEvent);
router.patch("/events/:id/toggle-status", verifyAdmin, eventController.toggleEventStatus);
router.post("/events/:id/products", verifyAdmin, eventController.addProductsToEvent);
router.delete("/events/:id/products", verifyAdmin, eventController.removeProductsFromEvent);
router.delete("/events/:id", verifyAdmin, eventController.deleteEvent);

export default router;