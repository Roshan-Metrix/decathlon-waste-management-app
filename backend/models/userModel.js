import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'manager', 'staff', 'vendor'],
        required: true 
    },
    isApproved: {
        type: Boolean,
        default: false    
    }
});

const userModel = mongoose.models.user || mongoose.model('user', userSchema);
export default userModel;
