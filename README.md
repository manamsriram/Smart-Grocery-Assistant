# Smart Grocery Assistant 🛒

A comprehensive mobile application built with React Native and Expo that helps users manage their grocery shopping, track pantry items, reduce food waste, and discover recipes based on available ingredients.

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white) ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black) ![iOS](https://img.shields.io/badge/iOS-000000?style=for-the-badge&logo=ios&logoColor=white) ![Android](https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white)

## Features

### Current Features

### 📝 Shopping Lists
- Create and manage multiple grocery lists
- Add items with quantities and categories
- Check off items as you shop

### 🥫 Pantry Management
- Track items in your pantry with expiration dates
- Categorize items for easy organization

### 🍳 Recipe Suggestions
- Discover recipes based on available pantry items
- Filter by dietary preferences (healthy, quick meals)
- View recipes that use expiring ingredients
- Detailed cooking instructions and ingredient lists

### Planned Features (Future Development)

> The following features are planned for future releases:

- **List Sharing**: Share lists with family members
- **Smart Suggestions**: Personalized suggestions based on shopping history
- **Favorite Recipes**: Save and organize favorite recipes
- **Smart Notifications**:
  - Expiration date reminders
  - Shopping list reminders
  - Recipe suggestions based on inventory
- **Auto-Update Pantry**: Automatically update pantry when items are purchased
- **Expense Tracking**: Track and analyze grocery spending with detailed reports and budgeting tools
## Technology Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Backend**: Firebase (Firestore, Authentication)
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Context API
- **UI Components**: React Native Elements

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

1. Clone the repository
```bash
git clone https://github.com/manamsriram/Smart-Grocery-Assistant.git
cd Smart-Grocery-Assistant
```

2. Install dependencies
```bash
npm install
```

3. Set up Firebase configuration
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore and Authentication
   - Update `firebaseConfig.ts` with your credentials

4. Start the development server
```bash
npx expo start
```

5. Run on your device
   - Scan the QR code with Expo Go app (iOS/Android)
   - Or press `i` for iOS Simulator or `a` for Android Emulator

## Project Structure

```
Smart-Grocery-Assistant/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx                    → User authentication login form
│   │   └── signup.tsx                   → User account registration form
│   ├── components/
│   │   ├── AuthHeader.tsx               → Header shown auth screens
│   │   ├── BodySubtitle.tsx             → Secondary text body component
│   │   ├── BodyTitle.tsx                → Primary title text component
│   │   ├── Header.tsx                   → Main app header navigation bar
│   │   ├── InputModal.tsx               → Modal form input component
│   │   ├── PrimaryButton.tsx            → Main application button component
│   │   └── TabBar.tsx                   → Bottom navigation tab bar
│   ├── list/
│   │   ├── [id]/
│   │   │   └── add-list-item.tsx        → Add items shopping list screen
│   │   └── [id].tsx                     → Individual shopping list detail
│   ├── pantry/
│   │   └── add-item.tsx                 → Add items pantry inventory
│   ├── recipe/
│   │   └── [id].tsx                     → Individual recipe detail screen
│   ├── _layout.tsx                      → Root navigation stack layout
│   ├── account.tsx                      → User account settings screen
│   ├── index.tsx                        → Welcome splash screen
│   ├── lists.tsx                        → All shopping lists view
│   ├── pantry.tsx                       → Pantry inventory management screen
│   ├── profile.tsx                      → User profile information screen
│   └── recipes.tsx                      → Recipe discovery and listing
├── context/
│   └── ThemeContext.tsx                 → Light dark system theme provider
├── theme/
│   └── colors.ts                        → Color palette theme definitions
├── admin-scripts/
│   └── importItems.js                   → Script import data initialization
├── assets/
│   ├── images/
│   ├── app-icon.png                     → App icon for store
│   ├── apple.png                        → Apple logo image
│   ├── cheese.png                       → Cheese icon image
│   ├── mylist-logo.png                  → Application logo image
│   └── welcomePage-bg-pic.png           → Welcome screen background
├── app.json                             → Expo app configuration file
├── eslint.config.js                     → ESLint linting configuration
├── expo-env.d.ts                        → Expo environment type definitions
├── firebaseConfig.ts                    → Firebase initialization settings
├── metro.config.ts                      → Metro bundler configuration
├── package.json                         → Project dependencies and scripts
├── tsconfig.json                        → TypeScript configuration options
└── README.md                            → Project documentation readme
```
## Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser
- `npm run reset-project` - Reset to clean project state

## Firebase Setup

This app uses Firebase for backend services:

1. **Authentication**: Email/password authentication
2. **Firestore**: Real-time database for storing:
   - User profiles
   - Shopping lists
   - Pantry items
   - Recipes and favorites

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Forked from [tringo286/Smart-Grocery-Assistant](https://github.com/tringo286/Smart-Grocery-Assistant)
- Built with [Expo](https://expo.dev/)
- Recipe API integration for smart suggestions [TheMealDB](https://www.themealdb.com/)

## Contact

For questions or support, please open an issue in the GitHub repository.
