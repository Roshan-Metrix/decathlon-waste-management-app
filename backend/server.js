import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'
dotenv.config();
import cookieParser from 'cookie-parser';
import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js'

const app = express();
const port = process.env.PORT || 3000;
connectDB();
const allowedOrigins = process.env.FRONTEND_URI;

app.use(express.json());
app.use(cookieParser());
// app.use(cors({credentials: true}));
app.use(cors({ origin: allowedOrigins, credentials: true }));

// API Endpoints
app.get('/',(req,res) => {
    res.send('API Running...');
})

app.use('/api/auth',authRouter)

app.listen(port,() => {
    console.log(`Server is running at ${port}`)
})