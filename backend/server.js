import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'
dotenv.config();
import cookieParser from 'cookie-parser';
import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js'
import transactionRouter from './routes/transactionRoutes.js';

const app = express();
const port = process.env.PORT || 3000;
connectDB();

app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const allowedOrigins = [
  process.env.FRONTEND_URI,
  'http://localhost:5173',
];

app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));

// API Endpoints
app.get('/',(req,res) => {
    res.send('API Running...');
})

app.use('/api/auth',authRouter)
app.use('/api/manager/transaction',transactionRouter)

app.listen(port,() => {
    console.log(`Server is running at ${port}`)
})