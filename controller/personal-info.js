import PersonalInfo from "../models/personal-info.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

// Get personal info
export const getPersonalInfo = async (req, res) => {
  try {
    const personalInfo = await PersonalInfo.getOrCreate();
    
    if (!personalInfo) {
      return res.status(404).json({ message: 'Personal info not found' });
    }

    // Ensure defaults for optional nested objects so clients always receive consistent shape
    if (!personalInfo.shippingFees) {
      personalInfo.shippingFees = {
        insideKathmandu: 0,
        outsideKathmandu: 0,
        india: 0,
        otherInternational: 0,
      };
    }
    if (!personalInfo.shippingEstimates) {
      personalInfo.shippingEstimates = {
        insideKathmandu: "",
        outsideKathmandu: "",
        india: "",
        otherInternational: "",
      };
    }

    res.status(200).json(personalInfo);
  } catch (error) {
    console.error('Error fetching personal info:', error);
    res.status(500).json({ error: 'Failed to fetch personal info' });
  }
};

// Create or update FonePay QR
export const createOrUpdateFonePayQR = async (req, res) => {
  try {
    if (!req.files || !req.files.fonepayQR) {
      return res.status(400).json({ error: 'FonePay QR image is required' });
    }

    const file = req.files.fonepayQR;
    let personalInfo = await PersonalInfo.getOrCreate();

    // Upload to cloudinary
    let qrCodeUrl;
    try {
      if (!file.tempFilePath) {
        return res.status(400).json({ error: 'File path is missing' });
      }
      
      qrCodeUrl = await uploadToCloudinary(file.tempFilePath);
      
      if (!qrCodeUrl || typeof qrCodeUrl !== 'string') {
        throw new Error('Invalid upload result - expected URL string');
      }
    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError);
      return res.status(500).json({ error: `Failed to upload QR code: ${uploadError.message}` });
    }

    // Delete old QR code from Cloudinary if exists
    if (personalInfo.fonepayQR && personalInfo.fonepayQR.qrCodeUrl) {
      try {
        await deleteFromCloudinary(personalInfo.fonepayQR.qrCodeUrl);
      } catch (deleteError) {
        console.error('Error deleting old FonePay QR from Cloudinary:', deleteError);
        // Continue even if deletion fails
      }
    }

    // Update or create fonepayQR
    if (!personalInfo.fonepayQR) {
      personalInfo.fonepayQR = {
        qrCodeUrl: qrCodeUrl,
      };
    } else {
      personalInfo.fonepayQR.qrCodeUrl = qrCodeUrl;
    }

    await personalInfo.save();

    res.status(200).json({
      message: 'FonePay QR updated successfully',
      personalInfo: personalInfo,
    });
  } catch (error) {
    console.error('Error updating FonePay QR:', error);
    res.status(500).json({ error: 'Failed to update FonePay QR' });
  }
};

// Create or update eSewa QR
export const createOrUpdateEsewaQR = async (req, res) => {
  try {
    if (!req.files || !req.files.esewaQR) {
      return res.status(400).json({ error: 'eSewa QR image is required' });
    }

    const file = req.files.esewaQR;
    let personalInfo = await PersonalInfo.getOrCreate();

    // Upload to cloudinary
    let qrCodeUrl;
    try {
      if (!file.tempFilePath) {
        return res.status(400).json({ error: 'File path is missing' });
      }
      
      qrCodeUrl = await uploadToCloudinary(file.tempFilePath);
      
      if (!qrCodeUrl || typeof qrCodeUrl !== 'string') {
        throw new Error('Invalid upload result - expected URL string');
      }
    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError);
      return res.status(500).json({ error: `Failed to upload QR code: ${uploadError.message}` });
    }

    // Delete old QR code from Cloudinary if exists
    if (personalInfo.esewaQR && personalInfo.esewaQR.qrCodeUrl) {
      try {
        await deleteFromCloudinary(personalInfo.esewaQR.qrCodeUrl);
      } catch (deleteError) {
        console.error('Error deleting old eSewa QR from Cloudinary:', deleteError);
        // Continue even if deletion fails
      }
    }

    // Update or create esewaQR
    if (!personalInfo.esewaQR) {
      personalInfo.esewaQR = {
        qrCodeUrl: qrCodeUrl,
      };
    } else {
      personalInfo.esewaQR.qrCodeUrl = qrCodeUrl;
    }

    await personalInfo.save();

    res.status(200).json({
      message: 'eSewa QR updated successfully',
      personalInfo: personalInfo,
    });
  } catch (error) {
    console.error('Error updating eSewa QR:', error);
    res.status(500).json({ error: 'Failed to update eSewa QR' });
  }
};

