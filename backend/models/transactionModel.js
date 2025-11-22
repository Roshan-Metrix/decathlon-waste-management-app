import mongoose from "mongoose";

// Sub-schema for items
const itemSchema = new mongoose.Schema(
  {
    itemNo: {
      type: Number,
      required: true,
    },
    materialType: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    weight: {
      type: Number,
      required: true,
    },
    weightSource: {
      type: String,
      enum: ["manually", "system"],
      required: true,
    },
  },
  {
    timestamps: true,
    _id: false,
  }
);

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    managerName: {
      type: String,
      required: true,
    },
    vendorName: {
      type: String,
      required: true,
    },
    calibration: {
      image: {
        type: String,
      },
    },
    store: {
      storeId: {
        type: String,
        required: true,
      },
      storeName: {
        type: String,
        required: true,
      },
      storeLocation: {
        type: String,
        required: true,
      },
    },
    items: [itemSchema],
  },
  { timestamps: true }
);

const transactionModel = mongoose.model("transaction", transactionSchema);

export default transactionModel;
