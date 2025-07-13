# City Pulse - Local Events Explorer

A React Native app that helps users discover local events and activities in their area. Built with Expo and featuring modern authentication, theming, and localization.

## 🎯 Features

### Core Features
- **Event Discovery**: Search and browse local events using the Ticketmaster Discovery API
- **Event Details**: View comprehensive event information including venue, pricing, and location
- **Favorites**: Save and manage favorite events locally
- **User Profiles**: Display user profile images and information

### Authentication & Security
- **Firebase Authentication**: Secure email/password registration and login
- **Biometric Login**: Fingerprint/Face ID authentication for quick access (mobile only)
- **Real User Validation**: Only registered users can login (no dummy data)
- **Firebase Firestore**: User profiles stored securely in the cloud

### UI/UX Features
- **Multi-language Support**: English and Arabic with RTL layout support
- **Theme Support**: Light and dark mode themes
- **Bottom Navigation**: Easy navigation between Home and Profile screens
- **Responsive Design**: Optimized for both mobile and web platforms
- **Loading States**: Visual feedback during data fetching and operations

## 🛠 Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation v6 with bottom tabs and stack navigation
- **Authentication**: Firebase Auth v9+ with Firestore database
- **Biometrics**: expo-local-authentication
- **Storage**: Firebase Firestore for user data, AsyncStorage for local preferences
- **Styling**: React Native StyleSheet with dynamic theming
- **Internationalization**: Custom i18n implementation with RTL support
- **Icons**: @expo/vector-icons (Ionicons)
- **Image Generation**: a0.dev Image Generation API

## 🚀 Getting Started

### Prerequisites

1. **Node.js & npm**: Install from [nodejs.org](https://nodejs.org/)
2. **Expo CLI**: 
   ```bash
   npm install -g expo-cli
   ```
3. **Firebase Project**: Create a project at [Firebase Console](https://console.firebase.google.com)

### Firebase Setup

1. **Create Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project
   - Enable Authentication and Firestore Database

2. **Configure Authentication**:
   - Go to Authentication > Sign-in method
   - Enable Email/Password provider

3. **Configure Firestore Database**:
   - Go to Firestore Database
   - Create database in production mode
   - Set up security rules (start with test mode for development)

4. **Get Firebase Configuration**:
   - Go to Project Settings > General
   - Add a Web app to get configuration
   - Copy the config object

5. **Update Firebase Config**:
   - Open `config/firebase.ts`
   - Replace the placeholder values with your Firebase configuration:

   ```typescript
   const firebaseConfig = {
     apiKey: "your-actual-api-key",
     authDomain: "your-project-id.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project-id.appspot.com",
     messagingSenderId: "123456789",
     appId: "your-app-id"
   };
   ```

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd city-pulse-events
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   expo start
   ```

4. **Run on device/simulator**:
   - **Mobile**: Scan QR code with Expo Go app
   - **iOS Simulator**: Press `i` in terminal
   - **Android Emulator**: Press `a` in terminal
   - **Web**: Press `w` in terminal

## 📁 Project Structure

```
city-pulse-events/
├── components/           # Reusable UI components
│   └── EventCard.tsx    # Event display component
├── config/              # Configuration files
│   └── firebase.ts      # Firebase configuration
├── hooks/               # Custom React hooks
│   ├── useAuth.ts       # Authentication logic
│   ├── useEvents.ts     # Event data management
│   ├── useFavorites.ts  # Favorites management
│   ├── useLanguage.tsx  # Language/RTL support
│   ├── useTheme.tsx     # Theme management
│   └── useUserProfile.ts # User profile management
├── screens/             # Screen components
│   ├── SplashScreen.tsx # App loading screen
│   ├── LoginScreen.tsx  # Authentication screen
│   ├── HomeScreen.tsx   # Main events listing
│   ├── EventDetailScreen.tsx # Event details
│   └── ProfileScreen.tsx # User profile & settings
└── App.tsx             # Main app component
```

## 🔧 Configuration

### Environment Variables
The app uses these APIs and services:
- **Firebase**: User authentication and data storage
- **Ticketmaster Discovery API**: Event data (may require API key)
- **a0.dev Image Generation API**: Dynamic image generation

### Customization
- **Theme Colors**: Modify `hooks/useTheme.tsx`
- **Language Strings**: Update `hooks/useLanguage.tsx`
- **Navigation**: Configure in `App.tsx`

## 📱 Usage

### For Users
1. **Registration**: Create account with email/password
2. **Login**: Use email/password or biometric authentication
3. **Browse Events**: Search and explore local events
4. **View Details**: Tap events for detailed information
5. **Save Favorites**: Heart icon to save events
6. **Profile Management**: Update profile info and preferences
7. **Settings**: Toggle theme (light/dark) and language (EN/AR)

### Biometric Setup
1. Login with email/password first
2. Go to Profile > Settings
3. Enable "Biometric Login"
4. Enter your password to confirm
5. Use fingerprint/Face ID for future logins

## 🌐 Platform Support

- **iOS**: Full feature support including biometrics
- **Android**: Full feature support including biometrics  
- **Web**: Core features (biometrics not available)

## 🔒 Security Features

- Firebase Authentication with proper error handling
- Secure biometric authentication storage
- User data validation and sanitization
- Only registered users can access the app
- Secure logout and session management

## 🛠 Development

### Adding New Features
1. Create custom hooks for business logic
2. Build reusable components
3. Update theme and language files as needed
4. Test on multiple platforms

### Firebase Security Rules
For production, update Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Configuration Error**:
   - Verify config values in `config/firebase.ts`
   - Check Firebase project settings

2. **Biometric Not Working**:
   - Only available on physical devices
   - Ensure biometrics are enrolled on device
   - Web platform doesn't support biometrics

3. **Login Issues**:
   - Check internet connection
   - Verify Firebase Authentication is enabled
   - Ensure user is registered before login

4. **Build Errors**:
   - Run `expo start --clear` to clear cache
   - Delete node_modules and reinstall: `rm -rf node_modules && npm install`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- React Native and Expo teams
- Firebase for backend services
- Ticketmaster for event data
- a0.dev for development environment and APIs