// Create or update Khalti QR
export const createOrUpdateKhaltiQR = async (req, res) => {
  try {
    if (!req.files || !req.files.khaltiQR) {
      return res.status(400).json({ error: 'Khalti QR image is required' });
    }

    const file = req.files.khaltiQR;
    let personalInfo = await PersonalInfo.getOrCreate();

    // Upload to cloudinary
    let qrCodeUrl;
    try {
      if (!file.tempFilePath) {
        return res.status(400).json({ error: 'File path is missing' });
      }
      
      qrCodeUrl = await uploadToCloudinary(file.tempFilePath);
      
      if (!qrCodeUrl || typeof qrCodeUrl !== 'string') {
        throw new Error('Invalid upload result - expected URL string');
      }
    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError);
      return res.status(500).json({ error: `Failed to upload QR code: ${uploadError.message}` });
    }

    // Delete old QR code from Cloudinary if exists
    if (personalInfo.khaltiQR && personalInfo.khaltiQR.qrCodeUrl) {
      try {
        await deleteFromCloudinary(personalInfo.khaltiQR.qrCodeUrl);
      } catch (deleteError) {
        console.error('Error deleting old Khalti QR from Cloudinary:', deleteError);
        // Continue even if deletion fails
      }
    }

    // Update or create khaltiQR
    if (!personalInfo.khaltiQR) {
      personalInfo.khaltiQR = {
        qrCodeUrl: qrCodeUrl,
      };
    } else {
      personalInfo.khaltiQR.qrCodeUrl = qrCodeUrl;
    }

    await personalInfo.save();

    res.status(200).json({
      message: 'Khalti QR updated successfully',
      personalInfo: personalInfo,
    });
  } catch (error) {
    console.error('Error updating Khalti QR:', error);
    res.status(500).json({ error: 'Failed to update Khalti QR' });
  }
};

// Add bank QR
export const addBankQR = async (req, res) => {
  try {
    const { bankName, accountNumber, accountHolderName, swiftCode } = req.body;

    if (!bankName || !accountNumber || !accountHolderName) {
      return res.status(400).json({ error: 'Bank name, account number, and account holder name are required' });
    }

    let personalInfo = await PersonalInfo.getOrCreate();

    // Check maximum limit
    if (personalInfo.bankQRs.length >= 3) {
      return res.status(400).json({ error: 'Maximum 3 bank QR codes allowed' });
    }

    let qrCodeUrl = null;
    if (req.files && req.files.qrCode) {
      const file = req.files.qrCode;
      try {
        if (!file.tempFilePath) {
          return res.status(400).json({ error: 'File path is missing' });
        }
        
        qrCodeUrl = await uploadToCloudinary(file.tempFilePath);
        
        if (!qrCodeUrl || typeof qrCodeUrl !== 'string') {
          throw new Error('Invalid upload result - expected URL string');
        }
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ error: `Failed to upload QR code: ${uploadError.message}` });
      }
    }

    const newBankQR = {
      bankName,
      accountNumber,
      accountHolderName,
      swiftCode: swiftCode || null,
      qrCodeUrl,
    };

    personalInfo.bankQRs.push(newBankQR);
    await personalInfo.save();

    const addedBankQR = personalInfo.bankQRs[personalInfo.bankQRs.length - 1];

    res.status(201).json({
      message: 'Bank QR added successfully',
      bankQR: addedBankQR,
    });
  } catch (error) {
    console.error('Error adding bank QR:', error);
    res.status(500).json({ error: 'Failed to add bank QR' });
  }
};

