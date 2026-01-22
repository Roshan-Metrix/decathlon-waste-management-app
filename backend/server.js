import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'
dotenv.config();
import cookieParser from 'cookie-parser';
import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js'
import transactionRouter from './routes/transactionRoutes.js';
import vendorRouter from './routes/vendorRoutes.js';

const app = express();
const port = process.env.PORT || 3000;
connectDB();

app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const allowedOrigins = [
  'http://ec2-3-109-207-206.ap-south-1.compute.amazonaws.com:3000',
  'http://localhost:5173',
];

app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));

// API Endpoints
app.get('/',(req,res) => {
    res.send('API Running...');
})

app.use('/api/v1/auth',authRouter)
app.use('/api/v1/manager/transaction',transactionRouter)
app.use('/api/v1/vendor',vendorRouter)

app.listen(port,() => {
    console.log(`Server is running at ${port}`)
})