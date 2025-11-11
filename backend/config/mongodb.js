import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("Database Connected");
    });

    mongoose.connection.on("error", (err) => {
      console.log("Mongoose Error:", err);
    });

    await mongoose.connect(process.env.MONGODB_URI);
  } catch (err) {
    console.error("Database Connection Error:", err);
  }
};

export default connectDB;