// Update bank QR
export const updateBankQR = async (req, res) => {
  try {
    const { id } = req.params;
    const { bankName, accountNumber, accountHolderName, swiftCode } = req.body;

    let personalInfo = await PersonalInfo.getOrCreate();
    const bankQRIndex = personalInfo.bankQRs.findIndex(
      (qr) => qr._id.toString() === id
    );

    if (bankQRIndex === -1) {
      return res.status(404).json({ error: 'Bank QR not found' });
    }

    const bankQR = personalInfo.bankQRs[bankQRIndex];

    // Update fields if provided
    if (bankName) bankQR.bankName = bankName;
    if (accountNumber) bankQR.accountNumber = accountNumber;
    if (accountHolderName) bankQR.accountHolderName = accountHolderName;
    if (swiftCode !== undefined) bankQR.swiftCode = swiftCode || null;

    // Handle QR code image update
    if (req.files && req.files.qrCode) {
      const file = req.files.qrCode;
      
      // Delete old QR code from Cloudinary if exists
      if (bankQR.qrCodeUrl) {
        try {
          await deleteFromCloudinary(bankQR.qrCodeUrl);
        } catch (deleteError) {
          console.error('Error deleting old bank QR from Cloudinary:', deleteError);
          // Continue even if deletion fails
        }
      }

      try {
        if (!file.tempFilePath) {
          return res.status(400).json({ error: 'File path is missing' });
        }
        
        const newQrCodeUrl = await uploadToCloudinary(file.tempFilePath);
        
        if (!newQrCodeUrl || typeof newQrCodeUrl !== 'string') {
          throw new Error('Invalid upload result - expected URL string');
        }
        
        bankQR.qrCodeUrl = newQrCodeUrl;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ error: `Failed to upload QR code: ${uploadError.message}` });
      }
    }

    await personalInfo.save();

    res.status(200).json({
      message: 'Bank QR updated successfully',
      bankQR: bankQR,
    });
  } catch (error) {
    console.error('Error updating bank QR:', error);
    res.status(500).json({ error: 'Failed to update bank QR' });
  }
};

// Delete bank QR
export const deleteBankQR = async (req, res) => {
  try {
    const { id } = req.params;

    let personalInfo = await PersonalInfo.getOrCreate();
    const bankQRIndex = personalInfo.bankQRs.findIndex(
      (qr) => qr._id.toString() === id
    );

    if (bankQRIndex === -1) {
      return res.status(404).json({ error: 'Bank QR not found' });
    }

    const bankQR = personalInfo.bankQRs[bankQRIndex];

    // Delete QR code from Cloudinary if exists
    if (bankQR.qrCodeUrl) {
      try {
        await deleteFromCloudinary(bankQR.qrCodeUrl);
      } catch (deleteError) {
        console.error('Error deleting bank QR from Cloudinary:', deleteError);
        // Continue even if deletion fails
      }
    }

    personalInfo.bankQRs.splice(bankQRIndex, 1);
    await personalInfo.save();

    res.status(200).json({
      message: 'Bank QR deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting bank QR:', error);
    res.status(500).json({ error: 'Failed to delete bank QR' });
  }
};

// Create or update India QR
export const createOrUpdateIndiaQR = async (req, res) => {
  try {
    if (!req.files || !req.files.indiaQR) {
      return res.status(400).json({ error: 'India QR image is required' });
    }

    const file = req.files.indiaQR;
    let personalInfo = await PersonalInfo.getOrCreate();

    // Upload to cloudinary
    let qrCodeUrl;
    try {
      if (!file.tempFilePath) {
        return res.status(400).json({ error: 'File path is missing' });
      }
      
      qrCodeUrl = await uploadToCloudinary(file.tempFilePath);
      
      if (!qrCodeUrl || typeof qrCodeUrl !== 'string') {
        throw new Error('Invalid upload result - expected URL string');
      }
    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError);
      return res.status(500).json({ error: `Failed to upload QR code: ${uploadError.message}` });
    }

    // Delete old QR code from Cloudinary if exists
    if (personalInfo.indiaQR && personalInfo.indiaQR.qrCodeUrl) {
      try {
        await deleteFromCloudinary(personalInfo.indiaQR.qrCodeUrl);
      } catch (deleteError) {
        console.error('Error deleting old India QR from Cloudinary:', deleteError);
        // Continue even if deletion fails
      }
    }

    // Update or create indiaQR
    if (!personalInfo.indiaQR) {
      personalInfo.indiaQR = {
        qrCodeUrl: qrCodeUrl,
      };
    } else {
      personalInfo.indiaQR.qrCodeUrl = qrCodeUrl;
    }

    await personalInfo.save();

    res.status(200).json({
      message: 'India QR updated successfully',
      personalInfo: personalInfo,
    });
  } catch (error) {
    console.error('Error updating India QR:', error);
    res.status(500).json({ error: 'Failed to update India QR' });
  }
};

