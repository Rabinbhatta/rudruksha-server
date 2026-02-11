import TeamMember from "../models/team.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

// Get all active team members (public)
export const getTeam = async (req, res) => {
  try {
    const members = await TeamMember.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 });
    return res.status(200).json(members);
  } catch (error) {
    console.error("Error fetching team members:", error);
    return res.status(500).json({ message: "Failed to fetch team members" });
  }
};

// Admin: create team member
export const createTeamMember = async (req, res) => {
  try {
    const { name, role, description, order, isActive } = req.body;

    if (!name || !role || !description) {
      return res.status(400).json({ message: "Name, role, and description are required" });
    }

    if (description.length > 50) {
      return res.status(400).json({ message: "Description must be 50 characters or less" });
    }

    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: "Team member image is required" });
    }

    const imageFile = req.files.image;
    if (!imageFile.tempFilePath) {
      return res.status(400).json({ message: "Invalid image upload" });
    }

    const imageUrl = await uploadToCloudinary(imageFile.tempFilePath);

    const member = new TeamMember({
      name,
      role,
      description,
      image: imageUrl,
      order: typeof order !== "undefined" ? Number(order) : 0,
      isActive: typeof isActive !== "undefined" ? isActive : true,
    });

    await member.save();
    return res.status(201).json(member);
  } catch (error) {
    console.error("Error creating team member:", error);
    return res.status(500).json({ message: "Failed to create team member" });
  }
};

// Admin: update team member
export const updateTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, description, order, isActive } = req.body;

    const member = await TeamMember.findById(id);
    if (!member) {
      return res.status(404).json({ message: "Team member not found" });
    }

    if (description && description.length > 50) {
      return res.status(400).json({ message: "Description must be 50 characters or less" });
    }

    // Handle optional new image
    if (req.files && req.files.image) {
      const imageFile = req.files.image;
      if (!imageFile.tempFilePath) {
        return res.status(400).json({ message: "Invalid image upload" });
      }

      // Delete old image from Cloudinary
      if (member.image) {
        try {
          await deleteFromCloudinary(member.image);
        } catch (err) {
          console.error("Error deleting old team image from Cloudinary:", err);
        }
      }

      const newImageUrl = await uploadToCloudinary(imageFile.tempFilePath);
      member.image = newImageUrl;
    }

    if (typeof name !== "undefined") member.name = name;
    if (typeof role !== "undefined") member.role = role;
    if (typeof description !== "undefined") member.description = description;
    if (typeof order !== "undefined") member.order = Number(order);
    if (typeof isActive !== "undefined") member.isActive = isActive;

    await member.save();
    return res.status(200).json(member);
  } catch (error) {
    console.error("Error updating team member:", error);
    return res.status(500).json({ message: "Failed to update team member" });
  }
};

// Admin: delete team member
export const deleteTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await TeamMember.findById(id);
    if (!member) {
      return res.status(404).json({ message: "Team member not found" });
    }

    if (member.image) {
      try {
        await deleteFromCloudinary(member.image);
      } catch (err) {
        console.error("Error deleting team image from Cloudinary:", err);
      }
    }

    await TeamMember.findByIdAndDelete(id);
    return res.status(200).json({ message: "Team member deleted successfully" });
  } catch (error) {
    console.error("Error deleting team member:", error);
    return res.status(500).json({ message: "Failed to delete team member" });
  }
};

