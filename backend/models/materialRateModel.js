import mongoose from "mongoose";

const materialRateSchema = new mongoose.Schema(
  {
    state: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    materials: [
      {
        _id: false,
        materialType: { type: String, required: true },
        rate: { type: Number, required: true },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
    },
  },
  { timestamps: true },
);

const materialRateModel =
  mongoose.models.materialRate || mongoose.model("materialRate", materialRateSchema);
  
export default materialRateModel;
