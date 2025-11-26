import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import cookieParser from 'cookie-parser';
import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js';
import transactionRouter from './routes/transactionRoutes.js';

const app = express();
const port = process.env.PORT || 3000;
connectDB();

// *** CRITICAL WARNING: This configuration allows ALL origins to access your backend. ***
// *** It is HIGHLY INSECURE for production and should ONLY be used for development/testing. ***

const corsOptions = {
    origin: (origin, callback) => {
        return callback(null, true);
    },
    credentials: true,
};


app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(cookieParser());
app.use(cors(corsOptions));

// API Endpoints
app.get('/',(req,res) => {
    res.send('API Running...');
})

app.use('/api/auth',authRouter)
app.use('/api/manager/transaction',transactionRouter)

app.listen(port,() => {
    console.log(`Server is running at ${port} in ${process.env.NODE_ENV || 'development'} mode.`)
})

// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv'
// dotenv.config();
// import cookieParser from 'cookie-parser';
// import connectDB from './config/mongodb.js';
// import authRouter from './routes/authRoutes.js'
// import transactionRouter from './routes/transactionRoutes.js';

// const app = express();
// const port = process.env.PORT || 3000;
// connectDB();
// const allowedOrigins = "expo://";

// app.use(express.json({limit: '10mb'}));
// app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// app.use(cookieParser());
// // app.use(cors({credentials: true}));
// app.use(cors({ origin: allowedOrigins, credentials: true }));

// // API Endpoints
// app.get('/',(req,res) => {
//     res.send('API Running...');
// })

// app.use('/api/auth',authRouter)
// app.use('/api/manager/transaction',transactionRouter)

// app.listen(port,() => {
//     console.log(`Server is running at ${port}`)
// })
