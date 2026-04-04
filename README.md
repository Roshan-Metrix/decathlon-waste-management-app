# ![Decathlon Logo](frontend/assets/splash-icon.png) DecaWaste

A comprehensive mobile application for warehouse waste management operations for Decathlon Company featuring **advanced OCR (Optical Character Recognition)** for automated weight detection from digital scales and measuring devices.

## 🌟 Key Features

### Core Application
- **🔐 Multi-role Authentication** - Admin, Manager, Vendor, and Store access levels with secure JWT-based authentication
- **📊 Transaction Management** - Complete waste transaction lifecycle including creation, item addition, and status tracking
- **🏪 Store Management** - Add, edit, and monitor waste collection stores with location and state details
- **📈 Data Analytics** - Comprehensive reporting and insights with charts and dashboards
- **👥 User Management** - Role-based administration for admins, managers, vendors, and stores
- **📧 Email Notifications** - Automated email services for user registrations, password resets, and daily reports
- **📄 PDF Generation** - Automated PDF reports for transactions and daily summaries
- **⏰ Scheduled Tasks** - Cron-based automation for daily report generation and email distribution

### 🆕 OCR Weight Detection System
- **📷 Real-time Camera Capture** - Direct weight reading from digital scales using device camera
- **🖼️ Gallery Integration** - Process existing images of weight displays from device gallery
- **🧠 Smart AI Recognition** - Multi-layer OCR using Google Gemini API with intelligent parsing for accurate weight extraction
- **✏️ Manual Fallback** - Seamless manual entry option when OCR fails or is unavailable
- **💾 Secure Data Storage** - Automatic backend storage with metadata preservation
- **📱 Cross-platform** - Optimized for iOS and Android devices with Expo framework

### Additional Features
- **🌐 Offline Support** - Network connectivity detection and offline handling
- **📍 Location Services** - GPS-based location tracking for store visits
- **📊 Charts and Visualizations** - Interactive charts for data analysis using react-native-chart-kit
- **🖊️ Digital Signatures** - Signature capture for transaction approvals
- **🔄 Data Synchronization** - Secure data sync between mobile app and backend
- **🛡️ Security** - Password hashing with bcrypt, secure API endpoints, and middleware protection
- **📱 Responsive UI** - Mobile-first design with Tailwind CSS styling
- **🔍 Search and Filtering** - Advanced search capabilities for transactions and users
- **📅 Date and Time Management** - Date picker and timestamp formatting utilities

---

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js for REST API
- **MongoDB** with Mongoose for data storage
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Nodemailer** for email services
- **PDFKit** for PDF generation
- **Sharp** for image processing
- **Node-cron** for scheduled tasks
- **Multer** for file uploads
- **Google Gemini API** for OCR processing

### Frontend
- **React Native** with Expo for cross-platform mobile app
- **React Navigation** for app navigation
- **Axios** for API calls
- **AsyncStorage** for local data storage
- **Expo Camera** for camera functionality
- **Expo Media Library** for gallery access
- **React Native Chart Kit** for data visualization
- **React Native Signature Canvas** for digital signatures
- **Tailwind CSS** for styling

---

## Status
- Development: In active development (work in progress)
- Platform: Expo (React Native)
- Backend: Node.js/Express (REST API)

## Highlights
- Clean, mobile-first UI optimized for warehouse operations
- Expo-managed workflow for fast iteration and testing
- Modular folder structure to scale features and teams
- Advanced OCR integration for automated data entry
- Comprehensive reporting system with automated email distribution
- Prepared for CI, automated testing and easy deployment

## Quickstart (local)
Prerequisites:
- Node LTS
- npm or yarn
- Docker (optional — for backend)
- Expo CLI: `npm install -g expo-cli` (optional — you can use `npx`)

<b>Steps:</b>
### npm or yarn install
1. Clone the repo
2. cd into the project root
3. Install dependencies
    - npm: `npm install`
    - yarn: `yarn`
4. Start the backend server
    - `cd backend`
    - `node server.js`
5. Start the app
    - `cd frontend`
    - `npx expo start`
6. Open on device or simulator using the Expo app / emulator

Or Docker (Backend):
### Docker
1. Ensure Docker is installed and running
2. From the project root, build and start containers:
   - `docker-compose up --build`
3. Access the app via Expo as above

## Development tips
- Use the Expo dev tools to reload and debug
- Keep environment secrets out of source; use `.env` and `.env.example`
> **Note:** Use [Gmail App Passwords](https://support.google.com/accounts/answer/185833) for secure email sending.
- Follow feature-branch workflow and open PRs for review

## Project structure (high level)
- frontend/ — Expo React Native mobile app
  - assets/ — App icons, images, and splash screens
  - src/ — Main application source code
    - api/ — API service functions for backend communication
    - Components/ — Reusable UI components (Alert, Input, LoadingScreen, etc.)
    - context/ — React contexts for state management (Auth, Internet connectivity)
    - lib/ — Utility libraries (timestamp formatting, password generation, image preview)
    - navigation/ — App navigation configuration and stack definitions
    - ocr/ — OCR-related utilities for weight parsing
    - screens/ — App screens organized by role
      - Admin/ — Admin-specific screens (ManageAdmin, ManageManager, ManageRegion)
      - Manager/ — Manager-specific screens
      - User/ — General user screens (Login, Home, Profile, etc.)
    - utils/ — Additional utilities (permissions, storage helpers)
  - android/ — Android-specific build configurations and native code
  - App.js — Main app component
  - package.json — Frontend dependencies and scripts
- backend/ — Node.js Express server
  - controllers/ — API endpoint handlers
  - models/ — MongoDB schemas
  - services/ — Business logic (OCR, email, PDF, cron)
  - config/ — Configuration files (email templates, DB, etc.)
  - middlewares/ — Authentication and authorization middleware
  - routes/ — API routes
  - utils/ — Utility functions
- docs/ — design and specs
- scripts/ — helper scripts

## Documentation
For detailed information about the application, refer to the following documentation files:

- **[API Documentation](temp/Transactions_Documentations/API_DOCUMENTATION.md)** - Complete API endpoints and usage guide
- **[Implementation Summary](temp/Transactions_Documentations/IMPLEMENTATION_SUMMARY.md)** - Overview of the implementation details
- **[Installation Guide](temp/Transactions_Documentations/INSTALLATION.md)** - Step-by-step installation instructions
- **[Daily Report Setup](temp/Transactions_Documentations/DAILY_REPORT_SETUP.md)** - Configuration for automated daily reports
- **[Quick Reference](temp/Transactions_Documentations/QUICK_REFERENCE.md)** - Quick reference guide for common tasks

## Contributing
Contributions welcome. Please:
1. Fork the repo
2. Create a feature branch
3. Open a PR with description and screenshots
4. Follow code style and include tests where applicable

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