// Add India bank QR
export const addIndiaBankQR = async (req, res) => {
  try {
    const { bankName, accountNumber, accountHolderName, ifscCode } = req.body;

    if (!bankName || !accountNumber || !accountHolderName) {
      return res.status(400).json({ error: 'Bank name, account number, and account holder name are required' });
    }

    let personalInfo = await PersonalInfo.getOrCreate();

    // Check maximum limit
    if (personalInfo.indiaBankQRs && personalInfo.indiaBankQRs.length >= 3) {
      return res.status(400).json({ error: 'Maximum 3 India bank QR codes allowed' });
    }

    let qrCodeUrl = null;
    if (req.files && req.files.qrCode) {
      const file = req.files.qrCode;
      try {
        if (!file.tempFilePath) {
          return res.status(400).json({ error: 'File path is missing' });
        }
        
        qrCodeUrl = await uploadToCloudinary(file.tempFilePath);
        
        if (!qrCodeUrl || typeof qrCodeUrl !== 'string') {
          throw new Error('Invalid upload result - expected URL string');
        }
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ error: `Failed to upload QR code: ${uploadError.message}` });
      }
    }

    const newIndiaBankQR = {
      bankName,
      accountNumber,
      accountHolderName,
      ifscCode: ifscCode || null,
      qrCodeUrl,
    };

    if (!personalInfo.indiaBankQRs) {
      personalInfo.indiaBankQRs = [];
    }
    personalInfo.indiaBankQRs.push(newIndiaBankQR);
    await personalInfo.save();

    const addedIndiaBankQR = personalInfo.indiaBankQRs[personalInfo.indiaBankQRs.length - 1];

    res.status(201).json({
      message: 'India bank QR added successfully',
      indiaBankQR: addedIndiaBankQR,
    });
  } catch (error) {
    console.error('Error adding India bank QR:', error);
    res.status(500).json({ error: 'Failed to add India bank QR' });
  }
};

// Update India bank QR
export const updateIndiaBankQR = async (req, res) => {
  try {
    const { id } = req.params;
    const { bankName, accountNumber, accountHolderName, ifscCode } = req.body;

    let personalInfo = await PersonalInfo.getOrCreate();
    
    if (!personalInfo.indiaBankQRs) {
      return res.status(404).json({ error: 'India bank QR not found' });
    }
    
    const indiaBankQRIndex = personalInfo.indiaBankQRs.findIndex(
      (qr) => qr._id.toString() === id
    );

    if (indiaBankQRIndex === -1) {
      return res.status(404).json({ error: 'India bank QR not found' });
    }

    const indiaBankQR = personalInfo.indiaBankQRs[indiaBankQRIndex];

    // Update fields if provided
    if (bankName) indiaBankQR.bankName = bankName;
    if (accountNumber) indiaBankQR.accountNumber = accountNumber;
    if (accountHolderName) indiaBankQR.accountHolderName = accountHolderName;
    if (ifscCode !== undefined) indiaBankQR.ifscCode = ifscCode || null;

    // Handle QR code image update
    if (req.files && req.files.qrCode) {
      const file = req.files.qrCode;
      
      // Delete old QR code from Cloudinary if exists
      if (indiaBankQR.qrCodeUrl) {
        try {
          await deleteFromCloudinary(indiaBankQR.qrCodeUrl);
        } catch (deleteError) {
          console.error('Error deleting old India bank QR from Cloudinary:', deleteError);
          // Continue even if deletion fails
        }
      }

      try {
        if (!file.tempFilePath) {
          return res.status(400).json({ error: 'File path is missing' });
        }
        
        const newQrCodeUrl = await uploadToCloudinary(file.tempFilePath);
        
        if (!newQrCodeUrl || typeof newQrCodeUrl !== 'string') {
          throw new Error('Invalid upload result - expected URL string');
        }
        
        indiaBankQR.qrCodeUrl = newQrCodeUrl;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ error: `Failed to upload QR code: ${uploadError.message}` });
      }
    }

    await personalInfo.save();

    res.status(200).json({
      message: 'India bank QR updated successfully',
      indiaBankQR: indiaBankQR,
    });
  } catch (error) {
    console.error('Error updating India bank QR:', error);
    res.status(500).json({ error: 'Failed to update India bank QR' });
  }
};

