import mongoose from "mongoose";

const BankQRSchema = new mongoose.Schema({
  bankName: {
    type: String,
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
  },
  accountHolderName: {
    type: String,
    required: true,
  },
  swiftCode: {
    type: String,
    default: null,
  },
  qrCodeUrl: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

const FonePayQRSchema = new mongoose.Schema({
  qrCodeUrl: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

const PersonalInfoSchema = new mongoose.Schema({
  fonepayQR: {
    type: FonePayQRSchema,
    default: null,
  },
  bankQRs: {
    type: [BankQRSchema],
    default: [],
    validate: {
      validator: function(v) {
        return v.length <= 3;
      },
      message: 'Maximum 3 bank QR codes allowed'
    }
  },
  shippingFees: {
    insideKathmandu: {
      type: Number,
      default: 0,
      min: 0,
    },
    outsideKathmandu: {
      type: Number,
      default: 0,
      min: 0,
    },
    india: {
      type: Number,
      default: 0,
      min: 0,
    },
    otherInternational: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
}, {
  timestamps: true,
});

// Ensure only one personal info document exists
PersonalInfoSchema.statics.getOrCreate = async function() {
  let personalInfo = await this.findOne();
  if (!personalInfo) {
    personalInfo = await this.create({});
  }
  return personalInfo;
};

const PersonalInfo = mongoose.model("PersonalInfo", PersonalInfoSchema);

export default PersonalInfo;

