import mongoose from "mongoose";

const managerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim:true,
    },
    storeId: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      default: "manager",
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    resetOtp: {
      type: String,
      default: "",
    },
    resetOtpExpireAt: {
      type: Number,
      default: 0,
    },
    createdBy: {
       type: mongoose.Schema.Types.ObjectId,
       ref: "admin" || "store",
    },
  },
  { timestamps: true }
);

const managerModel =
  mongoose.models.manager || mongoose.model("manager", managerSchema);
  
export default managerModel;
