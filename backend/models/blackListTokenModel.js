import mongoose from "mongoose";

const blackListTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      expires: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const blackListTokenModel = mongoose.model(
  "blacklisttoken",
  blackListTokenSchema,
);

export default blackListTokenModel;
