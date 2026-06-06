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
    materialRate: {
      type: Number,
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
      unique: true, // Automatically creates a unique index
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
      error:{
        type: Number,
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
      storeState: {
        type: String,
        required: true,
      }
    },
    items: [itemSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "creatorModel",
    },
    creatorModel: {
      type: String,
      required: true,
      enum: ["store", "manager"],
    },
  },
  { timestamps: true }
);


// Indexes to optimize queries
// Optimizes 'getAllRelatedStoresTransactions' and 'ParticularTransactionController'
transactionSchema.index({ "store.storeId": 1, vendorName: 1 });

// Optimizes 'getAllRelatedStores'
transactionSchema.index({ vendorName: 1 });

// Handles store + date range queries instantly
transactionSchema.index({ "store.storeId": 1, createdAt: 1 });

transactionSchema.index({ createdAt: -1 });

const transactionModel = mongoose.model("transaction", transactionSchema);

export default transactionModel;
