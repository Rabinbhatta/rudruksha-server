import express from "express";
import * as eventController from "../controller/events.js";

const router = express.Router();

router.get("/get", eventController.getEvents);
router.get("/events/:id", eventController.getEventById);
router.post("/create", eventController.createEvent);
router.put("/events/:id", eventController.updateEvent);
router.patch("/events/:id/toggle-status", eventController.toggleEventStatus);
router.post("/events/:id/products", eventController.addProductsToEvent);
router.delete("/events/:id/products", eventController.removeProductsFromEvent);
router.delete("/events/:id", eventController.deleteEvent);

export default router;