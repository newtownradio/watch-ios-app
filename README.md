# Watch Style iOS

A premium marketplace for pre-owned luxury timepieces, built with Angular and Capacitor for iOS deployment.

## 🚀 Features

### **Core Functionality**
- **AI-Powered Pricing**: Advanced algorithms provide accurate market-based pricing
- **2-Month Auction System**: Extended bidding windows for better deals
- **Expert Verification**: Third-party authentication for all timepieces
- **Secure Transactions**: Encrypted payment processing with buyer/seller protection
- **Real-time Messaging**: Direct communication between buyers and sellers

### **Authentication & Security**
- **User Authentication**: Secure login/registration system
- **ID Verification**: Government ID upload and verification
- **Protected Routes**: All features require authentication
- **Data Persistence**: Local storage with secure data management

### **User Experience**
- **Responsive Design**: Optimized for mobile and desktop
- **Intuitive Navigation**: Clear authentication flow and menu system
- **Real-time Updates**: Live bidding and messaging
- **Demo Accounts**: Pre-configured accounts for testing

## 🛠️ Technology Stack

- **Frontend**: Angular 18
- **Mobile**: Capacitor for iOS deployment
- **Styling**: SCSS with modern design patterns
- **State Management**: Angular services with local storage
- **Build Tool**: Angular CLI

## 📱 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Xcode (for iOS development)
- iOS Simulator or device

### Development Setup
```bash
# Clone the repository
git clone https://github.com/newtownradio/watch-ios-app.git
cd watch-ios-app

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Sync with iOS
npx cap sync ios

# Open in Xcode
npx cap open ios
```

### iOS Deployment
```bash
# Build the project
npm run build

# Sync with Capacitor
npx cap sync ios

# Open in Xcode for deployment
npx cap open ios
```

## 🔐 Authentication Flow

1. **Splash Page**: Users see "Login" and "Create Account" options
2. **Auth Page**: Secure login/registration with demo accounts available
3. **Protected Features**: All app features require authentication
4. **Hamburger Menu**: Only visible when authenticated

## 📊 Demo Accounts

For testing purposes, the following demo accounts are available:

- **Email**: `demo@watchios.com`
- **Password**: `Demo123!`

Additional test accounts are automatically created on first run.

## 🏗️ Project Structure

```
src/
├── app/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Main application pages
│   │   ├── auth/           # Authentication
│   │   ├── discovery/      # Watch browsing
│   │   ├── sell/           # Listing creation
│   │   ├── account/        # User profile
│   │   ├── messages/       # Messaging system
│   │   ├── notifications/  # User notifications
│   │   └── splash/         # Landing page
│   ├── services/           # Business logic services
│   └── models/             # TypeScript interfaces
├── environments/           # Environment configuration
└── styles.scss            # Global styles
```

## 🔧 Key Services

- **DataPersistenceService**: Handles local storage and data management
- **AiPricingService**: Provides AI-powered pricing recommendations
- **NetworkStatusService**: Monitors connectivity
- **NavigationService**: Manages app navigation and menu state

## 📱 iOS Features

- **Native Integration**: Capacitor for seamless iOS deployment
- **App Store Ready**: Configured for App Store submission
- **Responsive Design**: Optimized for iPhone and iPad
- **Touch Gestures**: Native iOS touch interactions

## 🚀 Deployment

### Development
```bash
npm start
# Visit http://localhost:4200
```

### Production Build
```bash
npm run build
npx cap sync ios
npx cap open ios
```

## 📄 License

This project is proprietary software. All rights reserved.

## 🤝 Contributing

This is a private project. For questions or support, please contact the development team.

---

**Watch Style iOS** - Premium marketplace for pre-owned luxury timepieces. 