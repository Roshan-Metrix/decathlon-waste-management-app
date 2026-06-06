import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  storeId: { type: String, required: true },
  dateString: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

// Compound index to make lookup and increments instantaneous
counterSchema.index({ storeId: 1, dateString: 1 }, { unique: true });

const counterModel = mongoose.models.counter || mongoose.model("counter", counterSchema);

export default counterModel;