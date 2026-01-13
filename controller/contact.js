import Contact from "../models/contacts.js";
import ContactSubmission from "../models/contactSubmission.js";
import Notification from "../models/notification.js";

export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: "Contact not found" });
    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createContact = async (req, res) => {
  try {
    const { location, phone, email } = req.body;
    const newContact = new Contact({ location, phone, email });
    await newContact.save();
    res.status(201).json(newContact);
    } catch (error) {
    res.status(500).json({ message: error.message });
    }
};

export const updateContact = async (req, res) => {
  try {
    const { location, phone, email } = req.body;
    const updatedContact = await Contact.findByIdAndUpdate(
        req.params.id,
        { location, phone, email },
        { new: true, runValidators: true }
    );
    if (!updatedContact) return res.status(404).json({ message: "Contact not found" });
    res.status(200).json(updatedContact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const deletedContact = await Contact.findByIdAndDelete(req.params.id);
    if (!deletedContact) return res.status(404).json({ message: "Contact not found" });
    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false,
        message: "Name, email, and message are required" 
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid email format" 
      });
    }

    // Save contact submission to database
    const newSubmission = new ContactSubmission({
      name,
      email,
      phone: phone || "",
      message,
    });
    await newSubmission.save();

    // Create notification for admin
    const notification = new Notification({
      type: 'contact',
      title: 'New Contact Form Submission',
      message: `${name} sent a message via contact form`,
      relatedId: newSubmission._id,
      relatedModel: 'ContactSubmission',
    });
    await notification.save();

    res.status(200).json({
      success: true,
      message: "Thank you for contacting us! We'll get back to you soon.",
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get all contact submissions (admin only)
export const getContactSubmissions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const total = await ContactSubmission.countDocuments({});
    const submissions = await ContactSubmission.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);
    
    res.status(200).json({
      success: true,
      data: submissions,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total: total,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get single contact submission (admin only)
export const getContactSubmissionById = async (req, res) => {
  try {
    const submission = await ContactSubmission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ 
        success: false,
        message: "Contact submission not found" 
      });
    }
    res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Mark contact submission as read
export const markContactSubmissionAsRead = async (req, res) => {
  try {
    const submission = await ContactSubmission.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!submission) {
      return res.status(404).json({ 
        success: false,
        message: "Contact submission not found" 
      });
    }
    res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Delete contact submission
export const deleteContactSubmission = async (req, res) => {
  try {
    const deletedSubmission = await ContactSubmission.findByIdAndDelete(req.params.id);
    if (!deletedSubmission) {
      return res.status(404).json({ 
        success: false,
        message: "Contact submission not found" 
      });
    }
    res.status(200).json({
      success: true,
      message: "Contact submission deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};
