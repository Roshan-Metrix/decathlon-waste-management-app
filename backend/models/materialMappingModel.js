import mongoose from "mongoose";

const materialMappingSchema = new mongoose.Schema(
  {
    materials: [
      {
        _id: false,
        materialType: {
          type: String,
          required: true,
          trim: true,
        },
        officialMaterialType: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
    },
  },
  { timestamps: true },
);

const materialMappingModel =
  mongoose.models.materialMapping ||
  mongoose.model("materialMapping", materialMappingSchema);

export default materialMappingModel;
