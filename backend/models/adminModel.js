import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
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
    role: {
        type: String,
        default: 'admin'
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
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
   },
},
{ timestamps: true }
);

const adminModel = mongoose.models.admin || mongoose.model('admin', adminSchema);
export default adminModel;
