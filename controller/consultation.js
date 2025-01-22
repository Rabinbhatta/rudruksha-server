import Consultation from '../models/consultation.js';

export const getConsultation = async (req, res) => {
  try {
    const{page=1,limit=10}=req.query;
    const startIndex=(page-1)*limit;
    const total= await Consultation.countDocuments({});
    const consultation = await Consultation.find().limit(limit).skip(startIndex);
    res.status(200).json({consultation,currentPage:page,totalPages:Math.ceil(total/limit),total:total});
    } catch (error) {
    res.status(404).json({ message: error.message });
    }
}

export const createConsultation = async (req, res) => {
    const {fullName,email,message,phone,date} = req.body;
    const newConsultation = new Consultation({fullName,email,message,phone,date});
    try {
        await newConsultation.save();
        res.status(201).json(newConsultation);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}