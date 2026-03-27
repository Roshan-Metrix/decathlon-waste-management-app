# ![DecaWaste Logo](frontend/assets/splash-icon.png) DecaWaste

DecaWaste is a waste transaction management system built for Decathlon operations. It combines a React Native mobile app with an Express and MongoDB backend to help admins, managers, stores, and vendors manage waste collection workflows, OCR-based weight capture, reporting, and transaction analysis.

## Overview

- Mobile app built with Expo and React Native
- Backend API built with Express and MongoDB
- Role-based access for admin, manager, store, and vendor flows
- OCR-assisted weight recognition from captured scale images
- Daily PDF report generation with scheduled email delivery

## Main Features

### Mobile application
- Secure login, logout, password reset OTP, and password change flows
- Role-based navigation and access control
- Admin tools for stores, admins, managers, vendors, and regions
- Material and rate management by region
- Manager transaction workflow with multi-step processing screens
- Vendor-related transaction access and store-level summaries
- Profile management and offline/internet state handling

### Transaction workflow
- Create waste transactions
- Add item-wise material details
- Run calibration and OCR for weight extraction
- Verify credentials and capture vendor signatures
- Review transaction items and billing/export screens
- Filter and inspect store transactions by date range

### Reporting and automation
- Store and transaction analytics screens
- PDF report generation for daily transactions
- Scheduled daily report emails using cron
- Manual API endpoint for daily report generation

## Tech Stack

### Frontend
- Expo 55
- React 19
- React Native 0.83
- React Navigation
- Axios
- Expo Camera, Media Library, File System, Print, Sharing

### Backend
- Node.js
- Express 5
- MongoDB with Mongoose
- JWT authentication
- Nodemailer
- PDFKit
- node-cron
- Multer

## Project Structure

```text
Decathlon_V2.1/
+-- frontend/                # Expo React Native app
|   +-- assets/              # App icons and splash assets
|   +-- src/
|   |   +-- api/             # API client setup
|   |   +-- Components/      # Shared UI components
|   |   +-- context/         # Auth and internet state
|   |   +-- navigation/      # App navigation
|   |   +-- ocr/             # Weight parsing helpers
|   |   +-- screens/         # Admin, manager, auth, profile screens
|   |   +-- utils/           # Storage and permission helpers
|   +-- android/             # Native Android project
+-- backend/
|   +-- config/              # MongoDB, email, templates
|   +-- controllers/         # Route controllers
|   +-- lib/                 # OCR service integrations
|   +-- middlewares/         # Auth and role middleware
|   +-- models/              # Mongoose models
|   +-- routes/              # Auth, transaction, vendor APIs
|   +-- services/            # PDF, email, cron, transaction services
|   +-- utils/               # Report and ID utilities
|   +-- temp/                # Generated report files
+-- README.md
+-- license.txt
```

## Frontend Setup

### Prerequisites
- Node.js LTS
- npm
- Expo CLI optional: `npm install -g expo-cli`
- Android Studio or Expo Go for testing

### Install and run

```bash
cd frontend
npm install
npx expo start
```

Useful scripts:

```bash
npm run start
npm run android
npm run ios
npm run web
```

## Backend Setup

### Prerequisites
- Node.js LTS
- npm
- MongoDB local instance or MongoDB Atlas

### Install and run

```bash
cd backend
npm install
npm start
```

Development mode:

```bash
npm run server
```

The backend starts on `process.env.PORT` or `3000` by default.

## Environment Variables

Create `backend/.env` and configure at least:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URI=http://localhost:8081

SENDER_EMAIL=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
```

Notes:
- `FRONTEND_URI` must match the frontend origin used for API requests.
- Gmail SMTP should use an App Password, not your normal account password.

## API Modules

Base server routes:

- `/api/v1/auth`
- `/api/v1/transaction`
- `/api/v1/vendor`

Examples of supported backend capabilities:

- Authentication and profile endpoints
- Admin registration and management flows
- Store and manager management
- Transaction creation and item handling
- OCR image upload for calibration
- Vendor transaction lookup
- Manual daily report generation

## OCR and Reporting

The project includes OCR-related services for extracting weight readings from uploaded images during transaction calibration. On the backend, reporting services generate daily PDF summaries and can automatically email them to vendors on a scheduled cron job.

Related docs already present in the repo:

- `backend/DAILY_REPORT_SETUP.md`
- `backend/API_DOCUMENTATION.md`
- `backend/INSTALLATION.md`
- `backend/IMPLEMENTATION_SUMMARY.md`
- `backend/QUICK_REFERENCE.md`

## Docker

A Docker Compose file is available in `backend/docker-compose.yml` for running the backend with MongoDB.

From the `backend` directory:

```bash
docker-compose up --build
```

The compose file maps:

- Backend: `4000:4000`
- MongoDB: `27017:27017`

Make sure your `.env` values match the container setup before using Docker.

## Current Status

- Mobile frontend is organized around admin and manager workflows
- Backend includes authentication, transaction, vendor, OCR, and reporting services
- Android native project is committed inside `frontend/android`
- Daily reporting and email automation are implemented in the backend

## Contact

- Email: `roshanpatel12309@gmail.com`
- GitHub: [Roshan-Metrix](https://github.com/Roshan-Metrix)
- LinkedIn: [Roshan Patel](https://www.linkedin.com/in/roshannnn/)

## License

This project includes an MIT license. See `license.txt`.
