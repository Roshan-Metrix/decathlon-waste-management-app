import mongoose from "mongoose";

const materialRateSchema = new mongoose.Schema(
  {
    state: {
      type: String,
      required: true,
      trim: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "vendor",
      required: true,
    },
    materials: [
      {
        _id: false,
        materialType: {
          type: String,
          required: true,
          trim: true,
        },
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

materialRateSchema.index(
  {state:1, vendor:1},
  {unique: true}
)

const materialRateModel =
  mongoose.models.materialRate ||
  mongoose.model("materialRate", materialRateSchema);

export default materialRateModel;
