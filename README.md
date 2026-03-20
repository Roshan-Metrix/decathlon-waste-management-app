# ![Decathlon Logo](frontend/assets/splash-icon.png) DecaWaste

A comprehensive mobile application for warehouse waste management operations for Decathlon Company featuring **advanced OCR (Optical Character Recognition)** for automated weight detection from digital scales and measuring devices.

## 🌟 Key Features

### Core Application
- **🔐 Multi-role Authentication** - Admin, Manager, Vendor access levels
- **📊 Transaction Management** - Complete waste transaction lifecycle
- **🏪 Store Management** - Add, edit, monitor waste collection stores
- **📈 Data Analytics** - Comprehensive reporting and insights
- **👥 User Management** - Role-based administration

### 🆕 OCR Weight Detection System
- **📷 Real-time Camera Capture** - Direct weight reading from digital scales
- **🖼️ Gallery Integration** - Process existing images of weight displays
- **🧠 Smart AI Recognition** - Multi-layer OCR with intelligent parsing
- **✏️ Manual Fallback** - Seamless manual entry when OCR fails
- **💾 Secure Data Storage** - Automatic backend storage with metadata
- **📱 Cross-platform** - Optimized for iOS and Android devices

---

## Status
- Development: In active development (work in progress)
- Platform: Expo (React Native)
- Backend: Node.js/Express (REST API)

## Highlights
- Clean, mobile-first UI optimized for shopping and product discovery
- Expo-managed workflow for fast iteration and testing
- Modular folder structure to scale features and teams
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
- frontend/ — Expo app
  - assets/ — icons, images (logo at frontend/assets/icon.png)
  - src/ — app source code (screens, components, navigation, services)
- docs/ — design and specs
- scripts/ — helper scripts

## Contributing
Contributions welcome. Please:
1. Fork the repo
2. Create a feature branch
3. Open a PR with description and screenshots
4. Follow code style and include tests where applicable

## License
MIT — see LICENSE file for details. [MIT License](license.txt)

## Contact
For product or design queries, link to Decathlon stakeholders or internal channels.

Note: This is an internal-in-development app for Decathlon.

> **Contact Information**
>
> For any inquiries or support, please reach out to developer:
>
> - **Email:** roshanpatel12309@gmail.com
> - **GitHub:** [Roshan-Metrix](https://github.com/Roshan-Metrix)
> - **LinkedIn:** [Roshan Patel](https://www.linkedin.com/in/roshannnn/)

---
*This README was generated to provide an overview of the Decathlon Mobile app - DecaWaste prototype.*