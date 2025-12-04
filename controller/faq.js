import FAQ from "../models/faq.js";

export const getFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find();
    res.status(200).json(faqs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFAQById = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) return res.status(404).json({ message: "FAQ not found" });
    res.status(200).json(faq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createFAQ = async (req, res) => {
  try {
    const { question, answer } = req.body;
    const newFAQ = new FAQ({ question, answer });
    await newFAQ.save();
    res.status(201).json(newFAQ);
    } catch (error) {
    res.status(500).json({ message: error.message });
    }
};

export const updateFAQ = async (req, res) => {
  try {
    const { question, answer } = req.body;
    const updatedFAQ = await FAQ.findByIdAndUpdate(
        req.params.id,
        { question, answer },
        { new: true }
    );
    if (!updatedFAQ) return res.status(404).json({ message: "FAQ not found" });
    res.status(200).json(updatedFAQ);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteFAQ = async (req, res) => {
  try {
    const deletedFAQ = await FAQ.findByIdAndDelete(req.params.id);
    if (!deletedFAQ) return res.status(404).json({ message: "FAQ not found" });
    res.status(200).json({ message: "FAQ deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};