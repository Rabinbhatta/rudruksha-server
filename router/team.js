import express from "express";
import {
  getTeam,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from "../controller/team.js";
import { verifyAdmin } from "../middleware/admin.js";

const router = express.Router();

// Public: get team for About Us page
router.get("/get", getTeam);

// Admin CRUD
router.post("/create", verifyAdmin, createTeamMember);
router.put("/update/:id", verifyAdmin, updateTeamMember);
router.delete("/delete/:id", verifyAdmin, deleteTeamMember);

export default router;