// Delete India bank QR
export const deleteIndiaBankQR = async (req, res) => {
  try {
    const { id } = req.params;

    let personalInfo = await PersonalInfo.getOrCreate();
    
    if (!personalInfo.indiaBankQRs) {
      return res.status(404).json({ error: 'India bank QR not found' });
    }
    
    const indiaBankQRIndex = personalInfo.indiaBankQRs.findIndex(
      (qr) => qr._id.toString() === id
    );

    if (indiaBankQRIndex === -1) {
      return res.status(404).json({ error: 'India bank QR not found' });
    }

    const indiaBankQR = personalInfo.indiaBankQRs[indiaBankQRIndex];

    // Delete QR code from Cloudinary if exists
    if (indiaBankQR.qrCodeUrl) {
      try {
        await deleteFromCloudinary(indiaBankQR.qrCodeUrl);
      } catch (deleteError) {
        console.error('Error deleting India bank QR from Cloudinary:', deleteError);
        // Continue even if deletion fails
      }
    }

    personalInfo.indiaBankQRs.splice(indiaBankQRIndex, 1);
    await personalInfo.save();

    res.status(200).json({
      message: 'India bank QR deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting India bank QR:', error);
    res.status(500).json({ error: 'Failed to delete India bank QR' });
  }
};

// Update shipping fees
export const updateShippingFees = async (req, res) => {
  try {
    const {
      insideKathmandu,
      outsideKathmandu,
      india,
      otherInternational,
      estimatedDeliveryDays = {},
    } = req.body;

    // Validate that all values are numbers and non-negative
    const fees = {
      insideKathmandu: insideKathmandu !== undefined ? Number(insideKathmandu) : undefined,
      outsideKathmandu: outsideKathmandu !== undefined ? Number(outsideKathmandu) : undefined,
      india: india !== undefined ? Number(india) : undefined,
      otherInternational: otherInternational !== undefined ? Number(otherInternational) : undefined,
    };
    const estimates = {
      insideKathmandu: typeof estimatedDeliveryDays.insideKathmandu === 'string' ? estimatedDeliveryDays.insideKathmandu.trim() : undefined,
      outsideKathmandu: typeof estimatedDeliveryDays.outsideKathmandu === 'string' ? estimatedDeliveryDays.outsideKathmandu.trim() : undefined,
      india: typeof estimatedDeliveryDays.india === 'string' ? estimatedDeliveryDays.india.trim() : undefined,
      otherInternational: typeof estimatedDeliveryDays.otherInternational === 'string' ? estimatedDeliveryDays.otherInternational.trim() : undefined,
    };

    // Check for invalid values
    for (const [key, value] of Object.entries(fees)) {
      if (value !== undefined && (isNaN(value) || value < 0)) {
        return res.status(400).json({ error: `${key} must be a valid non-negative number` });
      }
    }

    let personalInfo = await PersonalInfo.getOrCreate();

    // Initialize shippingFees if it doesn't exist
    if (!personalInfo.shippingFees) {
      personalInfo.shippingFees = {
        insideKathmandu: 0,
        outsideKathmandu: 0,
        india: 0,
        otherInternational: 0,
      };
    }

    // Initialize shippingEstimates if it doesn't exist
    if (!personalInfo.shippingEstimates) {
      personalInfo.shippingEstimates = {
        insideKathmandu: "",
        outsideKathmandu: "",
        india: "",
        otherInternational: "",
      };
    }

    // Update only provided fields
    if (fees.insideKathmandu !== undefined) {
      personalInfo.shippingFees.insideKathmandu = fees.insideKathmandu;
    }
    if (fees.outsideKathmandu !== undefined) {
      personalInfo.shippingFees.outsideKathmandu = fees.outsideKathmandu;
    }
    if (fees.india !== undefined) {
      personalInfo.shippingFees.india = fees.india;
    }
    if (fees.otherInternational !== undefined) {
      personalInfo.shippingFees.otherInternational = fees.otherInternational;
    }

    // Update delivery estimates
    if (estimates.insideKathmandu !== undefined) {
      personalInfo.shippingEstimates.insideKathmandu = estimates.insideKathmandu;
    }
    if (estimates.outsideKathmandu !== undefined) {
      personalInfo.shippingEstimates.outsideKathmandu = estimates.outsideKathmandu;
    }
    if (estimates.india !== undefined) {
      personalInfo.shippingEstimates.india = estimates.india;
    }
    if (estimates.otherInternational !== undefined) {
      personalInfo.shippingEstimates.otherInternational = estimates.otherInternational;
    }

    await personalInfo.save();

    res.status(200).json({
      message: 'Shipping fees updated successfully',
      shippingFees: personalInfo.shippingFees,
      shippingEstimates: personalInfo.shippingEstimates,
    });
  } catch (error) {
    console.error('Error updating shipping fees:', error);
    res.status(500).json({ error: 'Failed to update shipping fees' });
  }
};

