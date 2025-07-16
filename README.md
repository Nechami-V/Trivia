# Aramaic Trivia Game

A cross-platform trivia game for learning Aramaic - the language of the Talmud

## Project Structure

```
trivia/
 client/          # Expo Frontend (React Native + Web)
 server/          # Node.js Backend with Express
 shared/          # Shared code (types, interfaces)
 README.md
```

## Features

### Game Screens
1. **Settings Screen** - Difficulty level (fast/slow), pronunciation (Ashkenazi/Sephardic)
2. **About Screen** - Game rules and information
3. **Leaderboard Screen** - All users scores and rankings
4. **Game Screen** - Main game with animations
5. **Admin Panel** - Content management system

### Game Rules
- **3 lives** at game start
- **10 seconds** normal mode, **5 seconds** fast mode
- **Bonus life** every 50 correct answers
- **4 options** per question (one correct)
- **Audio pronunciation** with dialect options
- **Animations** and sound effects

## Getting Started

### Client
```bash
cd client
npm run web      # Web version
npm run android  # Android app
npm run ios      # iOS app
```

### Server
```bash
cd server
npm run dev      # Development mode
npm run build    # Production build
npm start        # Start production server
```

## Technologies

### Frontend
- **Expo** + **React Native** (cross-platform)
- **TypeScript** for type safety
- **Expo Audio** for pronunciation
- **React Navigation** for screen navigation
- **Reanimated** for smooth animations
- **AsyncStorage** for local storage
- **Zustand** for state management

### Backend
- **Node.js** + **Express** + **TypeScript**
- **MongoDB** + **Mongoose** for database
- **JWT** for authentication
- **Multer** for audio file uploads
- **Bcrypt** for password hashing
- **Rate Limiting** for security
