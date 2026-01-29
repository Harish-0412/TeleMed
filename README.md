# TeleMed - Rural Healthcare Platform

A comprehensive telemedicine platform designed specifically for rural healthcare delivery with offline capabilities, low-bandwidth optimization, and local facilitator support.

## 🚀 Features

### 🏥 **Core Healthcare Services**
- **Assisted Consultations** - Local facilitators help patients during video consultations
- **Low-Bandwidth Teleconsult** - Optimized for 2G/3G networks in remote areas
- **AI Eye Abnormality Detection** - Advanced AI system for detecting eye diseases
- **Smart Appointment Scheduling** - Intelligent doctor availability management
- **E-Prescription & Pharmacy** - Digital prescriptions with local pharmacy integration

### 🤖 **AI-Powered Features**
- **Groq API Integration** - Real-time medical assistance using llama-3.1-8b-instant
- **Eye Disease Detection** - Detects cataracts, glaucoma, diabetic retinopathy, and more
- **Prescription Generation** - AI-powered prescription recommendations
- **Medical Report Generation** - Comprehensive consultation reports for doctors

### 🌐 **Technical Highlights**
- **Offline-First Architecture** - Works without internet, syncs when connected
- **Progressive Web App** - Runs on any device from smartphones to tablets
- **Real-time Communication** - WebSocket-based updates and notifications
- **Multi-Database Support** - SQLite for development, PostgreSQL for production
- **Firebase Authentication** - Secure user management and access control

## 🛠️ Technology Stack

### Frontend
- **React 18.3.1** with TypeScript
- **Tailwind CSS** for styling
- **Radix UI** components
- **Framer Motion** & **GSAP** for animations
- **Three.js** for 3D graphics
- **Wouter** for routing

### Backend
- **Express.js 5.0.1** with TypeScript
- **Drizzle ORM** for database management
- **Firebase** for authentication
- **WebSocket** for real-time communication
- **Multer** for file uploads

### Database
- **PostgreSQL** (Production)
- **SQLite** (Development)
- **Firebase Firestore** (User data)

### AI/ML
- **Groq API** (llama-3.1-8b-instant)
- **MediaPipe** for eye image analysis
- **Teachable Machine** for disease detection

## 📱 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Harish-0412/TeleMed.git
   cd TeleMed
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Go to: **http://localhost:5000**
   - The application will load directly on the home page

### Environment Setup

Create a `.env` file in the root directory:
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=your_database_url
FIREBASE_CONFIG=your_firebase_config
GROQ_API_KEY=your_groq_api_key
```

## 🏗️ Project Structure

```
TeleMed/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── contexts/      # React contexts
│   │   └── public/        # Static assets
├── server/                # Express backend
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   └── database/         # Database schemas
├── shared/               # Shared types and utilities
└── docs/                # Documentation
```

## 🎯 Key Features Breakdown

### 1. Assisted Consultations
- Local healthcare facilitators assist patients
- Real-time language translation
- Cultural sensitivity training
- Emergency escalation protocols

### 2. Low-Bandwidth Teleconsultation
- Text-first interface with optional audio
- Compressed image sharing
- Offline mode with auto-sync
- Progressive web app compatibility

### 3. AI Eye Abnormality Detection
- Real-time eye image analysis
- Detects 5 major conditions:
  - Healthy Eye
  - Cataract
  - Diabetic Retinopathy
  - Retinitis Pigmentosa
  - Myopia
- Confidence scoring and recommendations

### 4. Smart Scheduling
- Real-time doctor availability
- Automated reminders via SMS/WhatsApp
- Queue management for walk-ins
- Multi-location clinic coordination

### 5. E-Prescription System
- Digital prescription generation
- Local pharmacy inventory integration
- Generic medication alternatives
- Medication adherence tracking

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type checking
- `npm run db:push` - Push database schema

### Database Management

The application supports both SQLite (development) and PostgreSQL (production):

```bash
# Push schema changes
npm run db:push

# Generate migrations
npx drizzle-kit generate

# Apply migrations
npx drizzle-kit migrate
```

## 🌍 Deployment

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set environment variables**
   ```bash
   export NODE_ENV=production
   export DATABASE_URL=your_production_db_url
   ```

3. **Start the server**
   ```bash
   npm start
   ```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Groq** for AI API services
- **Firebase** for authentication and database
- **Radix UI** for accessible components
- **Tailwind CSS** for styling framework
- **MediaPipe** for computer vision capabilities

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Email: support@telemed.com
- Documentation: [docs.telemed.com](https://docs.telemed.com)

---

**TeleMed** - Empowering rural healthcare through technology 🏥💚