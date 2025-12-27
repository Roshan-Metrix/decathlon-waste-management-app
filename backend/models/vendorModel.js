import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
         trim: true
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
    vendorLocation: {
      type: String,
      required: true,
      trim: true,
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
        type: String,
        default: 'vendor'
    },
    isApproved: {
        type: Boolean,
        default: false    
    },
     resetOtp:{
        type:String,
        default:''
    },
    resetOtpExpireAt:{
        type:Number,
        default:0
    },
},
{ timestamps: true }
);

const vendorModel = mongoose.models.vendor || mongoose.model('vendor', vendorSchema);

export default vendorModel;