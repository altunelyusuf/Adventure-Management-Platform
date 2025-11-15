# Adventure Platform - Mobile Application

React Native mobile application for iOS and Android.

## Features

- 📱 Cross-platform (iOS & Android)
- 🗺️ GPS tracking and real-time location
- 📷 Camera integration for checkpoint validation
- 🔔 Push notifications
- 📴 Offline mode support
- 🎨 Modern UI with React Native

## Tech Stack

- **React Native 0.73** - Mobile framework
- **TypeScript** - Type safety
- **Redux Toolkit** - State management
- **React Navigation** - Routing and navigation
- **React Native Maps** - Map visualization
- **Geolocation Services** - GPS tracking
- **Axios** - API communication
- **AsyncStorage** - Local data persistence

## Prerequisites

- Node.js 18+ and npm
- **iOS Development:**
  - macOS
  - Xcode 14+
  - CocoaPods
- **Android Development:**
  - Android Studio
  - Android SDK 33+
  - Java JDK 11+

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. iOS Setup

```bash
cd ios
pod install
cd ..
```

### 3. Configure Environment

Create `.env` file:

```env
API_BASE_URL=http://localhost:3000/api
GOOGLE_MAPS_API_KEY=your_key_here
```

### 4. Run the App

**iOS:**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

## Project Structure

```
mobile/
├── src/
│   ├── components/        # Reusable UI components
│   ├── screens/          # Screen components
│   │   ├── auth/         # Login, Register
│   │   ├── quests/       # Quest screens
│   │   ├── profile/      # User profile
│   │   └── map/          # Map screens
│   ├── navigation/       # Navigation configuration
│   ├── services/         # API services
│   ├── store/            # Redux store
│   │   └── slices/       # Redux slices
│   ├── utils/            # Utility functions
│   └── assets/           # Images, fonts, etc.
├── android/              # Android native code
├── ios/                  # iOS native code
├── App.tsx               # Root component
└── index.js              # Entry point
```

## Development

### Running on Device

**iOS:**
1. Connect iPhone via USB
2. Select device in Xcode
3. Run: `npm run ios`

**Android:**
1. Enable USB debugging on device
2. Connect via USB
3. Run: `npm run android`

### Debugging

- **React Native Debugger**: Standalone debugging tool
- **Flipper**: Native debugging tool
- **Console Logs**: `npx react-native log-ios` or `npx react-native log-android`

## Key Features to Implement

### Authentication (Priority 1)
- [ ] Login screen
- [ ] Registration screen
- [ ] JWT token management
- [ ] Biometric authentication

### Quest Features (Priority 1)
- [ ] Quest browsing with search
- [ ] Quest detail with map
- [ ] Start quest flow
- [ ] GPS tracking during quest
- [ ] Checkpoint validation
- [ ] Quest completion

### Camera & Media (Priority 2)
- [ ] Take photos at checkpoints
- [ ] Upload images
- [ ] Image gallery
- [ ] Image preview

### Notifications (Priority 2)
- [ ] Push notification setup
- [ ] Notification center
- [ ] In-app notifications

### Offline Support (Priority 3)
- [ ] Cache quest data
- [ ] Offline map tiles
- [ ] Queue API requests
- [ ] Sync when online

## Permissions Required

### iOS (Info.plist)
- Location When In Use
- Location Always (for background tracking)
- Camera
- Photo Library

### Android (AndroidManifest.xml)
- ACCESS_FINE_LOCATION
- ACCESS_COARSE_LOCATION
- CAMERA
- READ_EXTERNAL_STORAGE
- WRITE_EXTERNAL_STORAGE

## Build for Production

### iOS

1. Open `ios/AdventurePlatform.xcworkspace` in Xcode
2. Select "Generic iOS Device"
3. Product → Archive
4. Distribute to App Store Connect

### Android

```bash
cd android
./gradlew bundleRelease
```

## Performance Optimization

- Use `React.memo` for expensive components
- Implement `FlatList` virtualization
- Lazy load map tiles
- Compress images before upload
- Use native modules for heavy computations

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

## Troubleshooting

### Metro Bundler Issues
```bash
npm start -- --reset-cache
```

### iOS Build Errors
```bash
cd ios
pod deintegrate
pod install
cd ..
```

### Android Build Errors
```bash
cd android
./gradlew clean
cd ..
```

## Contributing

1. Create a feature branch
2. Make changes
3. Test on both iOS and Android
4. Submit pull request

## License

Part of the Adventure Management Platform.
