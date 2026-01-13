import Consultation from "../models/consultation.js";
import Notification from "../models/notification.js";
import { sendEmail } from "../utils/email.js";
import { getConsultationNotificationTemplate } from "../utils/emailTemplates.js";

export const getConsultation = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const startIndex = (page - 1) * limit;
    const total = await Consultation.countDocuments({});
    const consultation = await Consultation.find()
      .limit(limit)
      .skip(startIndex);
    res.status(200).json({
      consultation,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total: total,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createConsultation = async (req, res) => {
  const { fullName, email, message, phone, date } = req.body;
  const newConsultation = new Consultation({
    fullName,
    email,
    message,
    phone,
    date,
  });
  try {
    await newConsultation.save();

    // Create notification for admin
    const notification = new Notification({
      type: 'consultation',
      title: 'New Consultation Request',
      message: `${fullName} requested a consultation`,
      relatedId: newConsultation._id,
      relatedModel: 'Consultaion',
    });
    await notification.save();

    // Send email to admin (khandbarirudrakhsa@gmail.com)
    const adminEmail = process.env.ADMIN_EMAIL || 'khandbarirudrakhsa@gmail.com';
    const adminEmailHtml = getConsultationNotificationTemplate(newConsultation, 'admin');
    await sendEmail(adminEmail, `New Consultation Request from ${fullName}`, adminEmailHtml);
    
    // Also send to khandbarirudrakhsa@gmail.com if ADMIN_EMAIL is different
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL !== 'khandbarirudrakhsa@gmail.com') {
      await sendEmail('khandbarirudrakhsa@gmail.com', `New Consultation Request from ${fullName}`, adminEmailHtml);
    }

    // Send confirmation email to user
    const userEmailHtml = getConsultationNotificationTemplate(newConsultation, 'user');
    await sendEmail(email, 'Consultation Request Received - Rudraksha', userEmailHtml);

    res.status(201).json(newConsultation);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const deleteConsultation = async (req, res) => {
  try {
    const id = req.params.id;
    const deletedConsultation = await Consultation.findByIdAndDelete(id);
    if (!deleteConsultation) {
      res.status(202).json({ msg: "not found" });
    }
    res.status(202).json({ deletedConsultation });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
