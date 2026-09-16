import mongoose from "mongoose";

const materialMappingSchema = new mongoose.Schema(
  {
    materialRateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "materialRate",
      required: true,
      index: true,
    },
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
      required: true,
    },
  },
  { timestamps: true },
);

const materialMappingModel =
  mongoose.models.materialMapping ||
  mongoose.model("materialMapping", materialMappingSchema);

export default materialMappingModel;
