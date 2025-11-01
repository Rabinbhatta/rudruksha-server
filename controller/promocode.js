import Order from "../models/order.js";
import PromoCode from "../models/promocode.js";

export const createPromocode = async (req, res) => {
  try {
    const { code, discountPercentage, discountAmount, isActive = false, usageLimit } = req.body;
    const newPromo = new PromoCode({
      code,
      discountPercentage,
      discountAmount,
      isActive,
      usageLimit: usageLimit,
    });
    await newPromo.save();
    res.status(201).json({ message: "Promocode created successfully", promo: newPromo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred", error });
  }
};

export const deletePromocode = async (req, res) => {
    try {
        const id = req.params.id;
        const promo = await PromoCode.findByIdAndDelete(id);
        if (!promo) {
            return res.status(404).json({ error: "Promocode not found!!" });
        }
        res.status(200).json({ msg: "Promocode Deleted" });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

export const editPromocode = async (req, res) => {
    try {
        const { id } = req.params;
        const { code, isActive, usageLimit, discountAmount , discountPercentage} = req.body;
        const updatedPromo = await PromoCode.findByIdAndUpdate(
            id,
            {
                code,
                discountPercentage,
                discountAmount,
                isActive,
                usageLimit: usageLimit || null,
                
            },
            { new: true }
        );;
        if (!updatedPromo) {
            return res.status(404).json({ error: "Promocode not found!!" });
        }
        res.status(200).json({ message: "Promocode updated successfully", promo: updatedPromo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred", error });
    }
};


export const listPromocodes = async (req, res) => {
    try {
        const promos = await PromoCode.find();
        res.status(200).json({ promos });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred", error });
    }
};

export const applyPromocode = async (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.userId || req.body.userId;
        const promo = await PromoCode.findOne({ code, isActive: true });
        if (!promo) {
            return res.status(404).json({ message: "Promocode not found or inactive" });
        }
        // Check usage limit
        if (promo.usageLimit !== null && promo.usedCount.length >= promo.usageLimit) {
            return res.status(400).json({ message: "Promocode usage limit reached" });
        }
        // Check if user has already used the promocode
        const order = await Order.findOne({ userId: userId, promocode: promo._id });
        if (promo.usedCount.includes(userId) && order) {
            return res.status(400).json({ message: "You have already used this promocode" });
        }
        if(promo.usedCount.includes(userId)) {
            return res.status(200).json({ message: "Promocode applied successfully", promo });
        }
        promo.usedCount.push(userId);
        await promo.save();
        res.status(200).json({ message: "Promocode applied successfully", promo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred", error });
    }
};

